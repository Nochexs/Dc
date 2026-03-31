/**
 * NEXUS - Premium Voice & Chat Application
 * Consolidated & Cleaned Implementation (Post-Conflict Resolution)
 */

document.addEventListener('DOMContentLoaded', () => {
    // ============================================================
    // 1. STATE & SELECTORS
    // ============================================================
    
    // --- DOM Selectors ---
    const selectors = {
        authOverlay: document.getElementById('auth-overlay'),
        loginBox: document.getElementById('login-box'),
        registerBox: document.getElementById('register-box'),
        appContainer: document.getElementById('app-container'),
        
        // Auth
        loginBtn: document.getElementById('login-btn'),
        registerBtn: document.getElementById('register-btn'),
        showRegisterBtn: document.getElementById('show-register-btn'),
        showLoginBtn: document.getElementById('show-login-btn'),
        authUsername: document.getElementById('auth-username'),
        authPassword: document.getElementById('auth-password'),
        regUsername: document.getElementById('reg-username'),
        regPassword: document.getElementById('reg-password'),
        authError: document.getElementById('auth-error'),
        regError: document.getElementById('reg-error'),
        authAvatarPreview: document.querySelector('#auth-avatar-preview img'),
        
        // Navigation (Rail & Sidebar)
        serverList: document.getElementById('dynamic-server-list'),
        channelList: document.getElementById('dynamic-channel-list'),
        navFriends: document.getElementById('nav-friends'),
        sidebarTitle: document.getElementById('sidebar-context-title'),
        
        // Main Header
        headerTitle: document.getElementById('main-header-title'),
        headerIcon: document.getElementById('main-header-icon'),
        
        // Chat Area
        chatMessages: document.getElementById('chat-messages'),
        chatInput: document.getElementById('chat-input'),
        sendMsgBtn: document.getElementById('send-msg-btn'),
        welcomeMessage: document.getElementById('welcome-message'),
        centerChatView: document.getElementById('center-chat-view'),
        
        // Voice UI
        voiceGrid: document.getElementById('voice-grid'),
        voiceControls: document.getElementById('voice-controls'),
        activeVoiceChannel: document.getElementById('active-voice-channel'),
        micBtn: document.getElementById('mic-btn'),
        deafenBtn: document.getElementById('deafen-btn'),
        screenShareBtn: document.getElementById('screen-share-btn'),
        disconnectBtn: document.getElementById('disconnect-btn'),
        
        // Panels
        membersPanel: document.getElementById('members-panel'),
        membersList: document.getElementById('members-list'),
        friendProfileView: document.getElementById('friend-profile-view'),
        toggleMembersBtn: document.getElementById('toggle-members-btn'),
        
        // User Profile (Sidebar Footer)
        myAvatar: document.querySelector('#my-avatar img'),
        myUsernameDisplay: document.getElementById('my-username-display'),
        myStatusDot: document.querySelector('.my-status-dot'),
        
        // Modals
        createServerModal: document.getElementById('create-server-modal'),
        joinServerModal: document.getElementById('join-server-modal'),
        addFriendModal: document.getElementById('add-friend-modal'),
        settingsModal: document.getElementById('settings-modal'),
        
        // Toast & Context Menu
        toast: document.getElementById('toast'),
        contextMenu: document.getElementById('context-menu')
    };

    // --- Global State ---
    let socket = io('/', { transports: ['websocket', 'polling'] });
    let myPeer = null;
    let currentUser = null;
    let friends = [];
    let servers = [];
    let pendingRequests = [];
    let onlineFriends = new Set();
    let currentContext = 'friends'; // 'friends' or serverId
    let currentServerId = null;
    let currentChannelId = null;
    let currentChannelType = null; // 'text', 'voice', 'dm'
    let currentDmFriend = null;
    
    let peers = {}; // active PeerJS calls
    let localStream = null;
    let screenStream = null;
    let isMuted = false;
    let isDeafened = false;
    let isScreenSharing = false;
    
    // Audio Processing
    let audioCtx = null;
    let micAnalyser = null;
    let micGainNode = null;
    let audioDevices = [];
    let selectedMicId = 'default';

    const STATUS_COLOR = { online: '#00ff9d', idle: '#facc15', dnd: '#ff4d4d', offline: '#94a3b8', invisible: '#94a3b8' };
    const STATUS_LABEL = { online: 'Çevrimiçi', idle: 'Boşta', dnd: 'Rahatsız Etmeyin', offline: 'Çevrimdışı', invisible: 'Görünmez' };

    // ============================================================
    // 2. UTILS
    // ============================================================
    
    function initLucide() { if (window.lucide) lucide.createIcons(); }
    
    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    
    function timeStr(ts) {
        if (!ts) return '';
        const d = new Date(ts), now = new Date();
        const opts = { hour: '2-digit', minute: '2-digit' };
        if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('tr-TR', opts);
        return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('tr-TR', opts);
    }
    
    function showToast(msg, type = 'success') {
        if (!selectors.toast) return;
        selectors.toast.textContent = msg;
        selectors.toast.className = `toast show toast-${type}`;
        clearTimeout(selectors.toast._t);
        selectors.toast._t = setTimeout(() => selectors.toast.classList.remove('show'), 3000);
    }

    // ============================================================
    // 3. AUTH LOGIC
    // ============================================================
    
    let avatarSeed = Math.random().toString(36).substring(7);
    const updateAvatarPreview = () => {
        selectors.authAvatarPreview.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
    };

    document.getElementById('refresh-avatar-btn')?.addEventListener('click', () => {
        avatarSeed = Math.random().toString(36).substring(7);
        updateAvatarPreview();
    });

    const handleAuth = (type) => {
        const username = type === 'login' ? selectors.authUsername.value.trim() : selectors.regUsername.value.trim();
        const password = type === 'login' ? selectors.authPassword.value.trim() : selectors.regPassword.value.trim();
        const errorEl = type === 'login' ? selectors.authError : selectors.regError;

        if (!username || !password) {
            errorEl.textContent = 'Lütfen tüm alanları doldurun.';
            return;
        }
        
        const profilePic = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
        
        socket.emit(type, { username, password, profilePic }, (res) => {
            if (res.success) {
                if (type === 'login') {
                    currentUser = res.user;
                    friends = res.friends || [];
                    servers = res.servers || [];
                    pendingRequests = res.friendRequests || [];
                    
                    selectors.authOverlay.style.display = 'none';
                    selectors.appContainer.style.display = 'flex';
                    selectors.myAvatar.src = currentUser.profilePic;
                    selectors.myUsernameDisplay.textContent = currentUser.username;
                    
                    initWebRTC();
                    renderServerList();
                    renderSidebar();
                    initLucide();
                    
                    // Join invite if redirected
                    const urlParams = new URLSearchParams(window.location.search);
                    const invite = urlParams.get('invite');
                    if (invite) {
                        socket.emit('join-server', invite, (joinRes) => {
                            if (joinRes.success) {
                                servers.push(joinRes.server);
                                renderServerList();
                                activateServer(joinRes.server);
                                showToast(`"${joinRes.server.name}" sunucusuna katıldın!`);
                            }
                        });
                    }
                } else {
                    showToast('Kayıt başarılı! Şimdi giriş yapabilirsin.', 'success');
                    selectors.showLoginBtn.click();
                    selectors.authUsername.value = username;
                }
            } else {
                errorEl.textContent = res.message;
            }
        });
    };

    selectors.loginBtn?.addEventListener('click', () => handleAuth('login'));
    selectors.registerBtn?.addEventListener('click', () => handleAuth('register'));
    selectors.showRegisterBtn?.addEventListener('click', () => {
        selectors.loginBox.style.display = 'none';
        selectors.registerBox.style.display = 'block';
    });
    selectors.showLoginBtn?.addEventListener('click', () => {
        selectors.registerBox.style.display = 'none';
        selectors.loginBox.style.display = 'block';
    });

    // ============================================================
    // 4. RENDERING (RAIL, SIDEBAR, MEMBERS)
    // ============================================================
    
    function renderServerList() {
        selectors.serverList.innerHTML = '';
        servers.forEach(s => {
            const el = document.createElement('div');
            el.className = `rail-btn tooltip ${currentContext === s.id ? 'active' : ''}`;
            el.setAttribute('data-tooltip', s.name);
            el.innerHTML = s.name.substring(0, 1).toUpperCase();
            el.addEventListener('click', () => activateServer(s));
            selectors.serverList.appendChild(el);
        });
        initLucide();
    }

    function renderSidebar() {
        selectors.channelList.innerHTML = '';
        
        if (currentContext === 'friends') {
            selectors.sidebarTitle.textContent = 'ARDAŞLAR';
            if (friends.length === 0) {
                const li = document.createElement('li');
                li.className = 'ch-item';
                li.style.opacity = '0.5';
                li.textContent = 'Henüz arkadaşın yok.';
                selectors.channelList.appendChild(li);
            }
            friends.forEach(f => {
                const li = document.createElement('li');
                li.className = `ch-item ${currentDmFriend?.id === f.id ? 'active' : ''}`;
                li.innerHTML = `<img src="${f.profilePic}" style="width:24px;height:24px;border-radius:8px;"> <span>${escapeHtml(f.username)}</span>`;
                li.addEventListener('click', () => openDM(f));
                selectors.channelList.appendChild(li);
            });
        } else {
            const server = servers.find(s => s.id === currentContext);
            if (!server) return;
            selectors.sidebarTitle.textContent = server.name.toUpperCase();
            
            // Text Channels
            const textHeader = document.createElement('li');
            textHeader.className = 'ch-section-header';
            textHeader.textContent = 'METİN KANALLARI';
            selectors.channelList.appendChild(textHeader);
            
            server.channels.filter(c => c.type === 'text').forEach(ch => {
                const li = document.createElement('li');
                li.className = `ch-item ${currentChannelId === ch.id ? 'active' : ''}`;
                li.innerHTML = `<i data-lucide="hash"></i> <span>${escapeHtml(ch.name)}</span>`;
                li.addEventListener('click', () => joinChannel(server.id, ch));
                selectors.channelList.appendChild(li);
            });

            // Voice Channels
            const voiceHeader = document.createElement('li');
            voiceHeader.className = 'ch-section-header';
            voiceHeader.textContent = 'SES KANALLARI';
            selectors.channelList.appendChild(voiceHeader);
            
            server.channels.filter(c => c.type === 'voice').forEach(ch => {
                const li = document.createElement('li');
                li.className = `ch-item ${currentChannelId === ch.id ? 'active voice-active' : ''}`;
                li.innerHTML = `<i data-lucide="volume-2"></i> <span>${escapeHtml(ch.name)}</span>`;
                li.addEventListener('click', () => joinChannel(server.id, ch));
                selectors.channelList.appendChild(li);
            });
        }
        initLucide();
    }

    function activateServer(server) {
        currentContext = server.id;
        currentServerId = server.id;
        currentDmFriend = null;
        selectors.navFriends.classList.remove('active');
        renderServerList();
        renderSidebar();
        
        selectors.headerTitle.textContent = server.name;
        selectors.headerIcon.setAttribute('data-lucide', 'server');
        selectors.welcomeMessage.style.display = 'none';
        selectors.centerChatView.style.display = 'flex';
        selectors.membersPanel.style.display = 'flex';
        selectors.friendProfileView.style.display = 'none';
        
        // Auto-join first text channel
        const firstText = server.channels.find(c => c.type === 'text');
        if (firstText) joinChannel(server.id, firstText);
        
        socket.emit('get-server-members', server.id, (res) => {
            if (res.success) renderMembers(res.members);
        });
        initLucide();
    }

    function renderMembers(members) {
        selectors.membersList.innerHTML = '';
        const online = members.filter(m => m.isOnline);
        const offline = members.filter(m => !m.isOnline);

        const addSection = (title, list) => {
            if (list.length === 0) return;
            const hdr = document.createElement('div');
            hdr.className = 'members-section-hdr';
            hdr.textContent = `${title} — ${list.length}`;
            selectors.membersList.appendChild(hdr);
            
            list.forEach(m => {
                const el = document.createElement('div');
                el.className = 'member-row';
                el.innerHTML = `
                    <div style="position:relative;">
                        <img src="${m.profilePic}" class="member-avatar">
                        <span class="status-dot-sm" style="background:${STATUS_COLOR[m.status] || STATUS_COLOR.offline}"></span>
                    </div>
                    <div class="member-info">
                        <span class="member-name">${escapeHtml(m.username)}</span>
                        <span class="member-st">${STATUS_LABEL[m.status] || 'Çevrimdışı'}</span>
                    </div>
                `;
                selectors.membersList.appendChild(el);
            });
        };

        addSection('ÇEVRİMİÇİ', online);
        addSection('ÇEVRİMDIŞI', offline);
    }

    // ============================================================
    // 5. MESSAGING & CHANNELS
    // ============================================================
    
    function joinChannel(serverId, channel) {
        if (currentChannelId === channel.id) return;
        
        currentChannelId = channel.id;
        currentChannelType = channel.type;
        renderSidebar();
        
        if (channel.type === 'text') {
            selectors.voiceGrid.style.display = 'none';
            selectors.voiceControls.style.display = 'none';
            selectors.chatMessages.style.display = 'flex';
            selectors.headerTitle.textContent = channel.name;
            selectors.headerIcon.setAttribute('data-lucide', 'hash');
            selectors.chatInput.disabled = false;
            selectors.chatInput.placeholder = `#${channel.name} kanalına yaz...`;
            selectors.chatMessages.innerHTML = '';
            
            socket.emit('get-channel-messages', channel.id, (res) => {
                if (res.success) res.messages.forEach(m => appendMessage(m));
            });
        } else {
            // Voice channel join
            joinVoice(serverId, channel);
        }
        initLucide();
    }

    function openDM(friend) {
        currentContext = 'friends';
        currentServerId = null;
        currentDmFriend = friend;
        currentChannelId = `dm_${friend.id}`;
        currentChannelType = 'dm';
        
        selectors.navFriends.classList.add('active');
        renderServerList();
        renderSidebar();
        
        selectors.headerTitle.textContent = friend.username;
        selectors.headerIcon.setAttribute('data-lucide', 'at-sign');
        selectors.welcomeMessage.style.display = 'none';
        selectors.centerChatView.style.display = 'flex';
        selectors.membersPanel.style.display = 'none';
        selectors.friendProfileView.style.display = 'none';
        selectors.chatInput.disabled = false;
        selectors.chatInput.placeholder = `${friend.username} ile mesajlaş...`;
        selectors.chatMessages.innerHTML = '';
        
        socket.emit('get-dms', friend.id, (res) => {
            if (res.success) res.messages.forEach(m => appendMessage(m));
        });
        initLucide();
    }

    function appendMessage(msg) {
        const isSelf = msg.senderId === currentUser.id;
        const div = document.createElement('div');
        div.className = `message ${isSelf ? 'self' : ''}`;
        div.innerHTML = `
            <img class="msg-avatar" src="${msg.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender}`}">
            <div class="msg-body">
                <div class="msg-meta">
                    <strong>${escapeHtml(msg.sender)}</strong>
                    <span class="msg-time">${timeStr(msg.timestamp)}</span>
                </div>
                <span class="msg-text">${escapeHtml(msg.text)}</span>
            </div>
        `;
        selectors.chatMessages.appendChild(div);
        selectors.chatMessages.scrollTop = selectors.chatMessages.scrollHeight;
    }

    function sendMessage() {
        const text = selectors.chatInput.value.trim();
        if (!text || !currentChannelId) return;
        
        const payload = { text, timestamp: new Date().toISOString() };
        
        if (currentChannelType === 'dm') {
            socket.emit('send-dm', { friendId: currentDmFriend.id, text });
            appendMessage({ sender: currentUser.username, senderId: currentUser.id, text, profilePic: currentUser.profilePic, timestamp: payload.timestamp });
        } else {
            socket.emit('send-chat-message', { channelId: currentChannelId, serverId: currentServerId, text });
            // appendMessage is handled by socket event for text channels normally, 
            // but let's append locally for immediate feedback if desired. 
            // Re-sync with server event logic:
        }
        selectors.chatInput.value = '';
    }

    selectors.sendMsgBtn?.addEventListener('click', sendMessage);
    selectors.chatInput?.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });

    // ============================================================
    // 6. VOICE & WEBRTC
    // ============================================================
    
    function initWebRTC() {
        if (myPeer) return;
        myPeer = new Peer(undefined, { host: '0.peerjs.com', port: 443, secure: true });
        
        myPeer.on('open', id => console.log('PeerJS ID:', id));
        
        myPeer.on('call', call => {
            call.answer(isScreenSharing ? screenStream : localStream);
            call.on('stream', remoteStream => handleRemoteStream(call.peer, remoteStream));
            peers[call.peer] = call;
        });

        // Pre-fetch mic access
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            localStream = stream;
            loadAudioDevices();
        }).catch(err => showToast('Mikrofon erişimi engellendi.', 'error'));
    }

    async function loadAudioDevices() {
        const devices = await navigator.mediaDevices.enumerateDevices();
        audioDevices = devices.filter(d => d.kind === 'audioinput');
    }

    function joinVoice(serverId, channel) {
        if (!myPeer) return;
        
        leaveVoice(false); // Clean previous if any
        
        currentChannelId = channel.id;
        currentChannelType = 'voice';
        
        selectors.voiceGrid.style.display = 'grid';
        selectors.voiceControls.style.display = 'flex';
        selectors.chatMessages.style.display = 'none';
        selectors.chatInput.disabled = true;
        selectors.activeVoiceChannel.textContent = channel.name;
        
        renderSidebar();
        
        addVoiceCard(myPeer.id, currentUser.username, true);
        
        socket.emit('join-channel', { serverId, channelId: channel.id, peerId: myPeer.id }, (res) => {
            if (res.success && res.existingPeers) {
                res.existingPeers.forEach(p => {
                    addVoiceCard(p.peerId, p.username, false);
                    const call = myPeer.call(p.peerId, isScreenSharing ? screenStream : localStream);
                    call.on('stream', rs => handleRemoteStream(p.peerId, rs));
                    peers[p.peerId] = call;
                });
            }
        });
    }

    function leaveVoice(notifyServer = true) {
        if (notifyServer && currentChannelId && currentChannelType === 'voice') {
            socket.emit('leave-channel', currentChannelId, myPeer?.id);
        }
        
        Object.values(peers).forEach(call => call.close());
        peers = {};
        
        selectors.voiceGrid.innerHTML = '';
        selectors.voiceGrid.style.display = 'none';
        selectors.voiceControls.style.display = 'none';
        currentChannelId = null;
        currentChannelType = null;
        renderSidebar();
    }

    function handleRemoteStream(peerId, stream) {
        const card = document.querySelector(`[data-peer-id="${peerId}"]`);
        if (!card) return;
        
        const audio = card.querySelector('audio');
        if (audio) {
            audio.srcObject = stream;
            audio.volume = isDeafened ? 0 : 1;
        }

        const video = card.querySelector('video');
        if (video && stream.getVideoTracks().length > 0) {
            video.srcObject = stream;
            video.style.display = 'block';
            card.classList.add('is-sharing-screen');
        } else if (video) {
            video.style.display = 'none';
            card.classList.remove('is-sharing-screen');
        }
        
        // Speaking animation detection
        if (stream.getAudioTracks().length > 0) {
            setupSpeakingDetection(peerId, stream);
        }
    }

    function setupSpeakingDetection(peerId, stream) {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const card = document.querySelector(`[data-peer-id="${peerId}"]`);
        if (!card) return;

        const src = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        src.connect(analyser);
        card._analyser = analyser;
    }

    function addVoiceCard(peerId, username, isSelf) {
        const div = document.createElement('div');
        div.className = 'voice-card';
        div.setAttribute('data-peer-id', peerId);
        div.innerHTML = `
            <video class="screen-view" autoplay playsinline style="display:none;"></video>
            <div class="avatar-ring">
                <div class="avatar-circle" style="background-image: url('https://api.dicebear.com/7.x/avataaars/svg?seed=${username}')"></div>
                <div class="sound-wave"></div><div class="sound-wave"></div>
            </div>
            <div class="user-label">${escapeHtml(username)}${isSelf ? ' (Sen)' : ''}</div>
            <audio autoplay ${isSelf ? 'muted' : ''}></audio>
        `;
        selectors.voiceGrid.appendChild(div);
        
        if (isSelf && localStream) {
            setupSpeakingDetection(peerId, localStream);
        }
    }

    // ============================================================
    // 7. SOCKET EVENT LISTENERS
    // ============================================================
    
    socket.on('chat-message', msg => {
        if (msg.channelId === currentChannelId) appendMessage(msg);
    });

    socket.on('dm-message', data => {
        if (currentChannelId === `dm_${data.friendId}`) appendMessage(data.message);
        else showToast(`${data.message.sender}: ${data.message.text.substring(0, 20)}...`, 'info');
    });

    socket.on('user-connected', (peerId, username) => {
        if (currentChannelType === 'voice') {
            addVoiceCard(peerId, username, false);
            const call = myPeer.call(peerId, isScreenSharing ? screenStream : localStream);
            call.on('stream', rs => handleRemoteStream(peerId, rs));
            peers[peerId] = call;
            showToast(`${username} kanala katıldı.`);
        }
    });

    socket.on('user-disconnected', peerId => {
        if (peers[peerId]) {
            peers[peerId].close();
            delete peers[peerId];
        }
        document.querySelector(`[data-peer-id="${peerId}"]`)?.remove();
    });

    socket.on('server-member-update', data => {
        if (currentServerId) {
            socket.emit('get-server-members', currentServerId, (res) => {
                if (res.success) renderMembers(res.members);
            });
        }
    });

    socket.on('server-member-status', data => {
        if (currentServerId) {
            socket.emit('get-server-members', currentServerId, (res) => {
                if (res.success) renderMembers(res.members);
            });
        }
    });

    socket.on('friend-status', data => {
        handleFriendUpdate(data.userId, data.status);
    });

    socket.on('friend-online', data => {
        handleFriendUpdate(data.userId, 'online');
    });

    socket.on('friend-offline', data => {
        handleFriendUpdate(data.userId, 'offline');
    });

    function handleFriendUpdate(userId, status) {
        const friend = friends.find(f => f.id === userId);
        if (friend) friend.status = status;
        if (status === 'offline') onlineFriends.delete(userId);
        else onlineFriends.add(userId);
        if (currentContext === 'friends') renderSidebar();
    }

    socket.on('receive-friend-request', req => {
        pendingRequests.push(req);
        showToast(`${req.fromUsername} arkadaşlık isteği gönderdi!`, 'info');
    });

    // ============================================================
    // 8. UI HANDLERS & MODALS
    // ============================================================
    
    selectors.navFriends.addEventListener('click', () => {
        currentContext = 'friends';
        currentServerId = null;
        currentDmFriend = null;
        selectors.navFriends.classList.add('active');
        renderServerList();
        renderSidebar();
        
        selectors.headerTitle.textContent = 'Arkadaşlar';
        selectors.headerIcon.setAttribute('data-lucide', 'users');
        selectors.welcomeMessage.style.display = 'flex';
        selectors.centerChatView.style.display = 'none';
        selectors.membersPanel.style.display = 'none';
        selectors.friendProfileView.style.display = 'none';
        initLucide();
    });

    selectors.micBtn?.addEventListener('click', () => {
        isMuted = !isMuted;
        if (localStream) localStream.getAudioTracks().forEach(t => t.enabled = !isMuted);
        selectors.micBtn.classList.toggle('danger', isMuted);
        selectors.micBtn.innerHTML = `<i data-lucide="${isMuted ? 'mic-off' : 'mic'}"></i>`;
        initLucide();
    });

    selectors.deafenBtn?.addEventListener('click', () => {
        isDeafened = !isDeafened;
        document.querySelectorAll('.voice-card audio').forEach(a => {
            const peerId = a.closest('.voice-card').dataset.peerId;
            if (peerId !== myPeer?.id) a.muted = isDeafened;
        });
        selectors.deafenBtn.classList.toggle('danger', isDeafened);
        selectors.deafenBtn.innerHTML = `<i data-lucide="${isDeafened ? 'volume-x' : 'headphones'}"></i>`;
        initLucide();
    });

    selectors.disconnectBtn?.addEventListener('click', () => leaveVoice(true));
    
    selectors.screenShareBtn?.addEventListener('click', async () => {
        if (!isScreenSharing) {
            try {
                screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                isScreenSharing = true;
                selectors.screenShareBtn.classList.add('active');
                
                // Update my voice card
                const myCard = document.querySelector(`[data-peer-id="${myPeer.id}"]`);
                if (myCard) {
                    const video = myCard.querySelector('video');
                    video.srcObject = screenStream;
                    video.style.display = 'block';
                    myCard.classList.add('is-sharing-screen');
                }
                
                // Switch tracks for existing calls
                Object.values(peers).forEach(call => {
                    const sender = call.peerConnection.getSenders().find(s => s.track.kind === 'video');
                    if (sender) sender.replaceTrack(screenStream.getVideoTracks()[0]);
                    else call.peerConnection.addTrack(screenStream.getVideoTracks()[0], screenStream);
                });
                
                screenStream.getVideoTracks()[0].onended = stopScreenSharing;
                showToast('Ekran paylaşımı başladı.');
            } catch (err) { console.error(err); }
        } else {
            stopScreenSharing();
        }
    });

    function stopScreenSharing() {
        if (screenStream) screenStream.getTracks().forEach(t => t.stop());
        isScreenSharing = false;
        selectors.screenShareBtn.classList.remove('active');
        
        const myCard = document.querySelector(`[data-peer-id="${myPeer.id}"]`);
        if (myCard) {
            myCard.querySelector('video').style.display = 'none';
            myCard.classList.remove('is-sharing-screen');
        }
        
        Object.values(peers).forEach(call => {
            const sender = call.peerConnection.getSenders().find(s => s.track.kind === 'video');
            if (sender) call.peerConnection.removeTrack(sender);
        });
        showToast('Ekran paylaşımı durduruldu.');
    }

    // Modal close logic
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal-overlay').style.display = 'none';
        });
    });

    // Profile Settings Status
    document.querySelectorAll('.status-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const status = btn.dataset.status;
            socket.emit('update-profile', { status }, (res) => {
                if (res.success) {
                    currentUser.status = status;
                    selectors.myStatusDot.style.background = STATUS_COLOR[status];
                    selectors.myStatusDot.style.boxShadow = `0 0 8px ${STATUS_COLOR[status]}`;
                    document.querySelectorAll('.status-option').forEach(b => b.classList.toggle('active', b.dataset.status === status));
                    showToast(`Durum: ${STATUS_LABEL[status]}`);
                }
            });
        });
    });

    // Speaking Animation Loop
    function animationLoop() {
        if (currentChannelType === 'voice') {
            const dataArray = new Uint8Array(128);
            document.querySelectorAll('.voice-card').forEach(card => {
                if (card._analyser) {
                    card._analyser.getByteFrequencyData(dataArray);
                    const avg = dataArray.reduce((acc, v) => acc + v, 0) / dataArray.length;
                    card.classList.toggle('is-speaking', avg > 15);
                }
            });
        }
        requestAnimationFrame(animationLoop);
    }
    animationLoop();

    // Initial setup
    updateAvatarPreview();
});
