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
app.use(express.static(__dirname));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// ---- In-Memory DB ----
const generateId = () => Math.random().toString(36).substring(2, 10);

const db = {
    users: {},     // userId -> { id, username, password, profilePic, status, friends: [], servers: [] }
    servers: {},   // serverId -> { id, name, avatar, ownerId, members: [], channels: [] }
    sessions: {},  // socket.id -> userId
    dms: {},       // dmRoomId -> [{senderId, sender, text, timestamp, inviteData}]
    channelMessages: {}, // channelId -> [{senderId, sender, profilePic, text, timestamp}]
    friendRequests: {},  // userId -> [{fromId, fromUsername, fromPic, timestamp}]
};

const getDmRoomId = (id1, id2) => [id1, id2].sort().join('_');
const voiceRooms = {}; // channelId -> [{ socketId, userId, peerId, username }]

function findSocketByUserId(userId) {
    return Object.keys(db.sessions).find(sId => db.sessions[sId] === userId);
}

function findSocket(userId) {
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
            username,
            password,
            profilePic: profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            status: 'online',
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
        
        // Sunucu odalarına katıl
        user.servers.forEach(sId => socket.join(sId));

        const userServers = user.servers.map(sId => db.servers[sId]).filter(Boolean);
        const userFriends = user.friends.map(fId => {
            const f = db.users[fId];
            return f ? { id: f.id, username: f.username, profilePic: f.profilePic, status: f.status } : null;
        }).filter(Boolean);

        // Arkadaşlara çevrimiçi bildirimi
        if (user.status !== 'invisible') {
            user.friends.forEach(fId => {
                const fs = findSocket(fId);
                if (fs) io.to(fs).emit('friend-online', { userId: user.id });
            });
            user.servers.forEach(sId => {
                socket.to(sId).emit('server-member-status', { userId: user.id, status: 'online' });
            });
        }

        callback({
            success: true, 
            user: { id: user.id, username: user.username, profilePic: user.profilePic, status: user.status },
            servers: userServers,
            friends: userFriends,
            friendRequests: db.friendRequests[user.id] || []
        });
    });

    // PROFİL GÜNCELLE
    socket.on('update-profile', ({ newUsername, newPassword, currPassword, profilePic, status }, cb) => {
        const uid = db.sessions[socket.id];
        if (!uid) return cb({ success: false, message: 'Giriş yapılmamış.' });
        const user = db.users[uid];

        if (newUsername && newUsername.trim() && newUsername.trim() !== user.username) {
            const taken = Object.values(db.users).find(u => u.username.toLowerCase() === newUsername.toLowerCase() && u.id !== uid);
            if (taken) return cb({ success: false, message: 'Bu kullanıcı adı alınmış.' });
            user.username = newUsername.trim();
        }
        
        if (newPassword && newPassword.trim()) {
            if (user.password !== currPassword) return cb({ success: false, message: 'Mevcut şifreniz hatalı.' });
            user.password = newPassword.trim();
        }

        if (profilePic && profilePic.trim()) {
            user.profilePic = profilePic.trim();
        }

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
            user.servers.forEach(sId => {
                const targetStatus = status === 'invisible' ? 'offline' : status;
                socket.to(sId).emit('server-member-status', { userId: user.id, status: targetStatus });
            });
        }

        cb({ success: true, user: { id: user.id, username: user.username, profilePic: user.profilePic, status: user.status } });
        
        // Diğerlerine de kullanıcı bilgisinin güncellendiğini bildir
        user.friends.forEach(fId => {
            const fs = findSocket(fId);
            if (fs) io.to(fs).emit('friend-update', { id: user.id, username: user.username, profilePic: user.profilePic });
        });
        user.servers.forEach(sId => {
            socket.to(sId).emit('server-member-update', { id: user.id, username: user.username, profilePic: user.profilePic });
        });
    });

    // HESAP SİL
    socket.on('delete-account', (cb) => {
        const uid = db.sessions[socket.id];
        if (!uid) return cb({ success: false, message: 'Giriş yapılmamış.' });
        const user = db.users[uid];
        // Arkadaşlardan çıkar
        user.friends.forEach(fId => {
            const f = db.users[fId];
            if (f) {
                f.friends = f.friends.filter(id => id !== uid);
                const fs = findSocket(fId);
                if (fs) io.to(fs).emit('friend-removed', { userId: uid });
            }
        });
        // Sahipliğindeki sunucuları sil
        user.servers.forEach(sId => {
            const srv = db.servers[sId];
            if (srv && srv.ownerId === uid) {
                delete db.servers[sId];
            } else if (srv) {
                srv.members = srv.members.filter(id => id !== uid);
            }
        });
        delete db.users[uid];
        delete db.sessions[socket.id];
        cb({ success: true });
    });

    // ARKADAŞ İSTEĞİ GÖNDER
    socket.on('send-friend-request', (targetUsername, callback) => {
        const userId = db.sessions[socket.id];
        if (!userId) return callback({ success: false, message: 'Giriş yapmalısınız.' });

        const user = db.users[userId];
        const target = Object.values(db.users).find(u => u.username.toLowerCase() === targetUsername.toLowerCase());

        if (!target) return callback({ success: false, message: 'Kullanıcı bulunamadı.' });
        if (target.id === userId) return callback({ success: false, message: 'Kendinizi ekleyemezsiniz.' });
        if (user.friends.includes(target.id)) return callback({ success: false, message: 'Zaten arkadaşsınız.' });

        if (!db.friendRequests[target.id]) db.friendRequests[target.id] = [];
        if (db.friendRequests[target.id].find(r => r.fromId === userId))
            return callback({ success: false, message: 'İstek zaten gönderildi.' });

        const request = { fromId: userId, fromUsername: user.username, fromPic: user.profilePic, timestamp: new Date().toISOString() };
        db.friendRequests[target.id].push(request);

        const targetSocket = findSocketByUserId(target.id);
        if (targetSocket) io.to(targetSocket).emit('receive-friend-request', request);

        callback({ success: true, message: `${target.username} adlı kullanıcıya istek gönderildi!` });
    });

    // ARKADAŞ İSTEĞİ KABUL
    socket.on('accept-friend-request', (fromId, callback) => {
        const userId = db.sessions[socket.id];
        if (!userId) return callback({ success: false });

        const user = db.users[userId];
        const fromUser = db.users[fromId];
        if (!fromUser) return callback({ success: false, message: 'Kullanıcı artık mevcut değil.' });

        // Remove from requests
        db.friendRequests[userId] = (db.friendRequests[userId] || []).filter(r => r.fromId !== fromId);
        
        if (!user.friends.includes(fromId)) user.friends.push(fromId);
        if (!fromUser.friends.includes(userId)) fromUser.friends.push(userId);

        const fromSocket = findSocketByUserId(fromId);
        if (fromSocket) io.to(fromSocket).emit('friend-added', { id: user.id, username: user.username, profilePic: user.profilePic });

        callback({ success: true, friend: { id: fromUser.id, username: fromUser.username, profilePic: fromUser.profilePic } });
    });

    // ARKADAŞ İSTEĞİNİ REDDET
    socket.on('reject-friend-request', (fromId, cb) => {
        const uid = db.sessions[socket.id];
        if (!uid) return cb({ success: false });
        db.friendRequests[uid] = (db.friendRequests[uid] || []).filter(r => r.fromId !== fromId);
        cb({ success: true });
    });

    // ARKADAŞI KALDIR
    socket.on('remove-friend', (friendId, cb) => {
        const uid = db.sessions[socket.id];
        if (!uid) return cb({ success: false });
        const user = db.users[uid], friend = db.users[friendId];
        if (!friend) return cb({ success: false });
        user.friends = user.friends.filter(id => id !== friendId);
        friend.friends = friend.friends.filter(id => id !== uid);
        const fs = findSocket(friendId);
        if (fs) io.to(fs).emit('friend-removed', { userId: uid });
        cb({ success: true });
    });

    // SUNUCU OLUŞTUR
    socket.on('create-server', (name, callback) => {
        const userId = db.sessions[socket.id];
        if (!userId) return callback({ success: false });
        if (!name || !name.trim()) return callback({ success: false, message: 'Sunucu adı gerekli.' });

        const user = db.users[userId];
        const serverId = generateId();
        const newServer = {
            id: serverId,
            name: name.trim(),
            avatar: '',
            ownerId: user.id,
            members: [user.id],
            channels: [
                { id: generateId(), name: 'genel', type: 'text' },
                { id: generateId(), name: 'sohbet', type: 'text' },
                { id: generateId(), name: 'Ses Odası', type: 'voice' }
            ]
        };
        db.servers[serverId] = newServer;
        user.servers.push(serverId);
        socket.join(serverId);
        callback({ success: true, server: newServer });
    });

    // SUNUCUDAN AYRIL
    socket.on('leave-server', (serverId, cb) => {
        const uid = db.sessions[socket.id];
        if (!uid) return cb({ success: false });
        const user = db.users[uid];
        const srv = db.servers[serverId];
        if (!srv) return cb({ success: false });
        if (srv.ownerId === uid) return cb({ success: false, message: 'Sunucu sahibi sunucudan ayrılamaz, silmelidir.' });
        
        srv.members = srv.members.filter(id => id !== uid);
        user.servers = user.servers.filter(id => id !== serverId);
        socket.leave(serverId);
        cb({ success: true });
    });

    // SUNUCUYU SİL
    socket.on('delete-server', (serverId, cb) => {
        const uid = db.sessions[socket.id];
        if (!uid) return cb({ success: false });
        const srv = db.servers[serverId];
        if (!srv) return cb({ success: false });
        if (srv.ownerId !== uid) return cb({ success: false, message: 'Sadece sunucu sahibi silebilir.' });
        
        srv.members.forEach(mId => {
            const m = db.users[mId];
            if (m) m.servers = m.servers.filter(id => id !== serverId);
        });
        delete db.servers[serverId];
        cb({ success: true });
    });

    // SUNUCUYU DÜZENLE
    socket.on('edit-server', ({ serverId, name, avatar }, cb) => {
        const uid = db.sessions[socket.id];
        if (!uid) return cb({ success: false });
        const srv = db.servers[serverId];
        if (!srv) return cb({ success: false });
        if (srv.ownerId !== uid) return cb({ success: false, message: 'Sadece kurucu düzenleyebilir.' });
        
        if (name && name.trim()) srv.name = name.trim();
        if (avatar && avatar.trim()) srv.avatar = avatar.trim();
        io.to(serverId).emit('server-updated', srv);
        cb({ success: true, server: srv });
    });

    // SES KANALI OLUŞTUR
    socket.on('create-voice-channel', ({ serverId, name, limit }, cb) => {
        const uid = db.sessions[socket.id];
        if (!uid) return cb({ success: false });
        const srv = db.servers[serverId];
        if (!srv) return cb({ success: false });
        
        if (!name || !name.trim()) return cb({ success: false, message: 'Kanal adı boş olamaz.' });
        
        const newChannel = {
            id: generateId(),
            name: name.trim().toLowerCase().replace(/\s+/g, '-'),
            type: 'voice',
            limit: limit ? parseInt(limit, 10) : 0
        };
        srv.channels.push(newChannel);
        io.to(serverId).emit('server-updated', srv);
        cb({ success: true, channel: newChannel, server: srv });
    });

    // KANAL DÜZENLE
    socket.on('edit-channel', ({ serverId, channelId, name, limit }, cb) => {
        const uid = db.sessions[socket.id];
        if (!uid) return cb({ success: false });
        const srv = db.servers[serverId];
        if (!srv) return cb({ success: false });
        if (srv.ownerId !== uid) return cb({ success: false, message: 'Sadece kurucu düzenleyebilir.' });
        
        const ch = srv.channels.find(c => c.id === channelId);
        if (!ch) return cb({ success: false });
        
        if (name && name.trim()) ch.name = name.trim().toLowerCase().replace(/\s+/g, '-');
        ch.limit = limit != null ? parseInt(limit, 10) : 0;
        
        io.to(serverId).emit('server-updated', srv);
        cb({ success: true, server: srv });
    });

    // KANAL SİL
    socket.on('delete-channel', ({ serverId, channelId }, cb) => {
        const uid = db.sessions[socket.id];
        if (!uid) return cb({ success: false });
        const srv = db.servers[serverId];
        if (!srv) return cb({ success: false });
        if (srv.ownerId !== uid) return cb({ success: false, message: 'Sadece kurucu silebilir.' });
        
        srv.channels = srv.channels.filter(c => c.id !== channelId);
        io.to(serverId).emit('server-updated', srv);
        cb({ success: true, server: srv });
    });

    // SUNUCUYA KATIL
    socket.on('join-server', (serverId, callback) => {
        const userId = db.sessions[socket.id];
        if (!userId) return callback({ success: false });

        const user = db.users[userId];
        const srv = db.servers[serverId] || db.servers[serverId?.trim()];
        if (!srv) return callback({ success: false, message: 'Sunucu bulunamadı.' });
        if (user.servers.includes(srv.id)) return callback({ success: false, message: 'Zaten bu sunucudasınız.' });

        user.servers.push(srv.id);
        srv.members.push(userId);
        socket.join(srv.id);

        socket.to(srv.id).emit('server-member-joined', { serverId: srv.id, userId, username: user.username });
        callback({ success: true, server: srv });
    });

    // KANALA KATIL
    socket.on('join-channel', ({ serverId, channelId, peerId }, callback) => {
        const userId = db.sessions[socket.id];
        if (!userId) return typeof callback === 'function' ? callback({ success: false }) : null;
        
        const user = db.users[userId];
        const srv = db.servers[serverId];
        const ch = srv?.channels.find(c => c.id === channelId);

        // Limit Odatı Kontrolü
        if (ch && ch.type === 'voice' && ch.limit > 0) {
            const currentUsers = voiceRooms[channelId] ? voiceRooms[channelId].length : 0;
            if (currentUsers >= ch.limit) {
                return typeof callback === 'function' ? callback({ success: false, message: 'Kanal dolu!' }) : null;
            }
        }

        // Leave previous voice channel
        for (const cId in voiceRooms) {
            const idx = voiceRooms[cId].findIndex(rm => rm.socketId === socket.id);
            if (idx !== -1) {
                const u = voiceRooms[cId][idx];
                voiceRooms[cId].splice(idx, 1);
                socket.leave(cId);
                socket.to(cId).emit('user-disconnected', u.peerId);
                let foundSrvId = null;
                Object.values(db.servers).forEach(s => {
                    if (s.channels.find(c => c.id === cId)) foundSrvId = s.id;
                });
                if (foundSrvId) io.to(foundSrvId).emit('channel-users-updated', cId, voiceRooms[cId].map(x => x.userId));
                break;
            }
        }

        // Ses kanalı mı?
        if (peerId) {
            if (!voiceRooms[channelId]) voiceRooms[channelId] = [];
            
            const existingPeers = voiceRooms[channelId].map(p => ({
                peerId: p.peerId,
                username: p.username
            }));

            voiceRooms[channelId].push({ socketId: socket.id, userId, peerId, username: user.username });
            socket.join(channelId);
            socket.to(channelId).emit('user-connected', peerId, user.username);
            
            if (serverId) {
                io.to(serverId).emit('channel-users-updated', channelId, voiceRooms[channelId].map(u => u.userId));
            }
            
            if (typeof callback === 'function') callback({ success: true, existingPeers });
        } else {
            socket.join(channelId);
            if (typeof callback === 'function') callback({ success: true, existingPeers: [] });
        }
    });

    // KANALDAN AYRIL
    socket.on('leave-channel', (channelId, peerId) => {
        socket.leave(channelId);
        let srvId = null;
        Object.values(db.servers).forEach(s => {
            if (s.channels.find(c => c.id === channelId)) srvId = s.id;
        });

        if (voiceRooms[channelId]) {
            voiceRooms[channelId] = voiceRooms[channelId].filter(u => u.socketId !== socket.id);
            if (srvId) io.to(srvId).emit('channel-users-updated', channelId, voiceRooms[channelId].map(u => u.userId));
        }
        socket.to(channelId).emit('user-disconnected', peerId);
    });

    // KANAL MESAJLARINI GETİR
    socket.on('get-channel-messages', (channelId, callback) => {
        callback({ success: true, messages: db.channelMessages[channelId] || [] });
    });

    // KANAL MESAJI GÖNDER
    socket.on('send-chat-message', ({ channelId, serverId, text }) => {
        const userId = db.sessions[socket.id];
        if (!userId) return;
        const user = db.users[userId];
        
        if (!db.channelMessages[channelId]) db.channelMessages[channelId] = [];
        const msg = {
            senderId: userId,
            sender: user.username,
            profilePic: user.profilePic,
            text,
            timestamp: new Date().toISOString()
        };
        db.channelMessages[channelId].push(msg);

        if (serverId) {
            socket.to(serverId).emit('chat-message', { channelId, serverId, ...msg });
        } else {
            socket.to(channelId).emit('chat-message', { channelId, ...msg });
        }
    });

    // DM MESAJLARINI GETİR
    socket.on('get-dms', (friendId, callback) => {
        const userId = db.sessions[socket.id];
        if (!userId) return callback({ success: false, messages: [] });
        callback({ success: true, messages: db.dms[getDmRoomId(userId, friendId)] || [] });
    });

    // DM GÖNDER
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

        const friendSocket = findSocketByUserId(friendId);
        if (friendSocket) io.to(friendSocket).emit('dm-message', { friendId: userId, message: msg });
    });

    // DM SESLİ ARAMA İSTEĞİ
    socket.on('dm-call-request', (friendId, cb) => {
        const uid = db.sessions[socket.id];
        if (!uid) return cb({ success: false });
        const user = db.users[uid];
        const fs = findSocket(friendId);
        if (!fs) return cb({ success: false, message: 'Kullanıcı çevrimdışı.' });
        
        io.to(fs).emit('incoming-call', { 
            fromId: uid, 
            fromName: user.username, 
            fromPic: user.profilePic 
        });
        cb({ success: true });
    });

    // DM ARAMA CEVABI
    socket.on('dm-call-response', ({ toId, accepted }, cb) => {
        const uid = db.sessions[socket.id];
        if (!uid) return;
        const fs = findSocket(toId);
        if (fs) io.to(fs).emit('call-response', { fromId: uid, accepted });
        if (cb) cb({ success: true });
    });

    // MUTUAL DETAILS
    socket.on('get-mutual-details', (targetId, cb) => {
        const uid = db.sessions[socket.id];
        if (!uid) return cb({ success: false });
        const user = db.users[uid];
        const target = db.users[targetId];
        if (!user || !target) return cb({ success: false });

        const mutualFriends = target.friends.filter(fid => user.friends.includes(fid)).map(fid => db.users[fid]?.username).filter(Boolean);
        
        let mutualServers = [];
        Object.values(db.servers).forEach(s => {
            if (s.members.includes(uid) && s.members.includes(targetId)) mutualServers.push(s.name);
        });
        
        cb({ success: true, mutualFriends, mutualServers });
    });

    // BAĞLANTI KESİLDİ
    socket.on('disconnect', () => {
        const uid = db.sessions[socket.id];
        if (uid) {
            const user = db.users[uid];
            if (user && user.status !== 'invisible') {
                user.friends.forEach(fId => {
                    const fs = findSocket(fId);
                    if (fs && fs !== socket.id) io.to(fs).emit('friend-offline', { userId: uid });
                });
                user.servers.forEach(sId => {
                    socket.to(sId).emit('server-member-status', { userId: uid, status: 'offline' });
                });
            }
        }
        
        for (const cId in voiceRooms) {
            const u = voiceRooms[cId].find(rm => rm.socketId === socket.id);
            if (u) {
                voiceRooms[cId] = voiceRooms[cId].filter(rm => rm.socketId !== socket.id);
                socket.to(cId).emit('user-disconnected', u.peerId);
                
                let srvId = null;
                Object.values(db.servers).forEach(s => {
                    if (s.channels.find(c => c.id === cId)) srvId = s.id;
                });
                if (srvId) io.to(srvId).emit('channel-users-updated', cId, voiceRooms[cId].map(x => x.userId));
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
