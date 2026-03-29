const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// ---- In-Memory DB ----
const generateId = () => Math.random().toString(36).substring(2, 10);

const db = {
    users: {},
    servers: {},
    sessions: {},
    dms: {},
    channelMessages: {},
    friendRequests: {},
};

const getDmRoomId = (id1, id2) => [id1, id2].sort().join('_');
const voiceRooms = {}; // channelId -> [{ socketId, userId, peerId, username }]

function findSocketByUserId(userId) {
    return Object.keys(db.sessions).find(sId => db.sessions[sId] === userId);
}

io.on('connection', (socket) => {
    console.log(`[+] Bağlandı: ${socket.id}`);

    // ---- KAYIT ----
    socket.on('register', ({ username, password, profilePic }, callback) => {
        if (!username || !password) return callback({ success: false, message: 'Kullanıcı adı ve şifre gerekli.' });
        const exists = Object.values(db.users).find(u => u.username.toLowerCase() === username.toLowerCase());
        if (exists) return callback({ success: false, message: 'Bu kullanıcı adı alınmış.' });

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
        callback({ success: true, message: 'Hesap oluşturuldu! Giriş yapabilirsiniz.' });
    });

    // ---- GİRİŞ ----
    socket.on('login', ({ username, password }, callback) => {
        const user = Object.values(db.users).find(
            u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
        );
        if (!user) return callback({ success: false, message: 'Kullanıcı adı veya şifre hatalı.' });

        const oldSocketId = findSocketByUserId(user.id);
        if (oldSocketId && oldSocketId !== socket.id) delete db.sessions[oldSocketId];

        db.sessions[socket.id] = user.id;
        user.servers.forEach(sId => socket.join(sId)); // Sunucu odalarına katıl (chat için kritik!)

        const userServers = user.servers.map(sId => db.servers[sId]).filter(Boolean);
        const userFriends = user.friends.map(fId => {
            const f = db.users[fId];
            return f ? { id: f.id, username: f.username, profilePic: f.profilePic } : null;
        }).filter(Boolean);

        callback({
            success: true,
            user: { id: user.id, username: user.username, profilePic: user.profilePic },
            servers: userServers,
            friends: userFriends,
            friendRequests: db.friendRequests[user.id] || []
        });
    });

    // ---- ARKADAŞ İSTEĞİ GÖNDER ----
    socket.on('send-friend-request', (targetUsername, callback) => {
        const userId = db.sessions[socket.id];
        if (!userId) return callback({ success: false, message: 'Giriş yapmalısınız.' });

<<<<<<< HEAD
        if (newUsername && newUsername.trim() && newUsername.trim() !== user.username) {
            const taken = Object.values(db.users).find(u => u.username.toLowerCase() === newUsername.toLowerCase() && u.id !== uid);
            if (taken) return cb({ success: false, message: 'Bu kullanıcı adı alınmış.' });
            user.username = newUsername.trim();
            // Tüm dünyaya duyur (gerçek zamanlı isim güncellemesi)
            io.emit('username-changed', { userId: uid, newUsername: user.username });
        }
        if (newPassword && newPassword.trim()) user.password = newPassword.trim();

        if (status && status !== user.status) {
            const wasInvisible = user.status === 'invisible';
            user.status = status;
            user.friends.forEach(fId => {
                const fs = findSocket(fId);
                if (!fs) return;
                if (status === 'invisible') {
                    io.to(fs).emit('friend-offline', { userId: uid });
                } else if (wasInvisible) {
                    io.to(fs).emit('friend-online', { userId: uid });
                } else {
                    io.to(fs).emit('friend-status', { userId: uid, status });
                }
            });
        }

        cb({ success: true, user: { id: user.id, username: user.username, profilePic: user.profilePic, status: user.status } });
    });

    // ARKADAŞ İSTEĞİ
    socket.on('send-friend-request', (targetUsername, cb) => {
        const uid = db.sessions[socket.id];
        if (!uid) return cb({ success: false, message: 'Giriş yapılmamış.' });
        const user = db.users[uid];
=======
        const user = db.users[userId];
>>>>>>> parent of b21c083 (V7)
        const target = Object.values(db.users).find(u => u.username.toLowerCase() === targetUsername.toLowerCase());

        if (!target) return callback({ success: false, message: 'Kullanıcı bulunamadı.' });
        if (target.id === userId) return callback({ success: false, message: 'Kendinizi ekleyemezsiniz.' });
        if (user.friends.includes(target.id)) return callback({ success: false, message: 'Zaten arkadaşsınız.' });

        if (!db.friendRequests[target.id]) db.friendRequests[target.id] = [];
        if (db.friendRequests[target.id].find(r => r.fromId === userId))
            return callback({ success: false, message: 'İstek zaten gönderildi.' });

        const request = {
            fromId: userId,
            fromUsername: user.username,
            fromPic: user.profilePic,
            timestamp: new Date().toISOString()
        };
        db.friendRequests[target.id].push(request);

        const targetSocket = findSocketByUserId(target.id);
        if (targetSocket) io.to(targetSocket).emit('receive-friend-request', request);

        callback({ success: true, message: `${target.username} adlı kullanıcıya istek gönderildi!` });
    });

    // ---- ARKADAŞ İSTEĞİ KABUL ----
    socket.on('accept-friend-request', (fromId, callback) => {
        const userId = db.sessions[socket.id];
        if (!userId) return callback({ success: false });

        const user = db.users[userId];
        const fromUser = db.users[fromId];
        if (!fromUser) return callback({ success: false, message: 'Kullanıcı artık mevcut değil.' });

        db.friendRequests[userId] = (db.friendRequests[userId] || []).filter(r => r.fromId !== fromId);
        if (!user.friends.includes(fromId)) user.friends.push(fromId);
        if (!fromUser.friends.includes(userId)) fromUser.friends.push(userId);

        const fromSocket = findSocketByUserId(fromId);
        if (fromSocket) io.to(fromSocket).emit('friend-added', { id: user.id, username: user.username, profilePic: user.profilePic });

        callback({ success: true, friend: { id: fromUser.id, username: fromUser.username, profilePic: fromUser.profilePic } });
    });

    // ---- SUNUCU OLUŞTUR ----
    socket.on('create-server', (name, callback) => {
        const userId = db.sessions[socket.id];
        if (!userId) return callback({ success: false });
        if (!name || !name.trim()) return callback({ success: false, message: 'Sunucu adı gerekli.' });

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
                { id: generateId(), name: 'Ses Odası', type: 'voice' }
            ]
        };
        db.servers[serverId] = newServer;
        user.servers.push(serverId);
        socket.join(serverId); // Server odasına katıl
        callback({ success: true, server: newServer });
    });

    // ---- SUNUCUYA KATIL ----
    socket.on('join-server', (serverId, callback) => {
        const userId = db.sessions[socket.id];
        if (!userId) return callback({ success: false });

        const user = db.users[userId];
        const srv = db.servers[serverId];
        if (!srv) return callback({ success: false, message: 'Sunucu bulunamadı.' });
        if (user.servers.includes(serverId)) return callback({ success: false, message: 'Zaten bu sunucudasınız.' });

        user.servers.push(srv.id);
        srv.members.push(userId);
        socket.join(serverId); // Server odasına katıl

        socket.to(serverId).emit('server-member-joined', { serverId, userId, username: user.username });
        callback({ success: true, server: srv });
    });

    // ---- KANALA KATIL ----
    socket.on('join-channel', ({ serverId, channelId, peerId }, callback) => {
        const userId = db.sessions[socket.id];
        if (!userId) return typeof callback === 'function' ? callback({ success: false }) : null;

        const user = db.users[userId];

        // Önceki ses kanalından çık
        for (const cId in voiceRooms) {
            const idx = voiceRooms[cId].findIndex(rm => rm.socketId === socket.id);
            if (idx !== -1) {
                const oldRoomId = cId;
                const pId = voiceRooms[oldRoomId][idx].peerId;
                voiceRooms[oldRoomId].splice(idx, 1);
                socket.leave(oldRoomId);
                socket.to(oldRoomId).emit('user-disconnected', pId);
                // Oda boşaldıysa veya güncellendiyse duyur
                io.emit('voice-channel-update', { channelId: oldRoomId, count: voiceRooms[oldRoomId].length });
                break;
            }
        }

        socket.join(channelId);

        // Ses kanalı mı? (peerId gönderildiyse)
        if (peerId) {
            if (!voiceRooms[channelId]) voiceRooms[channelId] = [];
<<<<<<< HEAD
            const existing = voiceRooms[channelId].map(p => ({ 
                peerId: p.peerId, 
                username: p.username,
                isMuted: p.isMuted || false,
                isDeafened: p.isDeafened || false
            }));
            voiceRooms[channelId].push({ socketId: socket.id, userId: uid, peerId, username: user.username, isMuted: false, isDeafened: false });
            socket.to(channelId).emit('user-connected', peerId, user.username);
            // Yeni sayıyı herkese duyur
            io.emit('voice-channel-update', { channelId, count: voiceRooms[channelId].length });
            if (typeof cb === 'function') cb({ success: true, existingPeers: existing });
=======

            // Mevcut kullanıcıları döndür (2. kullanıcı bunları görecek)
            const existingPeers = voiceRooms[channelId].map(p => ({
                peerId: p.peerId,
                username: p.username
            }));

            voiceRooms[channelId].push({ socketId: socket.id, userId, peerId, username: user.username });
            socket.to(channelId).emit('user-connected', peerId, user.username);

            if (typeof callback === 'function') callback({ success: true, existingPeers });
>>>>>>> parent of b21c083 (V7)
        } else {
            if (typeof callback === 'function') callback({ success: true, existingPeers: [] });
        }
    });

<<<<<<< HEAD
    socket.on('voice-state-update', d => {
        // d: { channelId, isMuted, isDeafened }
        const uid = db.sessions[socket.id];
        if (!uid) return;
        
        // Odayı bul ve güncelle
        if (voiceRooms[d.channelId]) {
            const user = voiceRooms[d.channelId].find(u => u.socketId === socket.id);
            if (user) {
                user.isMuted = d.isMuted;
                user.isDeafened = d.isDeafened;
            }
        }
        socket.to(d.channelId).emit('voice-state-changed', { peerId: d.peerId, isMuted: d.isMuted, isDeafened: d.isDeafened });
=======
    // ---- KANALDAN AYRIL ----
    socket.on('leave-channel', (channelId, peerId) => {
        socket.leave(channelId);
        if (voiceRooms[channelId]) {
            voiceRooms[channelId] = voiceRooms[channelId].filter(u => u.socketId !== socket.id);
        }
        socket.to(channelId).emit('user-disconnected', peerId);
>>>>>>> parent of b21c083 (V7)
    });

    // ---- KANAL MESAJLARINI GETİR ----
    socket.on('get-channel-messages', (channelId, callback) => {
        callback({ success: true, messages: db.channelMessages[channelId] || [] });
    });

    // ---- KANAL MESAJI GÖNDER ----
    // ÖNEMLİ: serverId de alıyoruz → sunucu odasına broadcast yapıyoruz
    // Böylece kanalda olmayan ama sunucuda olan herkes mesajı alıyor (ama sadece doğru kanalı görüntüleyenler gösteriyor)
    socket.on('send-chat-message', ({ channelId, serverId, text }) => {
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

        // Sunucu odasındaki herkese gönder (login'de sunucu odasına katılıyorlar)
        // socket.to → gönderen hariç herkese
        if (serverId) {
            socket.to(serverId).emit('chat-message', { channelId, serverId, ...msg });
        } else {
            socket.to(channelId).emit('chat-message', { channelId, ...msg });
        }
    });

    // ---- DM MESAJLARINI GETİR ----
    socket.on('get-dms', (friendId, callback) => {
        const userId = db.sessions[socket.id];
        if (!userId) return callback({ success: false, messages: [] });
        callback({ success: true, messages: db.dms[getDmRoomId(userId, friendId)] || [] });
    });

    // ---- DM GÖNDER ----
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

        const friendSocket = findSocketByUserId(friendId);
        if (friendSocket) io.to(friendSocket).emit('dm-message', { friendId: userId, message: msg });
    });

    // ---- BAĞLANTI KESİLDİ ----
    socket.on('disconnect', () => {
        for (const cId in voiceRooms) {
            const u = voiceRooms[cId].find(rm => rm.socketId === socket.id);
            if (u) {
                voiceRooms[cId] = voiceRooms[cId].filter(rm => rm.socketId !== socket.id);
                socket.to(cId).emit('user-disconnected', u.peerId);
            }
        }
        delete db.sessions[socket.id];
        console.log(`[-] Ayrıldı: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Nexus çalışıyor: http://localhost:${PORT}`);
});
