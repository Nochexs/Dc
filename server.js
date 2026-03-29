const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// --- Render.com Uyumlu Socket.io Ayarları ---
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    },
    // Render.com WebSocket için gerekli
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint (Render uptime ping için)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// --- In-Memory Database ---
const generateId = () => Math.random().toString(36).substring(2, 10);

const db = {
    users: {},           // userId -> { id, username, password, profilePic, friends: [], servers: [] }
    servers: {},         // serverId -> { id, name, ownerId, members: [], channels: [] }
    sessions: {},        // socket.id -> userId
    dms: {},             // dmRoomId -> [{senderId, sender, text, timestamp}]
    channelMessages: {}, // channelId -> [{senderId, sender, text, timestamp}]
    friendRequests: {},  // userId -> [{fromId, fromUsername, timestamp}]
};

const getDmRoomId = (id1, id2) => [id1, id2].sort().join('_');
const voiceRooms = {}; // channelId -> [{socketId, userId, peerId}]

// --- Yardımcı: Aktif socket bul ---
function findSocketByUserId(userId) {
    return Object.keys(db.sessions).find(sId => db.sessions[sId] === userId);
}

io.on('connection', (socket) => {
    console.log(`[+] Socket bağlandı: ${socket.id}`);

    // --- AUTH: Kayıt ---
    socket.on('register', ({ username, password, profilePic }, callback) => {
        if (!username || !password) return callback({ success: false, message: 'Username and password required.' });

        const exists = Object.values(db.users).find(u => u.username.toLowerCase() === username.toLowerCase());
        if (exists) return callback({ success: false, message: 'Username already taken.' });

        const newUser = {
            id: generateId(),
            username: username.trim(),
            password,
            profilePic: profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            friends: [],
            servers: []
        };
        db.users[newUser.id] = newUser;
        db.friendRequests[newUser.id] = [];
        console.log(`[+] Kullanıcı kayıt: ${username}`);
        callback({ success: true, message: 'Account created! You can now log in.' });
    });

    // --- AUTH: Giriş ---
    socket.on('login', ({ username, password }, callback) => {
        const user = Object.values(db.users).find(
            u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
        );
        if (!user) return callback({ success: false, message: 'Invalid username or password.' });

        // Eski session varsa temizle
        const oldSocketId = findSocketByUserId(user.id);
        if (oldSocketId && oldSocketId !== socket.id) {
            delete db.sessions[oldSocketId];
        }

        db.sessions[socket.id] = user.id;

        const userServers = user.servers.map(sId => db.servers[sId]).filter(Boolean);
        const userFriends = user.friends.map(fId => {
            const f = db.users[fId];
            return f ? { id: f.id, username: f.username, profilePic: f.profilePic } : null;
        }).filter(Boolean);
        const requests = db.friendRequests[user.id] || [];

        // Sunucu odalarına katıl
        user.servers.forEach(sId => socket.join(sId));

        console.log(`[+] Login: ${user.username} (${socket.id})`);
        callback({
            success: true,
            user: { id: user.id, username: user.username, profilePic: user.profilePic },
            servers: userServers,
            friends: userFriends,
            friendRequests: requests
        });
    });

    // --- ARKADAŞLIK: İstek gönder ---
    socket.on('send-friend-request', (targetUsername, callback) => {
        const userId = db.sessions[socket.id];
        if (!userId) return callback({ success: false, message: 'Not authenticated.' });

        const user = db.users[userId];
        const target = Object.values(db.users).find(
            u => u.username.toLowerCase() === targetUsername.toLowerCase()
        );

        if (!target) return callback({ success: false, message: 'User not found.' });
        if (target.id === userId) return callback({ success: false, message: 'You cannot add yourself.' });
        if (user.friends.includes(target.id)) return callback({ success: false, message: 'Already friends.' });

        if (!db.friendRequests[target.id]) db.friendRequests[target.id] = [];
        const alreadyPending = db.friendRequests[target.id].find(r => r.fromId === userId);
        if (alreadyPending) return callback({ success: false, message: 'Request already sent.' });

        const request = {
            fromId: userId,
            fromUsername: user.username,
            fromPic: user.profilePic,
            timestamp: new Date().toISOString()
        };
        db.friendRequests[target.id].push(request);

        // Gerçek zamanlı bildirim
        const targetSocketId = findSocketByUserId(target.id);
        if (targetSocketId) {
            io.to(targetSocketId).emit('receive-friend-request', request);
        }
        callback({ success: true, message: `Friend request sent to ${target.username}!` });
    });

    // --- ARKADAŞLIK: Kabul et ---
    socket.on('accept-friend-request', (fromId, callback) => {
        const userId = db.sessions[socket.id];
        if (!userId) return callback({ success: false, message: 'Not authenticated.' });

        const user = db.users[userId];
        const fromUser = db.users[fromId];
        if (!fromUser) return callback({ success: false, message: 'User no longer exists.' });

        db.friendRequests[userId] = (db.friendRequests[userId] || []).filter(r => r.fromId !== fromId);

        if (!user.friends.includes(fromId)) user.friends.push(fromId);
        if (!fromUser.friends.includes(userId)) fromUser.friends.push(userId);

        // Karşı tarafı bilgilendir
        const fromSocketId = findSocketByUserId(fromId);
        if (fromSocketId) {
            io.to(fromSocketId).emit('friend-added', {
                id: user.id,
                username: user.username,
                profilePic: user.profilePic
            });
        }

        callback({
            success: true,
            friend: { id: fromUser.id, username: fromUser.username, profilePic: fromUser.profilePic }
        });
    });

    // --- SUNUCU: Oluştur ---
    socket.on('create-server', (name, callback) => {
        const userId = db.sessions[socket.id];
        if (!userId) return callback({ success: false, message: 'Not authenticated.' });
        if (!name || !name.trim()) return callback({ success: false, message: 'Server name required.' });

        const user = db.users[userId];
        const serverId = generateId();
        const newServer = {
            id: serverId,
            name: name.trim(),
            ownerId: userId,
            members: [userId],
            channels: [
                { id: generateId(), name: 'genel', type: 'text' },
                { id: generateId(), name: 'sohbet', type: 'text' },
                { id: generateId(), name: 'Voice Hub', type: 'voice' }
            ]
        };
        db.servers[serverId] = newServer;
        user.servers.push(serverId);
        socket.join(serverId);
        console.log(`[+] Sunucu oluşturuldu: "${name}" (${serverId})`);
        callback({ success: true, server: newServer });
    });

    // --- SUNUCU: Katıl (davet ile) ---
    socket.on('join-server', (serverId, callback) => {
        const userId = db.sessions[socket.id];
        if (!userId) return callback({ success: false, message: 'Not authenticated.' });

        const user = db.users[userId];
        const srv = db.servers[serverId];
        if (!srv) return callback({ success: false, message: 'Server not found. Check the invite ID.' });
        if (user.servers.includes(serverId)) return callback({ success: false, message: 'Already in this server.' });

        user.servers.push(srv.id);
        srv.members.push(userId);
        socket.join(serverId);

        // Mevcut üyelere yeni üye bildirimi
        socket.to(serverId).emit('server-member-joined', {
            serverId,
            userId,
            username: user.username
        });

        console.log(`[+] Kullanıcı sunucuya katıldı: ${user.username} -> ${srv.name}`);
        callback({ success: true, server: srv });
    });

    // --- KANAL: Katıl (ses veya metin) ---
    socket.on('join-channel', ({ serverId, channelId, peerId }, callback) => {
        const userId = db.sessions[socket.id];
        if (!userId) return typeof callback === 'function' ? callback({ success: false }) : null;

        const user = db.users[userId];

        // Önceki ses kanalından çık
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

        socket.join(channelId);

        // Yalnızca ses kanalıysa peer yönetimi yap
        if (peerId) {
            if (!voiceRooms[channelId]) voiceRooms[channelId] = [];
            voiceRooms[channelId].push({ socketId: socket.id, userId, peerId });
            socket.to(channelId).emit('user-connected', peerId, user.username);
        }

        if (typeof callback === 'function') callback({ success: true });
    });

    // --- KANAL: Ayrıl ---
    socket.on('leave-channel', (channelId, peerId) => {
        socket.leave(channelId);
        if (voiceRooms[channelId]) {
            voiceRooms[channelId] = voiceRooms[channelId].filter(u => u.socketId !== socket.id);
        }
        socket.to(channelId).emit('user-disconnected', peerId);
    });

    // --- METİN SOHBET: Mesajları getir ---
    socket.on('get-channel-messages', (channelId, callback) => {
        callback({
            success: true,
            messages: db.channelMessages[channelId] || []
        });
    });

    // --- METİN SOHBET: Mesaj gönder ---
    socket.on('send-chat-message', (channelId, text) => {
        const userId = db.sessions[socket.id];
        if (!userId || !text || !text.trim()) return;

        const user = db.users[userId];
        if (!db.channelMessages[channelId]) db.channelMessages[channelId] = [];

        const msg = {
            senderId: userId,
            sender: user.username,
            profilePic: user.profilePic,
            text: text.trim(),
            timestamp: new Date().toISOString()
        };
        db.channelMessages[channelId].push(msg);

        // Kanaldaki diğer kullanıcılara gönder
        socket.to(channelId).emit('chat-message', { channelId, ...msg });
    });

    // --- DM: Mesajları getir ---
    socket.on('get-dms', (friendId, callback) => {
        const userId = db.sessions[socket.id];
        if (!userId) return callback({ success: false, messages: [] });
        const room = getDmRoomId(userId, friendId);
        callback({ success: true, messages: db.dms[room] || [] });
    });

    // --- DM: Mesaj gönder ---
    socket.on('send-dm', ({ friendId, text }) => {
        const userId = db.sessions[socket.id];
        if (!userId || !text || !text.trim()) return;

        const user = db.users[userId];
        const room = getDmRoomId(userId, friendId);
        if (!db.dms[room]) db.dms[room] = [];

        const msg = {
            senderId: userId,
            sender: user.username,
            profilePic: user.profilePic,
            text: text.trim(),
            timestamp: new Date().toISOString()
        };
        db.dms[room].push(msg);

        const friendSocketId = findSocketByUserId(friendId);
        if (friendSocketId) {
            io.to(friendSocketId).emit('dm-message', { friendId: userId, message: msg });
        }
    });

    // --- BAĞLANTI KESİLDİ ---
    socket.on('disconnect', (reason) => {
        const userId = db.sessions[socket.id];
        console.log(`[-] Socket ayrıldı: ${socket.id} (${reason})`);

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

// --- Sunucu Başlat ---
const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Nexus Server çalışıyor: port ${PORT}`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
});
