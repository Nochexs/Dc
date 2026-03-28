const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- In-Memory Database ---
const generateId = () => Math.random().toString(36).substring(2, 10);

const db = {
    users: {},     // userId -> { id, username, password, friends: [], servers: [] }
    servers: {},   // serverId -> { id, name, ownerId, members: [], channels: [] }
    sessions: {},  // socket.id -> userId
    dms: {},       // dmRoomId -> [{senderId, text, timestamp, inviteData}]
};

const getDmRoomId = (id1, id2) => [id1, id2].sort().join('_');
const voiceRooms = {}; 

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // --- Authentication ---
    socket.on('register', ({ username, password }, callback) => {
        const exists = Object.values(db.users).find(u => u.username === username);
        if (exists) return callback({ success: false, message: 'Username exists' });
        
        const newUser = {
            id: generateId(),
            username,
            password,
            friends: [],
            servers: []
        };
        db.users[newUser.id] = newUser;
        callback({ success: true, message: 'Registered successfully. Please login.' });
    });

    socket.on('login', ({ username, password }, callback) => {
        const user = Object.values(db.users).find(u => u.username === username && u.password === password);
        if (!user) return callback({ success: false, message: 'Invalid credentials' });
        
        db.sessions[socket.id] = user.id;
        const userServers = user.servers.map(sId => db.servers[sId]).filter(Boolean);
        const userFriends = user.friends.map(fId => {
            const f = db.users[fId];
            return f ? { id: f.id, username: f.username } : null;
        }).filter(Boolean);

        callback({
            success: true, 
            user: { id: user.id, username: user.username },
            servers: userServers,
            friends: userFriends
        });

        user.servers.forEach(sId => socket.join(sId));
    });

    // --- Friends ---
    socket.on('add-friend', (friendUsername, callback) => {
        const userId = db.sessions[socket.id];
        if (!userId) return;
        const user = db.users[userId];
        const friend = Object.values(db.users).find(u => u.username === friendUsername);
        
        if (!friend) return callback({ success: false, message: 'User not found' });
        if (user.friends.includes(friend.id)) return callback({ success: false, message: 'Already friends' });
        
        user.friends.push(friend.id);
        friend.friends.push(user.id);
        
        const friendSocketId = Object.keys(db.sessions).find(sId => db.sessions[sId] === friend.id);
        if (friendSocketId) {
            io.to(friendSocketId).emit('friend-added', { id: user.id, username: user.username });
        }
        callback({ success: true, friend: { id: friend.id, username: friend.username } });
    });

    // --- Servers ---
    socket.on('create-server', (name, callback) => {
        const userId = db.sessions[socket.id];
        if (!userId) return;
        const user = db.users[userId];
        const serverId = generateId();
        const newServer = {
            id: serverId,
            name,
            ownerId: user.id,
            members: [user.id],
            channels: [
                { id: generateId(), name: 'Global Chat', type: 'text' },
                { id: generateId(), name: 'Voice Hub', type: 'voice' }
            ]
        };
        db.servers[serverId] = newServer;
        user.servers.push(serverId);
        socket.join(serverId);
        callback({ success: true, server: newServer });
    });

    socket.on('join-server', (serverId, callback) => {
        const userId = db.sessions[socket.id];
        if (!userId) return;
        const user = db.users[userId];
        const server = db.servers[serverId];
        if (!server) return callback({ success: false, message: 'Server not found' });
        if (user.servers.includes(serverId)) return callback({ success: false, message: 'Already in server' });
        
        user.servers.push(server.id);
        server.members.push(user.id);
        socket.join(serverId);
        callback({ success: true, server });
    });

    // --- Voice Channels ---
    socket.on('join-channel', ({ serverId, channelId, peerId }, callback) => {
        const userId = db.sessions[socket.id];
        if (!userId) return callback({ success: false });
        const user = db.users[userId];

        // Leave previous voice channel
        for (const cId in voiceRooms) {
            const idx = voiceRooms[cId].findIndex(rm => rm.socketId === socket.id);
            if (idx !== -1) {
                const pId = voiceRooms[cId][idx].peerId;
                voiceRooms[cId].splice(idx, 1);
                socket.leave(cId);
                socket.to(cId).emit('user-disconnected', pId);
                break;
            }
        }

        if (!voiceRooms[channelId]) voiceRooms[channelId] = [];
        voiceRooms[channelId].push({ socketId: socket.id, userId, peerId });
        socket.join(channelId);
        socket.to(channelId).emit('user-connected', peerId, user.username);
        
        // Members list update
        const server = db.servers[serverId];
        if (server) {
            const members = server.members.map(mId => {
                const u = db.users[mId];
                const isOnline = Object.values(db.sessions).includes(mId);
                const inChannel = Object.values(voiceRooms).some(room => room.some(rm => rm.userId === mId));
                return { id: u.id, username: u.username, online: isOnline, inChannel };
            });
            io.to(serverId).emit('member-list-update', { serverId, members });
        }
        callback({ success: true });
    });
    
    socket.on('leave-channel', (channelId, peerId) => {
        socket.leave(channelId);
        if (voiceRooms[channelId]) {
            voiceRooms[channelId] = voiceRooms[channelId].filter(u => u.socketId !== socket.id);
        }
        socket.to(channelId).emit('user-disconnected', peerId);
    });

    // --- Text Chat ---
    socket.on('send-chat-message', (channelId, message) => {
        const userId = db.sessions[socket.id];
        if (!userId) return;
        const user = db.users[userId];
        socket.to(channelId).emit('chat-message', {
            channelId,
            sender: user.username,
            text: message,
            timestamp: new Date().toISOString()
        });
    });

    // --- Direct Messages ---
    socket.on('get-dms', (friendId, callback) => {
        const userId = db.sessions[socket.id];
        if (!userId) return;
        const room = getDmRoomId(userId, friendId);
        callback({ success: true, messages: db.dms[room] || [] });
    });

    socket.on('send-dm', ({ friendId, text, inviteData }) => {
        const userId = db.sessions[socket.id];
        if (!userId) return;
        const user = db.users[userId];
        const room = getDmRoomId(userId, friendId);
        if (!db.dms[room]) db.dms[room] = [];
        const msg = {
            senderId: userId,
            sender: user.username,
            text,
            timestamp: new Date().toISOString(),
            inviteData
        };
        db.dms[room].push(msg);
        const friendSocketId = Object.keys(db.sessions).find(sId => db.sessions[sId] === friendId);
        if (friendSocketId) {
            io.to(friendSocketId).emit('dm-message', { friendId: userId, message: msg });
        }
    });

    socket.on('disconnect', () => {
        const userId = db.sessions[socket.id];
        for (const cId in voiceRooms) {
            const userInRoom = voiceRooms[cId].find(rm => rm.socketId === socket.id);
            if (userInRoom) {
                voiceRooms[cId] = voiceRooms[cId].filter(rm => rm.socketId !== socket.id);
                socket.to(cId).emit('user-disconnected', userInRoom.peerId);
            }
        }
        delete db.sessions[socket.id];
    });
});

const PORT = process.env.PORT || 10000; // Render preferred port
server.listen(PORT, '0.0.0.0', () => {
    console.log(`DC Server running on port ${PORT}`);
});
