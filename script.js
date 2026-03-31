/**
 * NEXUS - Premium Voice & Chat Application
 * Bu dosya uygulamanın tüm istemci tarafı mantığını içerir.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ============================================================
    // 1. STATE & SELECTORS
    // ============================================================
    const socket = io();
    let currentUser = null;
    let friends = [];
    let servers = [];
    let currentServerId = null;
    let currentChannelId = null;
    let currentChannelType = 'text'; // 'text' | 'voice'
    let currentContext = 'friends'; // 'friends' | 'server'
    let currentDmFriend = null;

    let localStream = null;
    let screenStream = null;
    let myPeer = null;
    let peers = {}; // peerId -> call
    let isMuted = false;
    let isDeafened = false;
    let isScreenSharing = false;

    // Renk ve Yazı Sabitleri
    const STATUS_COLOR = { online: '#00ff9d', idle: '#fbbf24', dnd: '#f87171', offline: '#64748b', invisible: '#64748b' };
    const STATUS_LABEL = { online: 'Çevrimiçi', idle: 'Boşta', dnd: 'Rahatsız Etmeyin', invisible: 'Görünmez' };

    const selectors = {
        authOverlay: document.getElementById('auth-overlay'),
        loginBox: document.getElementById('login-box'),
        registerBox: document.getElementById('register-box'),
        appContainer: document.getElementById('app-container'),
        
        // Buttons
        loginBtn: document.getElementById('login-btn'),
        registerBtn: document.getElementById('register-btn'),
        showRegisterBtn: document.getElementById('show-register-btn'),
        showLoginBtn: document.getElementById('show-login-btn'),
        logoutBtn: document.getElementById('pp-logout-btn'),

        // Inputs
        authUsername: document.getElementById('auth-username'),
        authPassword: document.getElementById('auth-password'),
        regUsername: document.getElementById('reg-username'),
        regPassword: document.getElementById('reg-password'),

        // UI Lists
        serverList: document.getElementById('dynamic-server-list'),
        channelList: document.getElementById('dynamic-channel-list'),
        membersList: document.getElementById('members-list'),
        chatMessages: document.getElementById('chat-messages'),
        
        // Panels & Views
        mainContent: document.querySelector('.main-content'),
        centerChatView: document.getElementById('center-chat-area'),
        welcomeMessage: document.getElementById('welcome-message'),
        voiceGrid: document.getElementById('voice-grid'),
        voiceControls: document.getElementById('voice-controls'),
        membersPanel: document.getElementById('members-panel'),
        
        // Header info
        headerTitle: document.getElementById('main-header-title'),
        headerIcon: document.getElementById('main-header-icon'),
        
        // Nav Buttons
        navFriends: document.getElementById('nav-friends'),
        navAddServer: document.getElementById('nav-add-server'),
        navJoinServer: document.getElementById('nav-join-server'),

        // Voice Controls
        micBtn: document.getElementById('mic-btn'),
        deafenBtn: document.getElementById('deafen-btn'),
        screenShareBtn: document.getElementById('screen-share-btn'),
        disconnectBtn: document.getElementById('disconnect-btn'),
        activeVoiceChannel: document.getElementById('active-voice-channel'),

        // User Profile
        myAvatar: document.getElementById('my-avatar'),
        myStatusDot: document.getElementById('my-status-dot'),
        myUsername: document.getElementById('my-username-display'),
        
        // Chat
        chatInput: document.getElementById('chat-input'),
        sendMessageBtn: document.getElementById('send-msg-btn'),
        
        // Modals
        createServerModal: document.getElementById('create-server-modal'),
        joinServerModal: document.getElementById('join-server-modal'),
        addFriendModal: document.getElementById('add-friend-modal'),
        profilePanel: document.getElementById('profile-panel'),
        toast: document.getElementById('toast'),
    };

    function initLucide() { if (window.lucide) lucide.createIcons(); }

    function showToast(msg, type = 'info') {
        selectors.toast.textContent = msg;
        selectors.toast.className = `toast show ${type}`;
        setTimeout(() => selectors.toast.classList.remove('show'), 3000);
    }

    // ============================================================
    // 2. AUTHENTICATION
    // ============================================================

    selectors.showRegisterBtn.onclick = () => {
        selectors.loginBox.style.display = 'none';
        selectors.registerBox.style.display = 'block';
        updateAvatarPreview();
    };

    selectors.showLoginBtn.onclick = () => {
        selectors.registerBox.style.display = 'none';
        selectors.loginBox.style.display = 'block';
    };

    selectors.loginBtn.onclick = () => {
        const username = selectors.authUsername.value.trim();
        const password = selectors.authPassword.value;
        if (!username || !password) return showToast('Lütfen tüm alanları doldurun.', 'error');

        socket.emit('login', { username, password }, (res) => {
            if (res.success) handleAuthSuccess(res);
            else document.getElementById('auth-error').textContent = res.message;
        });
    };

    selectors.registerBtn.onclick = () => {
        const username = selectors.regUsername.value.trim();
        const password = selectors.regPassword.value;
        const avatar = document.getElementById('auth-avatar-preview').querySelector('img').src;

        if (!username || !password) return showToast('Lütfen tüm alanları doldurun.', 'error');
        if (password.length < 6) return showToast('Şifre en az 6 karakter olmalıdır.', 'error');

        socket.emit('register', { username, password, avatar }, (res) => {
            if (res.success) handleAuthSuccess(res);
            else document.getElementById('reg-error').textContent = res.message;
        });
    };

    function handleAuthSuccess(data) {
        currentUser = data.user;
        friends = data.friends || [];
        servers = data.servers || [];
        
        selectors.authOverlay.style.display = 'none';
        selectors.appContainer.style.display = 'flex';
        
        selectors.myUsername.textContent = currentUser.username;
        selectors.myAvatar.querySelector('img').src = currentUser.avatar;
        selectors.myStatusDot.style.background = STATUS_COLOR[currentUser.status || 'online'];
        
        initWebRTC();
        renderServerList();
        renderSidebar();
        showToast(`Tekrar hoş geldin, ${currentUser.username}!`);
    }

    selectors.logoutBtn.onclick = () => location.reload();

    function updateAvatarPreview() {
        const preview = document.getElementById('auth-avatar-preview').querySelector('img');
        const seed = Math.random().toString(36).substring(7);
        preview.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
    }
    document.getElementById('refresh-avatar-btn').onclick = updateAvatarPreview;

    // ============================================================
    // 3. UI RENDERING
    // ============================================================

    function renderServerList() {
        selectors.serverList.innerHTML = '';
        servers.forEach(server => {
            const btn = document.createElement('div');
            btn.className = `server-icon ${currentServerId === server.id ? 'active' : ''}`;
            btn.textContent = server.name[0].toUpperCase();
            btn.title = server.name;
            btn.onclick = () => switchToServer(server.id);
            selectors.serverList.appendChild(btn);
        });
    }

    function renderSidebar() {
        selectors.channelList.innerHTML = '';
        
        if (currentContext === 'friends') {
            document.getElementById('sidebar-context-title').textContent = 'ARKADAŞLAR';
            
            if (friends.length === 0) {
                const empty = document.createElement('div');
                empty.className = 'ch-section-header';
                empty.style.textAlign = 'center';
                empty.style.marginTop = '20px';
                empty.textContent = 'Henüz arkadaşın yok.';
                selectors.channelList.appendChild(empty);
                return;
            }

            const header = document.createElement('div');
            header.className = 'ch-section-header';
            header.textContent = `TÜM ARKADAŞLAR — ${friends.length}`;
            selectors.channelList.appendChild(header);

            friends.forEach(f => {
                const li = document.createElement('li');
                li.className = `ch-item ${currentDmFriend?.id === f.id ? 'active' : ''}`;
                li.innerHTML = `
                    <div style="position:relative;">
                        <img src="${f.avatar}" style="width:32px;height:32px;border-radius:10px;">
                        <span style="position:absolute;bottom:-2px;right:-2px;width:10px;height:10px;border-radius:50%;background:${STATUS_COLOR[f.status]};border:2px solid #1a1a2e;"></span>
                    </div>
                    <span>${f.username}</span>
                `;
                li.onclick = () => switchToDM(f);
                selectors.channelList.appendChild(li);
            });
        } else if (currentContext === 'server') {
            const server = servers.find(s => s.id === currentServerId);
            if (!server) return;

            document.getElementById('sidebar-context-title').textContent = server.name;

            // Ses Kanalları
            if (server.channels.length > 0) {
                const head = document.createElement('div');
                head.className = 'ch-section-header';
                head.textContent = 'SES KANALLARI';
                selectors.channelList.appendChild(head);

                server.channels.forEach(ch => {
                    const li = document.createElement('li');
                    li.className = `ch-item ${currentChannelId === ch.id ? 'active' : ''}`;
                    li.innerHTML = `<i data-lucide="volume-2"></i> <span>${ch.name}</span>`;
                    li.onclick = () => joinVoice(ch.id);
                    selectors.channelList.appendChild(li);
                });
            }
            initLucide();
        }
    }

    function renderMembers() {
        if (!currentServerId) return;
        selectors.membersList.innerHTML = '';
        socket.emit('get-server-members', currentServerId, (members) => {
            members.forEach(m => {
                const div = document.createElement('div');
                div.className = 'ch-item';
                div.style.cursor = 'default';
                div.innerHTML = `
                    <div style="position:relative;">
                        <img src="${m.avatar}" style="width:24px;height:24px;border-radius:6px;">
                        <span style="position:absolute;bottom:-1px;right:-1px;width:7px;height:7px;border-radius:50%;background:${STATUS_COLOR[m.status]};border:1.5px solid #1a1a2e;"></span>
                    </div>
                    <span style="font-size:13px;">${m.username}</span>
                `;
                selectors.membersList.appendChild(div);
            });
        });
    }

    // ============================================================
    // 4. CONTEXT SWITCHING
    // ============================================================

    function switchToServer(serverId) {
        currentContext = 'server';
        currentServerId = serverId;
        currentDmFriend = null;
        
        selectors.navFriends.classList.remove('active');
        renderServerList();
        renderSidebar();
        renderMembers();

        selectors.welcomeMessage.style.display = 'flex';
        selectors.centerChatView.style.display = 'none';
        selectors.membersPanel.style.display = 'flex';
        
        const server = servers.find(s => s.id === serverId);
        selectors.headerTitle.textContent = server.name;
        selectors.headerIcon.setAttribute('data-lucide', 'hash');
        initLucide();
    }

    function switchToDM(friend) {
        currentDmFriend = friend;
        currentChannelId = null;
        currentServerId = null;
        
        selectors.welcomeMessage.style.display = 'none';
        selectors.centerChatView.style.display = 'flex';
        selectors.membersPanel.style.display = 'none';
        selectors.chatInput.disabled = false;
        selectors.chatInput.placeholder = `${friend.username} kullanıcısına mesaj gönder...`;
        
        selectors.headerTitle.textContent = friend.username;
        selectors.headerIcon.setAttribute('data-lucide', 'at-sign');
        
        selectors.chatMessages.innerHTML = '';
        socket.emit('get-messages', { friendId: friend.id }, (msgs) => {
            msgs.forEach(appendMessage);
        });
        
        renderSidebar();
        initLucide();
    }

    selectors.navFriends.onclick = () => {
        currentContext = 'friends';
        currentServerId = null;
        currentDmFriend = null;
        selectors.navFriends.classList.add('active');
        renderServerList();
        renderSidebar();
        
        selectors.welcomeMessage.style.display = 'flex';
        selectors.centerChatView.style.display = 'none';
        selectors.membersPanel.style.display = 'none';
        selectors.headerTitle.textContent = 'Arkadaşlar';
        selectors.headerIcon.setAttribute('data-lucide', 'users');
        initLucide();
    };

    // ============================================================
    // 5. CHAT & MESSAGING
    // ============================================================

    selectors.sendMessageBtn.onclick = sendMessage;
    selectors.chatInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

    function sendMessage() {
        const text = selectors.chatInput.value.trim();
        if (!text) return;
        
        const payload = {
            text,
            toId: currentDmFriend?.id,
            serverId: currentServerId,
            channelId: currentChannelId
        };

        socket.emit('send-message', payload, (res) => {
            if (res.success) {
                selectors.chatInput.value = '';
                appendMessage(res.message);
            }
        });
    }

    function appendMessage(msg) {
        const isSelf = msg.authorId === currentUser.id;
        const author = isSelf ? currentUser : (friends.find(f => f.id === msg.authorId) || { username: 'Kullanıcı', avatar: '' });
        
        const div = document.createElement('div');
        div.className = `message ${isSelf ? 'self' : ''}`;
        div.innerHTML = `
            <img src="${author.avatar}" class="msg-avatar">
            <div class="msg-body">
                ${!isSelf ? `<div style="font-weight:700;font-size:10px;color:rgba(255,255,255,0.4);margin-bottom:2px;">${author.username}</div>` : ''}
                <div>${msg.text}</div>
            </div>
        `;
        selectors.chatMessages.appendChild(div);
        selectors.chatMessages.scrollTop = selectors.chatMessages.scrollHeight;
    }

    socket.on('receive-message', (msg) => {
        if (currentDmFriend && msg.authorId === currentDmFriend.id) {
            appendMessage(msg);
        } else if (currentServerId && msg.serverId === currentServerId) {
            appendMessage(msg);
        } else {
            showToast(`Yeni mesaj: ${msg.text.substring(0, 20)}...`);
        }
    });

    // ============================================================
    // 6. WEBRTC (SESLİ KANALLAR)
    // ============================================================

    async function initWebRTC() {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        } catch (err) {
            console.error('Mikrofon erişimi engellendi:', err);
            showToast('Mikrofon erişimi gerekli!', 'error');
        }

        // PeerJS Setup
        const peerPort = location.port || (location.protocol === 'https:' ? '443' : '80');
        myPeer = new Peer(undefined, { 
            host: location.hostname, 
            port: peerPort, 
            path: '/peerjs',
            secure: location.protocol === 'https:'
        });
        
        myPeer.on('open', (id) => {
            console.log('Peer ID:', id);
            socket.emit('join-peer', id);
        });

        myPeer.on('call', (call) => {
            call.answer(localStream);
            const video = document.createElement('video');
            call.on('stream', (userStream) => {
                handleRemoteStream(call.peer, userStream);
            });
        });
    }

    async function joinVoice(channelId) {
        if (currentChannelId === channelId) return;
        if (currentChannelId) leaveVoice();

        currentChannelId = channelId;
        currentChannelType = 'voice';
        
        selectors.welcomeMessage.style.display = 'none';
        selectors.centerChatView.style.display = 'none';
        selectors.voiceGrid.style.display = 'grid';
        selectors.voiceControls.style.display = 'flex';
        
        const server = servers.find(s => s.id === currentServerId);
        const channel = server.channels.find(c => c.id === channelId);
        selectors.activeVoiceChannel.textContent = channel.name;

        socket.emit('join-voice', { channelId });
        renderSidebar();
    }

    function leaveVoice(emit = true) {
        if (!currentChannelId) return;
        
        if (emit) socket.emit('leave-voice');
        
        Object.values(peers).forEach(call => call.close());
        peers = {};
        
        selectors.voiceGrid.innerHTML = '';
        selectors.voiceGrid.style.display = 'none';
        selectors.voiceControls.style.display = 'none';
        selectors.welcomeMessage.style.display = 'flex';
        
        currentChannelId = null;
        currentChannelType = 'text';
        renderSidebar();
    }

    function handleRemoteStream(peerId, stream) {
        if (peers[peerId]) return;
        
        const template = document.getElementById('user-card-template');
        const card = template.content.cloneNode(true).querySelector('.voice-card');
        card.dataset.peerId = peerId;
        
        const audio = card.querySelector('audio');
        audio.srcObject = stream;
        
        socket.emit('get-user-by-peer', peerId, (user) => {
            if (user) {
                card.querySelector('.user-label').textContent = user.username;
                card.querySelector('.avatar-circle').style.backgroundImage = `url(${user.avatar})`;
            }
        });

        // Ses analizi için (Konuşma efekti)
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        source.connect(analyser);
        card._analyser = analyser;

        selectors.voiceGrid.appendChild(card);
    }

    socket.on('user-joined-voice', ({ peerId, userId }) => {
        if (peerId === myPeer?.id) return;
        const call = myPeer.call(peerId, localStream);
        call.on('stream', (userStream) => {
            handleRemoteStream(peerId, userStream);
        });
        peers[peerId] = call;
    });

    socket.on('user-left-voice', (peerId) => {
        if (peers[peerId]) {
            peers[peerId].close();
            delete peers[peerId];
        }
        const card = document.querySelector(`[data-peer-id="${peerId}"]`);
        if (card) card.remove();
    });

    // ============================================================
    // 7. OTHER UI LOGIC
    // ============================================================

    selectors.navAddServer.onclick = () => selectors.createServerModal.style.display = 'flex';
    selectors.navJoinServer.onclick = () => selectors.joinServerModal.style.display = 'flex';
    document.getElementById('btn-add-friend').onclick = () => selectors.addFriendModal.style.display = 'flex';
    selectors.myAvatar.onclick = () => selectors.profilePanel.style.display = 'flex';

    document.getElementById('confirm-create-server').onclick = () => {
        const name = document.getElementById('new-server-name').value.trim();
        if (!name) return;
        socket.emit('create-server', name, (res) => {
            if (res.success) {
                servers.push(res.server);
                renderServerList();
                selectors.createServerModal.style.display = 'none';
                showToast('Sunucu başarıyla oluşturuldu!');
            }
        });
    };

    document.getElementById('confirm-add-friend').onclick = () => {
        const username = document.getElementById('new-friend-username').value.trim();
        if (!username) return;
        socket.emit('add-friend', username, (res) => {
            if (res.success) {
                friends.push(res.friend);
                renderSidebar();
                selectors.addFriendModal.style.display = 'none';
                showToast('Arkadaşlık isteği gönderildi/eklendi.');
            } else {
                document.getElementById('add-friend-message').textContent = res.message;
            }
        });
    };

    // Konuşma animasyonu döngüsü
    function animationLoop() {
        if (currentChannelType === 'voice') {
            const dataArray = new Uint8Array(128);
            document.querySelectorAll('.voice-card').forEach(card => {
                if (card._analyser) {
                    card._analyser.getByteFrequencyData(dataArray);
                    const avg = dataArray.reduce((acc, v) => acc + v, 0) / dataArray.length;
                    card.classList.toggle('speaker-active', avg > 15);
                }
            });
        }
        requestAnimationFrame(animationLoop);
    }
    animationLoop();
});
