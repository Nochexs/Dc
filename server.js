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

// ── DB ──────────────────────────────────────────────────────────────
const generateId = () => Math.random().toString(36).substring(2, 10);
const db = {
    users: {},           // id -> { id, username, password, profilePic, status, friends[], servers[] }
    servers: {},         // id -> { id, name, ownerId, members[], channels[] }
    sessions: {},        // socketId -> userId
    dms: {},             // roomId -> [{...}]
    channelMessages: {}, // channelId -> [{...}]
    friendRequests: {},  // userId -> [{...}]
};
const voiceRooms = {};  // channelId -> [{ socketId, userId, peerId, username }]

const getDmRoomId  = (a, b) => [a, b].sort().join('_');
const findSocket   = (uid)  => Object.keys(db.sessions).find(s => db.sessions[s] === uid);
const isOnline     = (uid)  => {
    const s = findSocket(uid);
    if (!s) return false;
    const u = db.users[uid];
    return u && u.status !== 'invisible';
};

// ── SOCKET ──────────────────────────────────────────────────────────
io.on('connection', (socket) => {
    console.log(`[+] ${socket.id}`);

    // KAYIT
    socket.on('register', ({ username, password, profilePic }, cb) => {
        if (!username || !password) return cb({ success: false, message: 'Boş alan bırakamazsın.' });
        if (Object.values(db.users).find(u => u.username.toLowerCase() === username.toLowerCase()))
            return cb({ success: false, message: 'Bu kullanıcı adı alınmış.' });
        const u = {
            id: generateId(), username: username.trim(), password,
            profilePic: profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
            status: 'online', friends: [], servers: []
        };
        db.users[u.id] = u;
        db.friendRequests[u.id] = [];
        cb({ success: true, message: 'Hesap oluşturuldu! Giriş yapabilirsin.' });
    });

    // GİRİŞ
    socket.on('login', ({ username, password }, cb) => {
        const user = Object.values(db.users).find(
            u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
        );
        if (!user) return cb({ success: false, message: 'Kullanıcı adı veya şifre hatalı.' });

        const old = findSocket(user.id);
        if (old && old !== socket.id) delete db.sessions[old];
        db.sessions[socket.id] = user.id;
        user.servers.forEach(sId => socket.join(sId));

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

        // Hangi arkadaşlar çevrimiçi?
        const onlineFriendIds = user.friends.filter(fId => isOnline(fId));

        cb({
            success: true,
            user: { id: user.id, username: user.username, profilePic: user.profilePic, status: user.status || 'online' },
            servers: user.servers.map(sId => db.servers[sId]).filter(Boolean),
            friends: user.friends.map(fId => {
                const f = db.users[fId];
                return f ? { id: f.id, username: f.username, profilePic: f.profilePic } : null;
            }).filter(Boolean),
            friendRequests: db.friendRequests[user.id] || [],
            onlineFriendIds,
        });
    });

    // PROFİL GÜNCELLE
    socket.on('update-profile', ({ newUsername, newPassword, status }, cb) => {
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
                delete db.servers[sId]; // Basit silme
            } else if (srv) {
                srv.members = srv.members.filter(id => id !== uid);
            }
        });
        delete db.users[uid];
        delete db.sessions[socket.id];
        cb({ success: true });
    });

    // ARKADAŞ İSTEĞİ
    socket.on('send-friend-request', (targetUsername, cb) => {
        const uid = db.sessions[socket.id];
        if (!uid) return cb({ success: false, message: 'Giriş yapılmamış.' });
        const user = db.users[uid];
        const target = Object.values(db.users).find(u => u.username.toLowerCase() === targetUsername.toLowerCase());
        if (!target) return cb({ success: false, message: 'Kullanıcı bulunamadı.' });
        if (target.id === uid) return cb({ success: false, message: 'Kendinizi ekleyemezsiniz.' });
        if (user.friends.includes(target.id)) return cb({ success: false, message: 'Zaten arkadaşsınız.' });
        if (!db.friendRequests[target.id]) db.friendRequests[target.id] = [];
        if (db.friendRequests[target.id].find(r => r.fromId === uid))
            return cb({ success: false, message: 'İstek zaten gönderildi.' });

        const req = { fromId: uid, fromUsername: user.username, fromPic: user.profilePic, timestamp: new Date().toISOString() };
        db.friendRequests[target.id].push(req);
        const ts = findSocket(target.id);
        if (ts) io.to(ts).emit('receive-friend-request', req);
        cb({ success: true, message: `${target.username} adlı kullanıcıya istek gönderildi!` });
    });

    // ARKADAŞ KABUL
    socket.on('accept-friend-request', (fromId, cb) => {
        const uid = db.sessions[socket.id];
        if (!uid) return cb({ success: false });
        const user = db.users[uid], fromUser = db.users[fromId];
        if (!fromUser) return cb({ success: false, message: 'Kullanıcı bulunamadı.' });
        db.friendRequests[uid] = (db.friendRequests[uid] || []).filter(r => r.fromId !== fromId);
        if (!user.friends.includes(fromId)) user.friends.push(fromId);
        if (!fromUser.friends.includes(uid)) fromUser.friends.push(uid);
        const fs = findSocket(fromId);
        if (fs) io.to(fs).emit('friend-added', { id: user.id, username: user.username, profilePic: user.profilePic });
        cb({ success: true, friend: { id: fromUser.id, username: fromUser.username, profilePic: fromUser.profilePic } });
    });

    // ARKADAŞ İSTEĞİNİ REDDET
    socket.on('reject-friend-request', (fromId, cb) => {
        const uid = db.sessions[socket.id];
        if (!uid) return cb({ success: false });
        // Sadece UID'nin alındığı requester havuzundan o ID'yi sil, listeye ekleme
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
    socket.on('create-server', (name, cb) => {
        const uid = db.sessions[socket.id];
        if (!uid || !name?.trim()) return cb({ success: false });
        const user = db.users[uid];
        const serverId = generateId();
        const srv = {
            id: serverId, name: name.trim(), ownerId: uid,
            members: [uid],
            channels: [
                { id: generateId(), name: 'genel', type: 'text' },
                { id: generateId(), name: 'sohbet', type: 'text' },
                { id: generateId(), name: 'Ses Odası', type: 'voice' }
            ]
        };
        db.servers[serverId] = srv;
        user.servers.push(serverId);
        socket.join(serverId);
        cb({ success: true, server: srv });
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
        
        // Üyelerin listesinden çıkar
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
        socket.to(serverId).emit('channel-created', { serverId, channel: newChannel });
        cb({ success: true, channel: newChannel, server: srv });
    });

    // SUNUCUYA KATIL
    socket.on('join-server', (serverId, cb) => {
        const uid = db.sessions[socket.id];
        if (!uid) return cb({ success: false, message: 'Giriş yapılmamış.' });
        const user = db.users[uid];
        // Hem tam ID hem URL içi parametre destekle
        const srv = db.servers[serverId] || db.servers[serverId?.trim()];
        if (!srv) return cb({ success: false, message: 'Sunucu bulunamadı. Davet linki geçersiz olabilir.' });
        if (user.servers.includes(srv.id)) return cb({ success: false, message: 'Zaten bu sunucudasın.' });
        user.servers.push(srv.id);
        srv.members.push(uid);
        socket.join(srv.id);
        socket.to(srv.id).emit('server-member-joined', { serverId: srv.id, userId: uid, username: user.username });
        cb({ success: true, server: srv });
    });

    // SUNUCU ÜYELERİ
    socket.on('get-server-members', (serverId, cb) => {
        const uid = db.sessions[socket.id];
        if (!uid) return;
        const srv = db.servers[serverId];
        if (!srv) return cb({ success: false, members: [] });
        const members = srv.members.map(mId => {
            const u = db.users[mId];
            if (!u) return null;
            const online = isOnline(mId);
            return {
                id: u.id, username: u.username, profilePic: u.profilePic,
                isOnline: online,
                status: online ? (u.status || 'online') : 'offline',
                isOwner: srv.ownerId === u.id,
            };
        }).filter(Boolean).sort((a, b) => (b.isOnline - a.isOnline) || a.username.localeCompare(b.username));
        cb({ success: true, members });
    });

    // KANALA KATIL
    socket.on('join-channel', ({ serverId, channelId, peerId }, cb) => {
        const uid = db.sessions[socket.id];
        if (!uid) return typeof cb === 'function' ? cb({ success: false }) : null;
        const user = db.users[uid];
        const srv = db.servers[serverId];
        const ch = srv?.channels.find(c => c.id === channelId);

        // Limit Odatı Kontrolü (Sadece ses kanalları odaları limitlidir)
        if (ch && ch.type === 'voice' && ch.limit > 0) {
            const currentUsers = voiceRooms[channelId] ? voiceRooms[channelId].length : 0;
            if (currentUsers >= ch.limit) {
                return typeof cb === 'function' ? cb({ success: false, message: 'Kanal dolu!' }) : null;
            }
        }

        // Eski ses kanalından çık
        for (const cId in voiceRooms) {
            const idx = voiceRooms[cId].findIndex(r => r.socketId === socket.id);
            if (idx !== -1) {
                const pId = voiceRooms[cId][idx].peerId;
                voiceRooms[cId].splice(idx, 1);
                socket.leave(cId);
                socket.to(cId).emit('user-disconnected', pId);
                // Sunucudakilere oda sayısının değiştiğini bildir
                socket.to(serverId).emit('channel-users-updated', cId, voiceRooms[cId].map(u => u.userId));
                break;
            }
        }

        socket.join(channelId);

        if (peerId) {
            if (!voiceRooms[channelId]) voiceRooms[channelId] = [];
            const existing = voiceRooms[channelId].map(p => ({ peerId: p.peerId, username: p.username }));
            voiceRooms[channelId].push({ socketId: socket.id, userId: uid, peerId, username: user.username });
            socket.to(channelId).emit('user-connected', peerId, user.username);
            
            // Limit vs sayısı için odaya katılanın sayısı da gönderilsin
            io.to(serverId).emit('channel-users-updated', channelId, voiceRooms[channelId].map(u => u.userId));
            
            if (typeof cb === 'function') cb({ success: true, existingPeers: existing });
        } else {
            if (typeof cb === 'function') cb({ success: true, existingPeers: [] });
        }
    });

    // KANALDAN AYRIL
    socket.on('leave-channel', (channelId, peerId) => {
        socket.leave(channelId);
        let srvId = null;
        // Hangi sunucuya ait olduğunu bulmak için:
        Object.values(db.servers).forEach(s => {
            if (s.channels.find(c => c.id === channelId)) srvId = s.id;
        });

        if (voiceRooms[channelId]) {
            voiceRooms[channelId] = voiceRooms[channelId].filter(u => u.socketId !== socket.id);
            if (srvId) io.to(srvId).emit('channel-users-updated', channelId, voiceRooms[channelId].map(u => u.userId));
        }
        socket.to(channelId).emit('user-disconnected', peerId);
    });

    // KANAL MESAJLARI GETİR
    socket.on('get-channel-messages', (channelId, cb) => {
        cb({ success: true, messages: db.channelMessages[channelId] || [] });
    });

    // KANAL MESAJI GÖNDER — sunucu odasına broadcast (güvenilir)
    socket.on('send-chat-message', ({ channelId, serverId, text }) => {
        const uid = db.sessions[socket.id];
        if (!uid || !text?.trim()) return;
        const user = db.users[uid];
        if (!db.channelMessages[channelId]) db.channelMessages[channelId] = [];
        const msg = { senderId: uid, sender: user.username, profilePic: user.profilePic, text: text.trim(), timestamp: new Date().toISOString() };
        db.channelMessages[channelId].push(msg);
        if (serverId) socket.to(serverId).emit('chat-message', { channelId, serverId, ...msg });
        else socket.to(channelId).emit('chat-message', { channelId, ...msg });
    });

    // DM GETIR
    socket.on('get-dms', (friendId, cb) => {
        const uid = db.sessions[socket.id];
        if (!uid) return cb({ success: false, messages: [] });
        cb({ success: true, messages: db.dms[getDmRoomId(uid, friendId)] || [] });
    });

    // DM GÖNDER
    socket.on('send-dm', ({ friendId, text }) => {
        const uid = db.sessions[socket.id];
        if (!uid || !text?.trim()) return;
        const user = db.users[uid];
        const room = getDmRoomId(uid, friendId);
        if (!db.dms[room]) db.dms[room] = [];
        const msg = { senderId: uid, sender: user.username, profilePic: user.profilePic, text: text.trim(), timestamp: new Date().toISOString() };
        db.dms[room].push(msg);
        const fs = findSocket(friendId);
        if (fs) {
            io.to(fs).emit('dm-message', { friendId: uid, message: msg });
            // Ayrı bildirim eventi — baloncuk için
            io.to(fs).emit('dm-notification', { fromId: uid, fromUsername: user.username });
        }
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
            const u = voiceRooms[cId].find(r => r.socketId === socket.id);
            if (u) {
                voiceRooms[cId] = voiceRooms[cId].filter(r => r.socketId !== socket.id);
                socket.to(cId).emit('user-disconnected', u.peerId);
                
                let srvId = null;
                Object.values(db.servers).forEach(s => {
                    if (s.channels.find(c => c.id === cId)) srvId = s.id;
                });
                if (srvId) io.to(srvId).emit('channel-users-updated', cId, voiceRooms[cId].map(x => x.userId));
            }
        }
        delete db.sessions[socket.id];
        console.log(`[-] ${socket.id}`);
    });
    
    // ORTAK ARKADAŞLAR/SUNUCULAR SORGUSU
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
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => console.log(`🚀 Nexus: http://localhost:${PORT}`));
