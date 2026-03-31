const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { ExpressPeerServer } = require('peer');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// PeerJS Server on the same port
const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: '/peerjs'
});

const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use('/peerjs', peerServer);
app.use(express.static(__dirname));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// ---- In-Memory DB ----
const generateId = () => Math.random().toString(36).substring(2, 10);

const db = {
    users: {},     // userId -> { id, username, password, avatar, status, friends: [], servers: [] }
    servers: {},   // serverId -> { id, name, avatar, ownerId, members: [], channels: [] }
    sessions: {},  // socket.id -> userId
    messages: {},  // roomId -> [{ authorId, text, timestamp }] (Room can be server_channel or user1_user2)
};

const getDmRoomId = (id1, id2) => [id1, id2].sort().join('_');
const voiceRooms = {}; // channelId -> [{ socketId, userId, peerId, username }]

function findSocketByUserId(userId) {
    return Object.keys(db.sessions).find(sId => db.sessions[sId] === userId);
}

io.on('connection', (socket) => {
    console.log(`[+] Socket: ${socket.id}`);

    // ---- AUTH ----
    socket.on('register', ({ username, password, avatar }, callback) => {
        const exists = Object.values(db.users).find(u => u.username.toLowerCase() === username.toLowerCase());
        if (exists) return callback({ success: false, message: 'Bu kullanıcı adı alınmış.' });

        const newUser = {
            id: generateId(),
            username,
            password,
            avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            status: 'online',
            friends: [],
            servers: []
        };
        db.users[newUser.id] = newUser;
        callback({ success: true, user: newUser });
    });

    socket.on('login', ({ username, password }, callback) => {
        const user = Object.values(db.users).find(
            u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
        );
        if (!user) return callback({ success: false, message: 'Hatalı kullanıcı adı veya şifre.' });

        db.sessions[socket.id] = user.id;
        
        const userServers = user.servers.map(sId => db.servers[sId]).filter(Boolean);
        const userFriends = user.friends.map(fId => db.users[fId]).filter(Boolean);

        callback({
            success: true, 
            user: { id: user.id, username: user.username, avatar: user.avatar, status: user.status },
            servers: userServers,
            friends: userFriends
        });
    });

    // ---- SERVERS & FRIENDS ----
    socket.on('create-server', (name, callback) => {
        const uid = db.sessions[socket.id];
        if (!uid) return callback({ success: false });

        const sId = generateId();
        const server = {
            id: sId,
            name: name,
            ownerId: uid,
            members: [uid],
            channels: [
                { id: generateId(), name: 'Genel', type: 'voice' },
                { id: generateId(), name: 'Müzik', type: 'voice' }
            ]
        };
        db.servers[sId] = server;
        db.users[uid].servers.push(sId);
        socket.join(sId);
        callback({ success: true, server });
    });

    socket.on('add-friend', (username, callback) => {
        const uid = db.sessions[socket.id];
        const target = Object.values(db.users).find(u => u.username.toLowerCase() === username.toLowerCase());
        
        if (!target || target.id === uid) return callback({ success: false, message: 'Kullanıcı bulunamadı.' });

        if (!db.users[uid].friends.includes(target.id)) {
            db.users[uid].friends.push(target.id);
            db.users[target.id].friends.push(uid);
        }

        callback({ success: true, friend: target });
    });

    socket.on('get-server-members', (serverId, callback) => {
        const srv = db.servers[serverId];
        if (!srv) return callback([]);
        const members = srv.members.map(mId => db.users[mId]).filter(Boolean);
        callback(members);
    });

    // ---- MESSAGING ----
    socket.on('send-message', ({ text, toId, serverId, channelId }, callback) => {
        const uid = db.sessions[socket.id];
        const roomId = serverId ? `${serverId}_${channelId}` : getDmRoomId(uid, toId);
        
        const msg = { authorId: uid, text, timestamp: Date.now() };
        if (!db.messages[roomId]) db.messages[roomId] = [];
        db.messages[roomId].push(msg);

        if (serverId) {
            socket.to(serverId).emit('receive-message', { ...msg, serverId, channelId });
        } else {
            const targetSocket = findSocketByUserId(toId);
            if (targetSocket) io.to(targetSocket).emit('receive-message', msg);
        }
        callback({ success: true, message: msg });
    });

    socket.on('get-messages', ({ friendId, serverId, channelId }, callback) => {
        const uid = db.sessions[socket.id];
        const roomId = serverId ? `${serverId}_${channelId}` : getDmRoomId(uid, friendId);
        callback(db.messages[roomId] || []);
    });

    // ---- VOICE ----
    socket.on('join-peer', (peerId) => {
        const uid = db.sessions[socket.id];
        if (uid) db.users[uid].peerId = peerId;
    });

    socket.on('get-user-by-peer', (peerId, callback) => {
        const user = Object.values(db.users).find(u => u.peerId === peerId);
        callback(user);
    });

    socket.on('join-voice', ({ channelId }) => {
        const uid = db.sessions[socket.id];
        const user = db.users[uid];
        
        if (!voiceRooms[channelId]) voiceRooms[channelId] = [];
        
        voiceRooms[channelId].push({ socketId: socket.id, userId: uid, peerId: user.peerId });
        socket.join(channelId);
        
        socket.to(channelId).emit('user-joined-voice', { peerId: user.peerId, userId: uid });
        
        // Notify others of joined user
        voiceRooms[channelId].forEach(p => {
            if (p.peerId !== user.peerId) {
                socket.emit('user-joined-voice', { peerId: p.peerId, userId: p.userId });
            }
        });
    });

    socket.on('leave-voice', () => {
        const uid = db.sessions[socket.id];
        const user = db.users[uid];
        
        for (const channelId in voiceRooms) {
            voiceRooms[channelId] = voiceRooms[channelId].filter(p => p.socketId !== socket.id);
            socket.to(channelId).emit('user-left-voice', user.peerId);
        }
    });

    socket.on('disconnect', () => {
        const uid = db.sessions[socket.id];
        if (uid) {
            const user = db.users[uid];
            for (const channelId in voiceRooms) {
                voiceRooms[channelId] = voiceRooms[channelId].filter(p => p.socketId !== socket.id);
                socket.to(channelId).emit('user-left-voice', user.peerId);
            }
        }
        delete db.sessions[socket.id];
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Nexus ready at http://localhost:${PORT}`);
});
