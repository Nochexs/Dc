/**
 * NEXUS - Premium Voice & Chat Application
 * Consolidated & Cleaned Implementation (Post-Conflict Resolution)
 */

document.addEventListener('DOMContentLoaded', () => {
<<<<<<< HEAD
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
=======
    // DOM Elements - Auth
    const authOverlay = document.getElementById('auth-overlay');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const authUsernameInput = document.getElementById('auth-username');
    const authPasswordInput = document.getElementById('auth-password');
    const authError = document.getElementById('auth-error');

    // DOM Elements - App Containers
    const appContainer = document.getElementById('app-container');
    const mainHeaderTitle = document.getElementById('main-header-title');
    const sidebarContextTitle = document.getElementById('sidebar-context-title');
    const dynamicServerList = document.getElementById('dynamic-server-list');
    const dynamicChannelList = document.getElementById('dynamic-channel-list');
    const dynamicMemberList = document.getElementById('dynamic-member-list');
    const chatMessages = document.getElementById('chat-messages');

    // DOM Elements - Controls
    const micBtn = document.getElementById('mic-btn');
    const deafenBtn = document.getElementById('deafen-btn');
    const screenShareBtn = document.getElementById('screen-share-btn');
    const disconnectBtn = document.getElementById('disconnect-btn');
    const voiceControls = document.getElementById('voice-controls');
    const voiceGrid = document.getElementById('voice-grid');
    const chatArea = document.getElementById('chat-area');
    const chatInput = document.getElementById('chat-input');
    const sendMsgBtn = document.getElementById('send-msg-btn');

    // Mobile Toggle
    const mobileSidebarToggle = document.getElementById('mobile-sidebar-toggle');
    const mobileMembersToggle = document.getElementById('mobile-members-toggle');

    // Modals
    const createServerModal = document.getElementById('create-server-modal');
    const addFriendModal = document.getElementById('add-friend-modal');

    // State
    let socket = io('/');
>>>>>>> parent of 02a4fe6 (V3)
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

<<<<<<< HEAD
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
=======
    // --- Auth Logic ---
    function handleAuth(type) {
        const username = authUsernameInput.value.trim();
        const password = authPasswordInput.value.trim();
        if(!username || !password) return authError.textContent = "Fill all fields";
        
        socket.emit(type, {username, password}, (res) => {
            if(res.success) {
                if(type==='login') {
                    currentUser = res.user;
                    friends = res.friends;
                    servers = res.servers;
                    authOverlay.style.display = 'none';
                    appContainer.style.display = 'grid';
                    document.getElementById('my-username-display').textContent = currentUser.username;
                    initWebRTC();
                    renderServerList();
                    renderSidebar();
                } else {
                    authError.style.color = 'var(--accent-success)';
                    authError.textContent = res.message;
>>>>>>> parent of 02a4fe6 (V3)
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

<<<<<<< HEAD
    // ============================================================
    // 4. RENDERING (RAIL, SIDEBAR, MEMBERS)
    // ============================================================
    
=======
    // --- UI Logic ---
>>>>>>> parent of 02a4fe6 (V3)
    function renderServerList() {
        selectors.serverList.innerHTML = '';
        servers.forEach(s => {
            const el = document.createElement('div');
            el.className = `rail-btn tooltip ${currentContext === s.id ? 'active' : ''}`;
            el.setAttribute('data-tooltip', s.name);
            el.innerHTML = s.name.substring(0, 1).toUpperCase();
<<<<<<< HEAD
            el.addEventListener('click', () => activateServer(s));
            selectors.serverList.appendChild(el);
=======
            el.addEventListener('click', () => {
                currentContext = s.id;
                document.getElementById('nav-home').classList.remove('active');
                renderServerList();
                renderSidebar();
                switchMainView('server', s);
            });
            dynamicServerList.appendChild(el);
>>>>>>> parent of 02a4fe6 (V3)
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
<<<<<<< HEAD
                li.className = `ch-item ${currentDmFriend?.id === f.id ? 'active' : ''}`;
                li.innerHTML = `<img src="${f.profilePic}" style="width:24px;height:24px;border-radius:8px;"> <span>${escapeHtml(f.username)}</span>`;
=======
                li.className = currentChannelId === `dm_${f.id}` ? 'active' : '';
                li.innerHTML = `<i class="fa-solid fa-user"></i> <span>${f.username}</span>`;
>>>>>>> parent of 02a4fe6 (V3)
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
<<<<<<< HEAD
                li.className = `ch-item ${currentChannelId === ch.id ? 'active' : ''}`;
                li.innerHTML = `<i data-lucide="hash"></i> <span>${escapeHtml(ch.name)}</span>`;
=======
                li.className = currentChannelId === ch.id ? 'active' : '';
                li.innerHTML = `<i class="fa-solid ${ch.type==='voice' ? 'fa-volume-high' : 'fa-hashtag'}"></i> <span>${ch.name}</span>`;
>>>>>>> parent of 02a4fe6 (V3)
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
    }

<<<<<<< HEAD
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
            joinVoice(serverId, channel);
=======
    function switchMainView(type, data) {
        document.body.classList.remove('sidebar-active');
        if(type === 'server') {
            mainHeaderTitle.textContent = data.name;
            document.getElementById('main-header-icon').className = 'fa-solid fa-server';
            chatArea.style.display = 'flex';
            voiceGrid.style.display = 'none';
        } else {
             mainHeaderTitle.textContent = 'Friends';
             document.getElementById('main-header-icon').className = 'fa-solid fa-user-group';
>>>>>>> parent of 02a4fe6 (V3)
        }
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
<<<<<<< HEAD
        
        selectors.headerTitle.textContent = friend.username;
        selectors.headerIcon.setAttribute('data-lucide', 'at-sign');
        selectors.welcomeMessage.style.display = 'none';
        selectors.centerChatView.style.display = 'flex';
        selectors.membersPanel.style.display = 'none';
        selectors.friendProfileView.style.display = 'none';
        selectors.chatInput.disabled = false;
        selectors.chatInput.placeholder = `${friend.username} ile mesajlaş...`;
        selectors.chatMessages.innerHTML = '';
        
=======
        mainHeaderTitle.textContent = friend.username;
        document.getElementById('main-header-icon').className = 'fa-solid fa-user';
        chatInput.disabled = false;
        chatMessages.innerHTML = '';
>>>>>>> parent of 02a4fe6 (V3)
        socket.emit('get-dms', friend.id, (res) => {
            if (res.success) res.messages.forEach(m => appendMessage(m));
        });
    }

<<<<<<< HEAD
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
        }
        selectors.chatInput.value = '';
    }

    selectors.sendMsgBtn?.addEventListener('click', sendMessage);
    selectors.chatInput?.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });

    // ============================================================
    // 6. VOICE & WEBRTC
    // ============================================================
    
=======
    // --- WebRTC & Signal ---
>>>>>>> parent of 02a4fe6 (V3)
    function initWebRTC() {
        if (myPeer) return;
        myPeer = new Peer(undefined, { host: '0.peerjs.com', port: 443, secure: true });
        
        myPeer.on('open', id => console.log('PeerJS ID:', id));
        
        myPeer.on('call', call => {
            call.answer(isScreenSharing ? screenStream : localStream);
            call.on('stream', remoteStream => handleRemoteStream(call.peer, remoteStream));
            peers[call.peer] = call;
        });

        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            localStream = stream;
<<<<<<< HEAD
            loadAudioDevices();
        }).catch(err => showToast('Mikrofon erişimi engellendi.', 'error'));
    }

    async function loadAudioDevices() {
        const devices = await navigator.mediaDevices.enumerateDevices();
        audioDevices = devices.filter(d => d.kind === 'audioinput');
    }

    function joinVoice(serverId, channel) {
        if (!myPeer) return;
        leaveVoice(false);
        currentChannelId = channel.id;
        currentChannelType = 'voice';
=======
            myPeer.on('call', call => {
                call.answer(isScreenSharing ? screenStream : localStream);
                call.on('stream', userStream => handleRemoteStream(call.peer, userStream));
                peers[call.peer] = call;
            });
        });
    }

    function joinChannel(serverId, channel) {
        if(channel.type === 'text') {
            currentChannelId = channel.id;
            renderSidebar();
            chatInput.disabled = false;
            chatMessages.innerHTML = `<div class="welcome-message"><h2>Welcome to # ${channel.name}</h2></div>`;
            return;
        }

        // Voice Logic
        currentChannelId = channel.id;
        renderSidebar();
        chatArea.style.display = 'none';
        voiceGrid.style.display = 'grid';
        voiceControls.style.display = 'flex';
        document.getElementById('active-voice-channel').textContent = channel.name;
        voiceGrid.innerHTML = '';
>>>>>>> parent of 02a4fe6 (V3)
        
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

<<<<<<< HEAD
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

=======
    socket.on('user-connected', (peerId, username) => {
        const call = myPeer.call(peerId, isScreenSharing ? screenStream : localStream);
        call.on('stream', userStream => handleRemoteStream(peerId, userStream));
        peers[peerId] = call;
        addVoiceCard(peerId, username, null, false);
    });

    socket.on('user-disconnected', peerId => {
        if(peers[peerId]) peers[peerId].close();
        document.querySelector(`[data-peer-id="${peerId}"]`)?.remove();
        delete peers[peerId];
    });

    function handleRemoteStream(peerId, stream) {
        const card = document.querySelector(`[data-peer-id="${peerId}"]`);
        if(!card) return;
        card.querySelector('audio').srcObject = stream;
>>>>>>> parent of 02a4fe6 (V3)
        const video = card.querySelector('video');
        if (video && stream.getVideoTracks().length > 0) {
            video.srcObject = stream;
            video.style.display = 'block';
<<<<<<< HEAD
            card.classList.add('is-sharing-screen');
        } else if (video) {
            video.style.display = 'none';
            card.classList.remove('is-sharing-screen');
        }
        
        if (stream.getAudioTracks().length > 0) {
            setupSpeakingDetection(peerId, stream);
=======
            card.classList.add('is-video');
        } else {
            video.style.display = 'none';
            card.classList.remove('is-video');
>>>>>>> parent of 02a4fe6 (V3)
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
        if (document.querySelector(`[data-peer-id="${peerId}"]`)) return;
        const tmpl = document.getElementById('user-card-template');
        
        const card = tmpl.content.cloneNode(true).querySelector('.voice-card');
        card.setAttribute('data-peer-id', peerId);
<<<<<<< HEAD
        card.querySelector('.user-label').textContent = username + (isSelf ? ' (Ben)' : '');
        card.querySelector('.avatar-circle').style.backgroundImage =
            `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}')`;
        if (isSelf) card.querySelector('audio').muted = true;
        selectors.voiceGrid.appendChild(card); 
        initLucide();
        
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
=======
        card.querySelector('.user-label').textContent = username + (isSelf ? ' (You)' : '');
        card.querySelector('.avatar-lg').style.backgroundImage = `url('https://ui-avatars.com/api/?name=${username}&background=random')`;
        if(isSelf) card.querySelector('audio').muted = true;
        voiceGrid.appendChild(card);
    }

    // --- Messaging ---
    function appendMessage(sender, text, isSelf) {
        const div = document.createElement('div');
        div.className = `message ${isSelf ? 'self' : ''}`;
        div.innerHTML = `<strong>${sender}:</strong> <span>${text}</span>`;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
>>>>>>> parent of 02a4fe6 (V3)

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

    socket.on('friend-online', data => handleFriendUpdate(data.userId, 'online'));
    socket.on('friend-offline', data => handleFriendUpdate(data.userId, 'offline'));

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
<<<<<<< HEAD
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
                
                const myCard = document.querySelector(`[data-peer-id="${myPeer.id}"]`);
                if (myCard) {
                    const video = myCard.querySelector('video');
                    video.srcObject = screenStream;
                    video.style.display = 'block';
                    myCard.classList.add('is-sharing-screen');
                }
                
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
        showToast('Ekran paylaşımı durduruldu.');
    }

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal-overlay').style.display = 'none';
        });
    });

    // Update profile status
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
    updateAvatarPreview();
=======
        localStream.getAudioTracks()[0].enabled = !isMuted;
        micBtn.classList.toggle('danger', isMuted);
        micBtn.innerHTML = `<i class="fa-solid fa-microphone${isMuted ? '-slash' : ''}"></i>`;
    });

    screenShareBtn.addEventListener('click', async () => {
        if(!isScreenSharing) {
            screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            isScreenSharing = true;
            screenShareBtn.classList.add('active');
            updateStreams(screenStream);
            const myCard = document.querySelector(`[data-peer-id="${myPeer.id}"]`);
            const v = myCard.querySelector('video');
            v.srcObject = screenStream; v.style.display = 'block';
        } else {
            screenStream.getTracks().forEach(t => t.stop());
            isScreenSharing = false;
            updateStreams(localStream);
            const myCard = document.querySelector(`[data-peer-id="${myPeer.id}"]`);
            myCard.querySelector('video').style.display = 'none';
        }
    });

    function updateStreams(stream) {
        Object.values(peers).forEach(call => {
            const videoTrack = stream.getVideoTracks()[0];
            const sender = call.peerConnection.getSenders().find(s => s.track.kind === 'video');
            if(sender) sender.replaceTrack(videoTrack);
            else call.peerConnection.addTrack(videoTrack, stream);
        });
    }

    // --- Sidebars Toggle ---
    mobileSidebarToggle.addEventListener('click', () => document.body.classList.toggle('sidebar-active'));
    mobileMembersToggle.addEventListener('click', () => document.body.classList.toggle('members-active'));

    // Nav home click → switch to friends view
    document.getElementById('nav-home').addEventListener('click', () => {
        currentContext = 'friends';
        document.querySelectorAll('.rail-btn, .server-icon').forEach(el => el.classList.remove('active'));
        document.getElementById('nav-home').classList.add('active');
        renderServerList();
        renderSidebar();
        mainHeaderTitle.textContent = 'Friends';
        document.getElementById('main-header-icon').className = 'fa-solid fa-user-group';
    });

    // Modals
    const joinServerModal = document.getElementById('join-server-modal');
    document.getElementById('nav-add-server').addEventListener('click', () => createServerModal.style.display = 'flex');
    document.getElementById('btn-add-friend').addEventListener('click', () => addFriendModal.style.display = 'flex');
    if(document.getElementById('nav-join-server')) {
        document.getElementById('nav-join-server').addEventListener('click', () => joinServerModal.style.display = 'flex');
    }
    if(document.getElementById('open-settings-btn')) {
        document.getElementById('open-settings-btn').addEventListener('click', () => {
            alert('Settings coming soon!');
        });
    }
    document.querySelectorAll('.close-modal').forEach(b => b.addEventListener('click', () => b.closest('.modal-overlay').style.display = 'none'));

    document.getElementById('confirm-create-server').addEventListener('click', () => {
        const n = document.getElementById('new-server-name').value;
        socket.emit('create-server', n, (res) => {
            if(res.success) { servers.push(res.server); renderServerList();
                createServerModal.style.display = 'none';
            }
        });
    });

    document.getElementById('confirm-add-friend').addEventListener('click', () => {
        const n = document.getElementById('new-friend-username').value;
        socket.emit('add-friend', n, (res) => {
            if(res.success) { friends.push(res.friend); renderSidebar(); addFriendModal.style.display = 'none'; }
            else document.getElementById('add-friend-message').textContent = res.message;
        });
    });

    if(document.getElementById('confirm-join-server')) {
        document.getElementById('confirm-join-server').addEventListener('click', () => {
            // Join server via link — placeholder for future backend integration
            const link = document.getElementById('join-server-link').value.trim();
            if(link) alert(`Join via link: ${link} (backend integration needed)`);
            joinServerModal.style.display = 'none';
        });
    }
>>>>>>> parent of 02a4fe6 (V3)
});
