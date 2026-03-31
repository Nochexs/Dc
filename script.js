document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Selectors ---
<<<<<<< HEAD
    const authOverlay        = document.getElementById('auth-overlay');
    const loginBox           = document.getElementById('login-box');
    const registerBox        = document.getElementById('register-box');
    const showRegisterBtn    = document.getElementById('show-register-btn');
    const showLoginBtn       = document.getElementById('show-login-btn');
    const loginBtn           = document.getElementById('login-btn');
    const registerBtn        = document.getElementById('register-btn');
    const authUsernameInput  = document.getElementById('auth-username');
    const authPasswordInput  = document.getElementById('auth-password');
    const authError          = document.getElementById('auth-error');
<<<<<<< HEAD
    const regUsernameInput   = document.getElementById('reg-username');
    const regPasswordInput   = document.getElementById('reg-password');
    const regError           = document.getElementById('reg-error');
=======

>>>>>>> parent of b21c083 (V7)
    const appContainer       = document.getElementById('app-container');
    const mainHeaderTitle    = document.getElementById('main-header-title');
    const mainHeaderIcon     = document.getElementById('main-header-icon');
=======
    const authOverlay = document.getElementById('auth-overlay');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const authUsernameInput = document.getElementById('auth-username');
    const authPasswordInput = document.getElementById('auth-password');
    const authError = document.getElementById('auth-error');

    const appContainer = document.getElementById('app-container');
    const mainHeaderTitle = document.getElementById('main-header-title');
>>>>>>> parent of e729613 (v4)
    const sidebarContextTitle = document.getElementById('sidebar-context-title');
    const dynamicServerList = document.getElementById('dynamic-server-list');
    const dynamicChannelList = document.getElementById('dynamic-channel-list');
<<<<<<< HEAD
    const chatMessages       = document.getElementById('chat-messages');
    const chatInput          = document.getElementById('chat-input');
    const sendMsgBtn         = document.getElementById('send-msg-btn');
<<<<<<< HEAD
    const rightPanelTitle    = document.getElementById('right-panel-title');
=======
    const chatPanel          = document.getElementById('chat-panel');
    const chatPanelTitle     = document.getElementById('chat-panel-title');

>>>>>>> parent of b21c083 (V7)
    const micBtn             = document.getElementById('mic-btn');
    const deafenBtn          = document.getElementById('deafen-btn');
    const screenShareBtn     = document.getElementById('screen-share-btn');
    const disconnectBtn      = document.getElementById('disconnect-btn');
    const voiceControls      = document.getElementById('voice-controls');
    const voiceGrid          = document.getElementById('voice-grid');
    const welcomeMessage     = document.getElementById('welcome-message');

    const notifBtn           = document.getElementById('nav-notifications');
    const notifBadge         = document.getElementById('notif-badge');
    const notifPanel         = document.getElementById('notif-panel');
    const notifList          = document.getElementById('notif-list');

    const btnAddFriend       = document.getElementById('btn-add-friend');
    const btnInviteServer    = document.getElementById('btn-invite-server');

    const createServerModal  = document.getElementById('create-server-modal');
    const addFriendModal     = document.getElementById('add-friend-modal');
    const joinServerModal    = document.getElementById('join-server-modal');
    const settingsModal      = document.getElementById('settings-modal');

    // Toast
    const toastEl = document.getElementById('toast');

    // --- State ---
<<<<<<< HEAD
    let socket = io(window.location.origin, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
    });
=======
    let socket          = io('/');
>>>>>>> parent of d55b9a7 (V5)
    let myPeer          = null;
    let currentUser     = null;
    let friends         = [];
    let servers         = [];
    let pendingRequests = [];
    let currentContext  = 'friends';
    let currentChannelId  = null;
    let currentServerId   = null;
    let currentChannelType = null; // 'text' | 'voice' | 'dm'
    let peers           = {};
    let localStream     = null;
    let screenStream    = null;
    let isMuted         = false;
    let isDeafened      = false;
=======
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendMsgBtn = document.getElementById('send-msg-btn');

    const micBtn = document.getElementById('mic-btn');
    const deafenBtn = document.getElementById('deafen-btn');
    const screenShareBtn = document.getElementById('screen-share-btn');
    const disconnectBtn = document.getElementById('disconnect-btn');
    const voiceControls = document.getElementById('voice-controls');
    const voiceGrid = document.getElementById('voice-grid');
    const welcomeMessage = document.getElementById('welcome-message');

    // Modals
    const createServerModal = document.getElementById('create-server-modal');
    const addFriendModal = document.getElementById('add-friend-modal');
    const joinServerModal = document.getElementById('join-server-modal');

    // --- State Management ---
    let socket = io('/');
    let myPeer = null;
    let currentUser = null;
    let friends = [];
    let servers = [];
    let currentContext = 'friends'; 
    let currentChannelId = null;
    let peers = {}; 
    let localStream = null;
    let screenStream = null;
    let isMuted = false;
    let isDeafened = false;
>>>>>>> parent of e729613 (v4)
    let isScreenSharing = false;
    let audioDevices    = [];
    let selectedMicId   = null;

<<<<<<< HEAD
<<<<<<< HEAD
    // ── AYARLAR ──────────────────────────────────────────────────────
    let appSettings = JSON.parse(localStorage.getItem('nexus_settings')) || {
        micId: 'default',
        micVol: 100,
        noiseSup: true,
        echoCanc: true,
        spkId: 'default',
        spkVol: 100
    };
    function saveSettings() { localStorage.setItem('nexus_settings', JSON.stringify(appSettings)); }

    // ── SES İŞLEME ───────────────────────────────────────────────────
    let audioContext;
    let micGainNode;
    let micAnalyser;
    let rawLocalStream;
    let testAnimFrame;


    // ── YARDIMCILAR ──────────────────────────────────────────────────
    function esc(s) {
        return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
=======
    // --- Initialization ---
    function initLucide() {
        if (window.lucide) lucide.createIcons();
>>>>>>> parent of e729613 (v4)
    }
    function timeStr(ts) {
        if (!ts) return '';
        const d = new Date(ts), now = new Date();
        if (d.toDateString() === now.toDateString())
            return d.toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'});
        return d.toLocaleDateString('tr-TR',{day:'numeric',month:'short'}) + ' ' +
               d.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});
    }
=======
    // ============================================================
    // UTILITY
    // ============================================================
>>>>>>> parent of b21c083 (V7)
    function initLucide() { if (window.lucide) lucide.createIcons(); }

<<<<<<< HEAD
    function showError(msg) {
        authError.style.color = 'var(--accent-red)';
        authError.textContent = msg;
    }

    function showToast(msg, type = 'success') {
        toastEl.textContent = msg;
        toastEl.className = `toast toast-${type} show`;
        clearTimeout(toastEl._timeout);
        toastEl._timeout = setTimeout(() => {
            toastEl.classList.remove('show');
        }, 3000);
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function timeStr(ts) {
        if (!ts) return '';
        const d = new Date(ts);
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) + ' ' +
               d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // ============================================================
    // AUTH
    // ============================================================
    let avatarSeed = 'Nexus';

    document.getElementById('refresh-avatar-btn').addEventListener('click', () => {
        avatarSeed = Math.random().toString(36).substring(2, 10);
        document.querySelector('#auth-avatar-preview img').src =
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
    });

=======
    // --- Authentication ---
>>>>>>> parent of e729613 (v4)
    function handleAuth(type) {
<<<<<<< HEAD
        let username, password, errorEl;
        if (type === 'login') {
            username = authUsernameInput.value.trim();
            password = authPasswordInput.value.trim();
            errorEl = authError;
        } else {
            username = regUsernameInput.value.trim();
            password = regPasswordInput.value.trim();
            errorEl = regError;
        }

        if (!username || !password) { errorEl.style.color='var(--accent-red)'; errorEl.textContent='Tüm alanları doldurun.'; return; }
        errorEl.textContent = '';
        const profilePic = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
        
        socket.emit(type, { username, password, profilePic }, res => {
=======
        const username = authUsernameInput.value.trim();
        const password = authPasswordInput.value.trim();
<<<<<<< HEAD
        if (!username || !password) return showError('Lütfen tüm alanları doldurun.');

        const profilePic = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
        authError.textContent = '';

        socket.emit(type, { username, password, profilePic }, (res) => {
>>>>>>> parent of b21c083 (V7)
            if (res.success) {
                if (type === 'login') {
                    currentUser     = res.user;
                    friends         = res.friends || [];
                    servers         = res.servers || [];
                    pendingRequests = res.friendRequests || [];

                    authOverlay.style.display = 'none';
                    appContainer.style.display = 'flex';
                    document.querySelector('#my-avatar img').src = currentUser.profilePic;

=======
        if(!username || !password) return authError.textContent = "Please fill in all fields.";
        
        socket.emit(type, {username, password}, (res) => {
            if(res.success) {
                if(type === 'login') {
                    currentUser = res.user;
                    friends = res.friends;
                    servers = res.servers;
                    authOverlay.style.display = 'none';
                    appContainer.style.display = 'flex';
                    document.getElementById('my-username-display').textContent = currentUser.username;
                    // Seed avatar based on name
                    document.querySelector('#my-avatar img').src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`;
                    
>>>>>>> parent of e729613 (v4)
                    initWebRTC();
                    renderServerList();
                    renderSidebar();
                    initLucide();

                    // Davet linki varsa sor
                    if (window._pendingInvite) {
                        const inv = window._pendingInvite;
                        delete window._pendingInvite;
                        if (confirm(`Sunucuya katılmak istiyor musunuz?\nID: ${inv}`)) {
                            socket.emit('join-server', inv, (res) => {
                                if (res.success) {
                                    servers.push(res.server);
                                    renderServerList();
                                    activateServer(res.server);
                                } else {
                                    showToast(res.message, 'error');
                                }
                            });
                        }
                    }
                } else {
<<<<<<< HEAD
                    errorEl.style.color = 'var(--accent-green)';
                    errorEl.textContent = res.message;
                    // Switch to login explicitly and DONT delete the password
                    setTimeout(() => {
                        registerBox.style.display = 'none';
                        loginBox.style.display = 'block';
                        authUsernameInput.value = username;
                        authPasswordInput.value = password;
                        authError.style.color = 'var(--accent-green)';
                        authError.textContent = 'Hesabınız başarıyla oluşturuldu, şimdi giriş yapabilirsiniz.';
                    }, 800);
                }
            } else {
<<<<<<< HEAD
                errorEl.style.color = 'var(--accent-red)';
                errorEl.textContent = res.message;
=======
                showError(res.message);
>>>>>>> parent of b21c083 (V7)
=======
                    authError.style.color = 'var(--accent-green)';
                    authError.textContent = res.message;
                }
            } else {
                authError.textContent = res.message;
>>>>>>> parent of e729613 (v4)
            }
        });
    }

    loginBtn.addEventListener('click', () => handleAuth('login'));
    registerBtn.addEventListener('click', () => handleAuth('register'));
<<<<<<< HEAD
    authPasswordInput.addEventListener('keypress', e => { if (e.key==='Enter') handleAuth('login'); });
    authUsernameInput.addEventListener('keypress', e => { if (e.key==='Enter') authPasswordInput.focus(); });
    regPasswordInput.addEventListener('keypress', e => { if (e.key==='Enter') handleAuth('register'); });
    regUsernameInput.addEventListener('keypress', e => { if (e.key==='Enter') regPasswordInput.focus(); });

<<<<<<< HEAD
    showRegisterBtn.addEventListener('click', () => {
        loginBox.style.display = 'none';
        registerBox.style.display = 'block';
    });
    showLoginBtn.addEventListener('click', () => {
        registerBox.style.display = 'none';
        loginBox.style.display = 'block';
    });

    // Otomatik çıkışı engelleme (Sayfayı yenilerken uyarı)
    window.addEventListener('beforeunload', (e) => {
        if (currentUser) {
            e.preventDefault();
            e.returnValue = ''; 
        }
    });
=======
    authPasswordInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleAuth('login'); });
    authUsernameInput.addEventListener('keypress', e => { if (e.key === 'Enter') authPasswordInput.focus(); });
>>>>>>> parent of b21c083 (V7)

    // ============================================================
    // NAV
    // ============================================================
    document.getElementById('nav-friends').addEventListener('click', () => {
        currentContext      = 'friends';
        currentChannelId    = null;
        currentServerId     = null;
        currentChannelType  = null;
        chatInput.disabled  = true;
        voiceGrid.style.display    = 'none';
        voiceControls.style.display = 'none';
        welcomeMessage.style.display = 'flex';
        chatMessages.innerHTML      = '';
        chatPanelTitle.textContent  = 'Chat';
        document.querySelectorAll('.server-icon, .rail-action-btn').forEach(el => el.classList.remove('active'));
        document.getElementById('nav-friends').classList.add('active');
        renderSidebar();
        switchMainView('home');
    });

<<<<<<< HEAD
    function updateDmBadge() {
        const total = Array.from(dmNotifications.values()).reduce((a, b) => a + b, 0);
        if (total > 0) {
            dmBadge.textContent = total > 9 ? '9+' : total;
            dmBadge.style.display = 'flex';
        } else {
            dmBadge.style.display = 'none';
        }
    }
    function updateFriendDmDot(uid) {
        const el = document.querySelector(`.friend-dm-dot[data-uid="${uid}"]`);
        if (el) {
            const cnt = dmNotifications.get(uid) || 0;
            el.textContent = cnt > 9 ? '9+' : cnt;
            el.style.display = cnt > 0 ? 'flex' : 'none';
        }
    }
    function clearDmNotif(uid) {
        dmNotifications.delete(uid);
        updateDmBadge();
        updateFriendDmDot(uid);
    }

    // ── NAV ──────────────────────────────────────────────────────────
    navFriends.addEventListener('click', () => {
        currentContext = 'friends';
        currentChannelId = null; currentServerId = null; currentChannelType = null; currentDmFriend = null;
        chatInput.disabled = true; chatInput.placeholder = 'Bir kanal seç...';
        chatMessages.innerHTML = '';
        if (rightPanelTitle) rightPanelTitle.textContent = 'Profil';
        
        voiceGrid.style.display = 'none'; voiceControls.style.display = 'none';
        welcomeMessage.style.display = 'flex'; friendProfileView.style.display = 'none';
        document.getElementById('center-chat-area').style.display = 'none';
        const inviteBtn = document.getElementById('btn-invite-server');
        const settingsBtn = document.getElementById('btn-server-settings');
        if (inviteBtn) inviteBtn.style.display = 'none';
        if (settingsBtn) settingsBtn.style.display = 'none';
        
        const rsPanel = document.getElementById('right-side-panel');
        if (rsPanel) rsPanel.style.display = 'flex';
        
        membersPanel.style.display = 'none';
        document.querySelectorAll('.server-icon, .rail-btn').forEach(el => el.classList.remove('active'));
        navFriends.classList.add('active');
        mainHeaderTitle.textContent = 'Arkadaşlar';
        mainHeaderIcon.setAttribute('data-lucide', 'users');
        toggleMembersBtn.style.display = 'none';
        renderSidebar(); initLucide();
    });

    // ── SUNUCULAR ────────────────────────────────────────────────────
=======
    // ============================================================
    // SERVER LIST
    // ============================================================
>>>>>>> parent of b21c083 (V7)
=======
    // --- Navigation & UI Rendering ---
>>>>>>> parent of e729613 (v4)
    function renderServerList() {
        dynamicServerList.innerHTML = '';
        servers.forEach(s => {
            const el = document.createElement('div');
            el.className = `server-icon tooltip ${currentContext === s.id ? 'active' : ''}`;
            el.setAttribute('data-tooltip', s.name);
            el.innerHTML = s.name.substring(0, 1).toUpperCase();
            el.addEventListener('click', () => {
<<<<<<< HEAD
                activateServer(s);
=======
                currentContext = s.id;
>>>>>>> parent of e729613 (v4)
                document.querySelectorAll('.server-icon').forEach(i => i.classList.remove('active'));
                el.classList.add('active');
<<<<<<< HEAD
            });
            dynamicServerList.appendChild(el);
        });
<<<<<<< HEAD
        attachTooltips(); initLucide();
    }

    function activateServer(s) {
        currentContext = s.id; currentServerId = s.id;
        currentChannelType = null;
        
        // Chat alanını MERKEZE al (rsPanel değil!)
        const chatArea = document.getElementById('center-chat-area');
        document.querySelector('.view-container').appendChild(chatArea);

        const inviteBtn = document.getElementById('btn-invite-server');
        const settingsBtn = document.getElementById('btn-server-settings');
        if (inviteBtn) inviteBtn.style.display = '';
        if (settingsBtn) settingsBtn.style.display = (s.ownerId === currentUser.id ? '' : 'none');
        
        const rsPanel = document.getElementById('right-side-panel');
        if (rsPanel) rsPanel.style.display = 'none'; // Sunucudayken arkadaş profili gizle
        
        chatMessages.innerHTML = ''; chatInput.disabled = true;
        friendProfileView.style.display = 'none';
        document.getElementById('center-chat-area').style.display = 'flex';
        
        if (rightPanelTitle) rightPanelTitle.textContent = s.name + ' Sohbeti';
        welcomeMessage.style.display = 'none';
        mainHeaderTitle.textContent = s.name;
        mainHeaderIcon.setAttribute('data-lucide', 'server');
        toggleMembersBtn.style.display = '';
        
        renderSidebar();


        if (membersOpen) {
            openMembersPanel(s.id);
        } else {
            membersPanel.style.display = 'none';
        }
        
        // Sunucunun ilk text kanalını "Global Chat" yap
        const globalText = s.channels.find(c => c.type === 'text');
        if (globalText) {
            currentChannelId = globalText.id;
            chatInput.disabled = false;
            chatInput.placeholder = `Sunucuya mesaj gönder...`;
            socket.emit('get-channel-messages', globalText.id, res => {
                if (res.success && res.messages.length) {
                    res.messages.forEach(m => appendMsg(m.sender, m.text, m.senderId===currentUser.id, m.profilePic, m.timestamp));
                } else {
                    chatMessages.innerHTML = `<div class="welcome-notif" style="text-align:center; padding-top:20px;">
                        <i data-lucide="server" style="width:40px;height:40px;color:var(--accent-purple);margin-bottom:12px;"></i>
                        <h3>${esc(s.name)}</h3><p>Genel sohbete hoş geldin!</p>
                    </div>`;
                    initLucide();
                }
            });
        }
        
=======
>>>>>>> parent of b21c083 (V7)
        initLucide();
    }

    function activateServer(s) {
        currentContext  = s.id;
        currentServerId = s.id;
        renderSidebar();
        switchMainView('server', s);
    }

    // ============================================================
    // SIDEBAR
    // ============================================================
    function renderSidebar() {
        dynamicChannelList.innerHTML = '';

        if (currentContext === 'friends') {
<<<<<<< HEAD
            sidebarCtxTitle.textContent = 'ARKADAŞLAR';
            btnAddFriend.style.display = '';
            // ... (arkadaşlar listesi render)
            if (!friends.length) {
                dynamicChannelList.innerHTML = '<li style="color:var(--text-secondary);font-size:12px;padding:20px 14px;opacity:.6;pointer-events:none;">Henüz arkadaşın yok.</li>';
                return;
=======
            sidebarContextTitle.textContent = 'FRIENDS';
            btnAddFriend.style.display = '';
            btnInviteServer.style.display = 'none';

            if (friends.length === 0) {
                const li = document.createElement('li');
                li.style.cssText = 'color:var(--text-secondary);font-size:13px;padding:20px 14px;opacity:0.6;pointer-events:none;';
                li.textContent = 'Henüz arkadaşın yok. Ekle!';
                dynamicChannelList.appendChild(li);
>>>>>>> parent of b21c083 (V7)
            }

            friends.forEach(f => {
                const li = document.createElement('li');
                li.className = currentChannelId === `dm_${f.id}` ? 'active' : '';
                li.innerHTML = `<img src="${f.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${f.username}`}"
                    style="width:28px;height:28px;border-radius:8px;object-fit:cover;flex-shrink:0;">
                    <span>${escapeHtml(f.username)}</span>`;
=======
                renderServerList();
                renderSidebar();
                switchMainView('server', s);
            });
            dynamicServerList.appendChild(el);
        });
    }

    function renderSidebar() {
        dynamicChannelList.innerHTML = '';
        if(currentContext === 'friends') {
            sidebarContextTitle.textContent = 'FRIENDS';
            friends.forEach(f => {
                const li = document.createElement('li');
                li.className = currentChannelId === `dm_${f.id}` ? 'active' : '';
                li.innerHTML = `<i data-lucide="user"></i> <span>${f.username}</span>`;
>>>>>>> parent of e729613 (v4)
                li.addEventListener('click', () => openDM(f));
                dynamicChannelList.appendChild(li);
            });
        } else {
<<<<<<< HEAD
            const server = servers.find(s => String(s.id) === String(currentContext));
            if (!server) {
                console.warn('Server bulunamadı:', currentContext);
                sidebarCtxTitle.textContent = 'SUNUCU';
                return;
            }
            document.getElementById('leave-voice-btn').style.display = currentChannelType === 'voice' ? 'flex' : 'none';
            sidebarCtxTitle.textContent = server.name.toUpperCase();
            btnAddFriend.style.display = 'none'; 
            const voiceChs = server.channels.filter(c => c.type === 'voice');

            // Ses Kanalları Header + Ekleme Butonu
            const hdr = document.createElement('li');
            hdr.className = 'ch-section-header'; 
            hdr.style.display = 'flex';
            hdr.style.justifyContent = 'space-between';
            hdr.style.alignItems = 'center';
            
            // Eğer sunucu sahibiysek "Artı" butonu görünsün
            const isOwner = server.ownerId === currentUser.id;
            hdr.innerHTML = `<span>SES KANALLARI</span> ${isOwner ? `<button id="add-voice-ch-btn" class="icon-btn-small" style="background:transparent; padding:2px;"><i data-lucide="plus" style="width:14px;height:14px;"></i></button>` : ''}`;
            dynamicChannelList.appendChild(hdr);
            
            if (isOwner) {
                hdr.querySelector('#add-voice-ch-btn').addEventListener('click', () => {
                    document.getElementById('create-voice-modal').style.display = 'flex';
                    document.getElementById('new-voice-name').value = '';
                    document.getElementById('new-voice-limit').value = '';
                });
            }

            voiceChs.forEach(ch => {
                const li = document.createElement('li');
                li.className = `ch-item ${currentChannelId===ch.id?'active':''} ${currentChannelId===ch.id&&ch.type==='voice'?'voice-active':''}`;
                li.dataset.type = ch.type;
                li.dataset.id = ch.id;
                const userCount = ch.users ? ch.users.length : 0;
                li.innerHTML = `<i data-lucide="volume-2"></i><span style="flex:1;">${esc(ch.name)}</span> <span style="font-size:10px; color:var(--text-secondary); font-weight:700;">${userCount}${ch.limit ? '/' + ch.limit : ' kişi'}</span>`;
                
                li.addEventListener('click', () => joinChannel(server.id, ch));
                
                // Sağ tık (Context Menu) sadece sahibine
                if (isOwner) {
                    li.addEventListener('contextmenu', e => {
                        e.preventDefault();
                        showContextMenu(e.clientX, e.clientY, ch.id, ch.name, ch.limit);
                    });
                }
                
                dynamicChannelList.appendChild(li);
            });
=======
            const server = servers.find(s => s.id === currentContext);
            sidebarContextTitle.textContent = server.name.toUpperCase();
<<<<<<< HEAD
            btnAddFriend.style.display  = 'none';
            btnInviteServer.style.display = '';

            const textChs  = server.channels.filter(c => c.type === 'text');
            const voiceChs = server.channels.filter(c => c.type === 'voice');

            function renderSection(label, channels, iconFn) {
                if (!channels.length) return;
                const header = document.createElement('li');
                header.className = 'ch-section-header';
                header.textContent = label;
                dynamicChannelList.appendChild(header);

                channels.forEach(ch => {
                    const li = document.createElement('li');
                    li.className = `ch-item ${currentChannelId === ch.id ? 'active' : ''}`;
                    li.dataset.type = ch.type;
                    li.innerHTML = `<i data-lucide="${iconFn(ch)}"></i><span>${escapeHtml(ch.name)}</span>`;
                    if (ch.type === 'voice' && currentChannelId === ch.id) {
                        li.classList.add('voice-active');
                    }
                    li.addEventListener('click', () => joinChannel(server.id, ch));
                    dynamicChannelList.appendChild(li);
                });
            }

            renderSection('METİN KANALLARI', textChs, () => 'hash');
            renderSection('SES KANALLARI', voiceChs, () => 'volume-2');
>>>>>>> parent of b21c083 (V7)
=======
            server.channels.forEach(ch => {
                const li = document.createElement('li');
                li.className = currentChannelId === ch.id ? 'active' : '';
                const iconType = ch.type === 'voice' ? 'mic' : 'hash';
                li.innerHTML = `<i data-lucide="${iconType}"></i> <span>${ch.name}</span>`;
                li.addEventListener('click', () => joinChannel(server.id, ch));
                dynamicChannelList.appendChild(li);
            });
>>>>>>> parent of e729613 (v4)
        }
        initLucide();
    }

<<<<<<< HEAD
    let activeContextChannelId = null;
    function showContextMenu(x, y, chId, name, limit) {
        activeContextChannelId = chId;
        const menu = document.getElementById('context-menu');
        menu.style.display = 'block';
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';
        
        // Modal için verileri hazırla
        document.getElementById('edit-ch-name').value = name;
        document.getElementById('edit-ch-limit').value = limit || 0;
        
        const hide = () => { menu.style.display = 'none'; document.removeEventListener('click', hide); };
        setTimeout(() => document.addEventListener('click', hide), 50);
    }


    // ── ARKADAŞ PROFİL GÖRÜNÜMÜ (MERKEZ) ─────────────────────────────
    function showFriendProfile(friend) {
        currentDmFriend = friend;
        renderSidebar(); // aktif satırı güncelle

        const isOn = onlineFriends.has(friend.id);
        
        // Chat alanını merkeze al
        const chatArea = document.getElementById('center-chat-area');
        document.querySelector('.view-container').appendChild(chatArea);

        welcomeMessage.style.display = 'none';
        voiceGrid.style.display = 'none';
        document.getElementById('center-chat-area').style.display = 'flex';
        
        const rsPanel = document.getElementById('right-side-panel');
        if (rsPanel) rsPanel.style.display = 'flex';
        friendProfileView.style.display = 'flex';

        // Profil görünümü (Arama butonu kaldırıldı!)
        friendProfileView.innerHTML = `
            <div class="fpv-content" style="flex:1; padding:20px;">
                <div class="fpv-avatar-wrap">
                    <img src="${friend.profilePic||`https://api.dicebear.com/7.x/avataaars/svg?seed=${esc(friend.username)}`}" class="fpv-avatar-img" alt="">
                    <span class="fpv-status-ring" style="border-color:${STATUS_COLOR[isOn?'online':'offline']};"></span>
                </div>
                <div class="fpv-username" style="font-size:20px; font-weight:700; margin-top:10px;">${esc(friend.username)}</div>
                <div class="fpv-status-badge" style="color:${STATUS_COLOR[isOn?'online':'offline']}; font-size:13px; margin-bottom:20px;">
                    <span class="status-dot-sm" style="background:${STATUS_COLOR[isOn?'online':'offline']};"></span>
                    ${STATUS_LABEL[isOn?'online':'offline']}
                </div>
                <div class="fpv-actions" style="display:flex; flex-direction:column; gap:10px; width:100%;">
                    <button class="secondary-btn fpv-action-btn danger" id="fpv-remove-btn" style="justify-content:center; padding:10px; border-radius:8px; background:rgba(239,68,68,0.1); color:var(--text-danger); border:1px solid rgba(239,68,68,0.2);">
                        <i data-lucide="user-x"></i> Arkadaşlıktan Sil
                    </button>
                    <button class="secondary-btn fpv-action-btn" id="fpv-copy-btn" style="justify-content:center; padding:10px; border-radius:8px; background:var(--glass-element);">
                        <i data-lucide="copy"></i> Adı Kopyala
                    </button>
                    <hr style="border:none; border-top:1px solid var(--glass-border); margin:10px 0; width:100%;">
                    <button class="secondary-btn fpv-action-btn" id="fpv-mutual-servers-btn" style="justify-content:space-between; padding:10px; border-radius:8px; background:var(--glass-element);">
                        <span style="display:flex; align-items:center; gap:8px;"><i data-lucide="server"></i> Ortak Sunucular</span>
                        <i data-lucide="chevron-right" style="width:14px; opacity:0.5;"></i>
                    </button>
                    <button class="secondary-btn fpv-action-btn" id="fpv-mutual-friends-btn" style="justify-content:space-between; padding:10px; border-radius:8px; background:var(--glass-element);">
                        <span style="display:flex; align-items:center; gap:8px;"><i data-lucide="users"></i> Ortak Arkadaşlar</span>
                        <i data-lucide="chevron-right" style="width:14px; opacity:0.5;"></i>
                    </button>
                </div>
            </div>`;

        initLucide(); attachTooltips();

        document.getElementById('fpv-copy-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(friend.username).then(() => showToast(`"${friend.username}" kopyalandı!`));
        });
        document.getElementById('fpv-remove-btn').addEventListener('click', () => {
            if (!confirm(`${friend.username} adlı kişiyi arkadaş listenden çıkarmak istiyor musun?`)) return;
            socket.emit('remove-friend', friend.id, res => {
                if (res.success) {
                    friends = friends.filter(f => f.id !== friend.id);
                    onlineFriends.delete(friend.id);
                    currentDmFriend = null;
                    friendProfileView.style.display = 'none';
                    document.getElementById('right-side-panel').style.display = 'none';
                    document.getElementById('center-chat-area').style.display = 'none';
                    welcomeMessage.style.display = 'flex';
                    chatMessages.innerHTML = ''; chatInput.disabled = true;
                    renderSidebar();
                    showToast(`${friend.username} listenden çıkarıldı`);
                }
            });
        });
        // Ortak arkadaş/sunucu eventleri (mevcut)
        document.getElementById('fpv-mutual-servers-btn').addEventListener('click', () => {
            socket.emit('get-mutual-details', friend.id, res => {
                if (res.success && res.mutualServers.length > 0) showMutualDetails('Ortak Sunucular', res.mutualServers);
                else showToast('Ortak sunucu bulunamadı.', 'info');
            });
        });
        document.getElementById('fpv-mutual-friends-btn').addEventListener('click', () => {
            socket.emit('get-mutual-details', friend.id, res => {
                if (res.success && res.mutualFriends.length > 0) showMutualDetails('Ortak Arkadaşlar', res.mutualFriends);
                else showToast('Ortak arkadaş bulunamadı.', 'info');
            });
        });

        openDMChat(friend);
    }


=======
    function switchMainView(type, data) {
        if(type === 'server') {
            mainHeaderTitle.textContent = data.name;
            document.getElementById('main-header-icon').setAttribute('data-lucide', 'server');
        } else {
<<<<<<< HEAD
            mainHeaderTitle.textContent = 'Arkadaşlar';
            mainHeaderIcon.setAttribute('data-lucide', 'users');
=======
            mainHeaderTitle.textContent = 'Friends';
            document.getElementById('main-header-icon').setAttribute('data-lucide', 'users');
>>>>>>> parent of e729613 (v4)
        }
        initLucide();
    }

<<<<<<< HEAD
    // ============================================================
    // DM
    // ============================================================
>>>>>>> parent of b21c083 (V7)
    function openDM(friend) {
        currentChannelId   = `dm_${friend.id}`;
        currentServerId    = null;
        currentChannelType = 'dm';
<<<<<<< HEAD
        if (rightPanelTitle) rightPanelTitle.textContent = "Profil";
        mainHeaderTitle.textContent = friend.username;
        mainHeaderIcon.setAttribute('data-lucide', 'at-sign');
        initLucide();
        
        chatInput.disabled  = false;
        chatInput.placeholder = `${friend.username} ile mesajlaş...`;
        chatMessages.innerHTML = '';
=======
        renderSidebar();
        mainHeaderTitle.textContent = friend.username;
        mainHeaderIcon.setAttribute('data-lucide', 'message-circle');
        chatPanelTitle.textContent  = friend.username;
        chatInput.disabled          = false;
        chatInput.placeholder       = `${friend.username} ile mesajlaş...`;
        chatMessages.innerHTML      = '';
        welcomeMessage.style.display = 'none';
        voiceGrid.style.display      = 'none';
>>>>>>> parent of b21c083 (V7)

=======
    function openDM(friend) {
        currentChannelId = `dm_${friend.id}`;
        renderSidebar();
        mainHeaderTitle.textContent = friend.username;
        document.getElementById('main-header-icon').setAttribute('data-lucide', 'user');
        chatInput.disabled = false;
        chatMessages.innerHTML = '';
        welcomeMessage.style.display = 'none';
>>>>>>> parent of e729613 (v4)
        socket.emit('get-dms', friend.id, (res) => {
            if(res.success) res.messages.forEach(m => appendMessage(m.sender, m.text, m.senderId === currentUser.id));
        });
        initLucide();
    }

<<<<<<< HEAD
<<<<<<< HEAD
    async function getMicStream() {
        if (localStream) return localStream;
        const constraints = {
            audio: {
                deviceId: appSettings.micId !== 'default' ? { exact: appSettings.micId } : undefined,
                noiseSuppression: appSettings.noiseSup,
                echoCancellation: appSettings.echoCanc,
                autoGainControl: false
            },
            video: false
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
        if (audioContext.state === 'suspended') await audioContext.resume();
        
        const source = audioContext.createMediaStreamSource(stream);
        if (!micGainNode) {
            micGainNode = audioContext.createGain();
            micGainNode.gain.value = appSettings.micVol / 100;
        }
        if (!micAnalyser) {
            micAnalyser = audioContext.createAnalyser();
            micAnalyser.fftSize = 256;
            micAnalyser.smoothingTimeConstant = 0.5;
        }
        
        const dest = audioContext.createMediaStreamDestination();
        source.connect(micGainNode);
        micGainNode.connect(micAnalyser);
        micGainNode.connect(dest);
        
        rawLocalStream = stream;
        return dest.stream;
    }


    function initWebRTC() {
        if (myPeer) return;
        myPeer = new Peer(undefined, { host:'0.peerjs.com', port:443, secure:true });
        myPeer.on('open', id => console.log('PeerJS:', id));
        myPeer.on('error', e => console.error('PeerJS:', e));
        
        myPeer.on('call', call => {
            let tracks = [];
            if (localStream) tracks.push(...localStream.getAudioTracks());
            if (isScreenSharing && screenStream) tracks.push(...screenStream.getTracks());
            call.answer(new MediaStream(tracks));
            call.on('stream', us => handleRemoteStream(call.peer, us));
            peers[call.peer] = call;
        });

        getMicStream()
            .then(stream => {
                localStream = stream;
                loadAudioDevices();
            }).catch(e => {
                console.warn('Mikrofon erişim hatası:', e);
                if(appSettings.micId !== 'default') {
                    appSettings.micId = 'default'; saveSettings();
                }
            });
=======
    // ============================================================
    // WebRTC
    // ============================================================
    function initWebRTC() {
        myPeer = new Peer(undefined, { host: '0.peerjs.com', port: 443, secure: true });
        myPeer.on('open', id => console.log('PeerJS hazır:', id));
        myPeer.on('error', err => console.error('PeerJS hatası:', err));

        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(stream => {
                localStream = stream;
                myPeer.on('call', call => {
                    call.answer(isScreenSharing && screenStream ? screenStream : localStream);
                    call.on('stream', userStream => handleRemoteStream(call.peer, userStream));
                    peers[call.peer] = call;
                });
                // Mikrofon cihazlarını listele
                loadAudioDevices();
            })
            .catch(err => console.warn('Mikrofon erişimi reddedildi:', err));
>>>>>>> parent of b21c083 (V7)
=======
    // --- WebRTC Logic ---
    function initWebRTC() {
        myPeer = new Peer(undefined, { host: '0.peerjs.com', port: 443, secure: true });
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            localStream = stream;
            myPeer.on('call', call => {
                call.answer(isScreenSharing ? screenStream : localStream);
                call.on('stream', userStream => handleRemoteStream(call.peer, userStream));
                peers[call.peer] = call;
            });
        }).catch(err => console.error("Could not access microphone:", err));
>>>>>>> parent of e729613 (v4)
    }

    async function loadAudioDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            audioDevices = devices.filter(d => d.kind === 'audioinput');
        } catch(e) {}
    }

<<<<<<< HEAD

    // ── KANALA KATIL ─────────────────────────────────────────────────
    function joinChannel(serverId, channel) {
<<<<<<< HEAD
        if (channel.type === 'text') {
            if (currentChannelType === 'voice') leaveVoice(false);
            currentChannelId = channel.id; currentServerId = serverId; currentChannelType = 'text';
            currentDmFriend  = null;
            friendProfileView.style.display = 'none';
            document.getElementById('center-chat-area').style.display = 'flex';
            const rsPanel = document.getElementById('right-side-panel');
            if (rsPanel) rsPanel.style.display = 'none';
            
            renderSidebar();
            chatInput.disabled = false;
            chatInput.placeholder = `#${channel.name} kanalına yaz...`;
            
            mainHeaderTitle.textContent = channel.name;
            mainHeaderIcon.setAttribute('data-lucide', 'hash');
            initLucide();
            
=======
    // ============================================================
    // JOIN CHANNEL
    // ============================================================
    function joinChannel(serverId, channel) {
        if (channel.type === 'text') {
            if (voiceGrid.style.display === 'grid') leaveVoice(false);
            currentChannelId   = channel.id;
            currentServerId    = serverId;
            currentChannelType = 'text';
            renderSidebar();
            chatInput.disabled     = false;
            chatInput.placeholder  = `#${channel.name} kanalına mesaj gönder...`;
            chatPanelTitle.textContent = `#${channel.name}`;
>>>>>>> parent of b21c083 (V7)
            welcomeMessage.style.display = 'none';
            chatMessages.innerHTML = '';

            socket.emit('get-channel-messages', channel.id, (res) => {
                if (res.success && res.messages.length > 0) {
                    res.messages.forEach(m => appendMessage(m.sender, m.text, m.senderId === currentUser.id, m.profilePic, m.timestamp));
                } else {
                    chatMessages.innerHTML = `
                        <div class="welcome-notif">
                            <i data-lucide="hash" style="width:48px;height:48px;color:var(--accent-purple);margin-bottom:16px;"></i>
                            <h3>#${escapeHtml(channel.name)}</h3>
                            <p>Bu kanalın başlangıcı. İlk mesajı sen gönder!</p>
                        </div>`;
                    initLucide();
                }
            });

            // ÖNEMLİ: Metin kanalına katılırken peerId GÖNDERME
            socket.emit('join-channel', { serverId, channelId: channel.id, peerId: null }, () => {});
            return;
        }

<<<<<<< HEAD
        // SES KANALI
        joinVoice(channel.id);
=======
        if(channel.type === 'text') {
            currentChannelId = channel.id;
            renderSidebar();
            chatInput.disabled = false;
            welcomeMessage.style.display = 'none';
            chatMessages.innerHTML = `<div class="welcome-notif"><h3>Welcome to #${channel.name}</h3></div>`;
            return;
        }

        // Voice Room Logic
        currentChannelId = channel.id;
        renderSidebar();
        welcomeMessage.style.display = 'none';
        voiceGrid.style.display = 'grid';
        voiceControls.style.display = 'flex';
        document.getElementById('active-voice-channel').textContent = channel.name;
        voiceGrid.innerHTML = '';
        
        addVoiceCard(myPeer.id, currentUser.username, null, true);
        socket.emit('join-channel', { serverId, channelId: channel.id, peerId: myPeer.id }, () => {});
>>>>>>> parent of e729613 (v4)
    }

    function joinVoice(chId) {
        if (!myPeer || !socket.connected) return;
        currentChannelId = chId; currentChannelType = 'voice';
        renderSidebar(); showToast('Ses bağlantısı kuruluyor...', 'info');
        
        getMicStream()
            .then(stream => {
                localStream = stream;
                socket.emit('join-channel', { serverId: currentServerId, channelId: chId, peerId: myPeer.id }, res => {
                    if (res && !res.success) {
                        showToast(res.message || 'Kanala katılılamadı.', 'error');
                        leaveVoice(false);
                        return;
                    }
                    voiceControls.style.display = 'flex';
                    welcomeMessage.style.display = 'none';
                    document.getElementById('center-chat-area').style.display = 'none';
                    voiceGrid.style.display = 'grid';
                    voiceGrid.innerHTML = '';
                    
                    addVoiceCard(myPeer.id, currentUser.username, true);
                    if (res && res.existingPeers) {
                        res.existingPeers.forEach(p => {
                            addVoiceCard(p.peerId, p.username, false);
                            const call = myPeer.call(p.peerId, localStream);
                            if (call) { call.on('stream', us => handleRemoteStream(p.peerId, us)); peers[p.peerId] = call; }
                        });
                    }
                });
            })
            .catch(e => {
                showToast('Mikrofon erişimi engellendi!', 'error');
                leaveVoice(false);
            });
    }

    socket.on('channel-users-updated', (cId, userIds) => {
        servers.forEach(s => {
            const ch = s.channels.find(c => c.id === cId);
            if (ch) ch.users = userIds; // Frontend'de cache'ini güncelle
        });
        if (currentServerId) renderSidebar();
    });

=======
        // ---- SES KANALI ----
        if (!myPeer || !myPeer.id) {
            showToast('PeerJS henüz hazır değil, bir saniye bekle...', 'error');
            return;
        }

        currentChannelId   = channel.id;
        currentServerId    = serverId;
        currentChannelType = 'voice';
        renderSidebar();
        welcomeMessage.style.display = 'none';
        voiceGrid.style.display      = 'grid';
        voiceGrid.innerHTML          = '';
        voiceControls.style.display  = 'flex';
        document.getElementById('active-voice-channel').textContent = channel.name;

        // Önce kendi kartını ekle
        addVoiceCard(myPeer.id, currentUser.username, null, true);

        // Sunucuya katıl ve mevcut kullanıcıları al
        socket.emit('join-channel', { serverId, channelId: channel.id, peerId: myPeer.id }, (res) => {
            if (!res) return;
            // Odada zaten olan kullanıcıları ekle ve ara
            if (res.existingPeers && res.existingPeers.length > 0) {
                res.existingPeers.forEach(ep => {
                    addVoiceCard(ep.peerId, ep.username, null, false);
                    // Mevcut kullanıcıyı ara (ikinci giren birinci ile konuşacak)
                    const streamToSend = isScreenSharing && screenStream ? screenStream : localStream;
                    if (streamToSend) {
                        const call = myPeer.call(ep.peerId, streamToSend);
                        if (call) {
                            call.on('stream', userStream => handleRemoteStream(ep.peerId, userStream));
                            peers[ep.peerId] = call;
                        }
                    }
                });
            }
        });
    }

    // Yeni kullanıcı bağlandı (birinci kullanıcı bu eventi alır)
>>>>>>> parent of b21c083 (V7)
    socket.on('user-connected', (peerId, username) => {
<<<<<<< HEAD
        if (currentChannelType !== 'voice') return;
        const streamToSend = isScreenSharing && screenStream ? screenStream : localStream;
        if (streamToSend) {
            const call = myPeer.call(peerId, streamToSend);
            if (call) {
                call.on('stream', userStream => handleRemoteStream(peerId, userStream));
                peers[peerId] = call;
            }
=======
        const call = myPeer.call(peerId, isScreenSharing ? screenStream : localStream);
        if (call) {
            call.on('stream', userStream => handleRemoteStream(peerId, userStream));
            peers[peerId] = call;
>>>>>>> parent of e729613 (v4)
        }
        addVoiceCard(peerId, username, null, false);
    });

    socket.on('user-disconnected', peerId => {
<<<<<<< HEAD
        if (peers[peerId]) { peers[peerId].close(); delete peers[peerId]; }
        document.querySelector(`[data-peer-id="${peerId}"]`)?.remove();
        if (voiceGrid.style.display === 'grid' && voiceGrid.querySelectorAll('.voice-card').length === 0) {
            leaveVoice(false);
=======
        if(peers[peerId]) peers[peerId].close();
        document.querySelector(`[data-peer-id="${peerId}"]`)?.remove();
        delete peers[peerId];
        if (voiceGrid.children.length === 0) {
            voiceGrid.style.display = 'none';
            voiceControls.style.display = 'none';
            welcomeMessage.style.display = 'flex';
>>>>>>> parent of e729613 (v4)
        }
    });

    function handleRemoteStream(peerId, stream) {
        const card = document.querySelector(`[data-peer-id="${peerId}"]`);
        if(!card) return;
        const audio = card.querySelector('audio');
<<<<<<< HEAD
        if (audio) {
            audio.srcObject = stream;
            if (peerId === myPeer?.id) audio.muted = true;
        }
        const video = card.querySelector('video');
<<<<<<< HEAD
        if (video) {
            if (stream.getVideoTracks().length > 0) { 
                video.srcObject = stream; 
                video.style.display = 'block'; 
                card.classList.add('is-sharing-screen');
                if (peerId === myPeer?.id) video.muted = true; 
            }
            else {
                video.style.display = 'none';
                card.classList.remove('is-sharing-screen');
            }
        }
        
        // Konuşma animasyonu için analyser ekle
        if (stream.getAudioTracks().length > 0) {
            if (!audioContext) {
                try { audioContext = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){}
            }
            if (audioContext && (!card.lastTrackId || card.lastTrackId !== stream.getAudioTracks()[0].id)) {
                try {
                    const src = audioContext.createMediaStreamSource(stream);
                    const an = audioContext.createAnalyser();
                    an.fftSize = 256;
                    src.connect(an);
                    card.analyser = an;
                    card.lastTrackId = stream.getAudioTracks()[0].id;
                } catch(e) {}
            }
=======
        if (video && stream.getVideoTracks().length > 0) {
=======
        if (audio) audio.srcObject = stream;
        
        const video = card.querySelector('video');
        if(stream.getVideoTracks().length > 0) {
>>>>>>> parent of e729613 (v4)
            video.srcObject = stream;
            video.style.display = 'block';
            card.querySelector('.avatar-ring').classList.add('has-video');
        } else if (video) {
            video.style.display = 'none';
            card.querySelector('.avatar-ring').classList.remove('has-video');
>>>>>>> parent of b21c083 (V7)
        }
    }

    function addVoiceCard(peerId, username, stream, isSelf) {
        if (document.querySelector(`[data-peer-id="${peerId}"]`)) return; // Duplicate önle
        const template = document.getElementById('user-card-template');
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector('.voice-card');
        card.setAttribute('data-peer-id', peerId);
<<<<<<< HEAD
        card.querySelector('.user-label').textContent = username + (isSelf ? ' (Sen)' : '');
        card.querySelector('.avatar-circle').style.backgroundImage =
            `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}')`;
        if (isSelf) card.querySelector('audio').muted = true;
=======
        card.querySelector('.user-label').textContent = username + (isSelf ? ' (You)' : '');
        card.querySelector('.avatar-circle').style.backgroundImage = `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${username}')`;
        if(isSelf) card.querySelector('audio').muted = true;
>>>>>>> parent of e729613 (v4)
        voiceGrid.appendChild(card);
        initLucide();
    }

<<<<<<< HEAD
    function leaveVoice(notify = true) {
<<<<<<< HEAD
        if (isScreenSharing) stopScreenShare();
        if (notify && currentChannelId && currentChannelType === 'voice')
=======
        if (notify && currentChannelId && currentChannelType === 'voice') {
>>>>>>> parent of b21c083 (V7)
            socket.emit('leave-channel', currentChannelId, myPeer?.id);
        }
        Object.values(peers).forEach(call => call.close());
        peers = {};
        voiceGrid.style.display      = 'none';
        voiceGrid.innerHTML          = '';
        voiceControls.style.display  = 'none';
        welcomeMessage.style.display = 'flex';
        currentChannelType = null;
        renderSidebar();
    }

<<<<<<< HEAD
    // ── CHAT ─────────────────────────────────────────────────────────
    // Ortak Bağlantılar Modal Fonksiyonları
    window.showMutualDetails = function(title, list) {
        document.getElementById('mutual-details-title').textContent = title;
        const domList = document.getElementById('mutual-details-list');
        domList.innerHTML = list.map(item => `
            <div style="padding: 12px; background: rgba(255,255,255,.05); border-radius: 8px; border: 1px solid var(--glass-border); font-weight: 600;">
                ${esc(item)}
            </div>
        `).join('');
        document.getElementById('mutual-details-modal').style.display = 'flex';
    };
    window.closeMutualDetails = function() {
        document.getElementById('mutual-details-modal').style.display = 'none';
    };

    function esc(s) {
        const div = document.createElement('div');
        div.textContent = s; return div.innerHTML;
    }

    function appendMsg(sender, text, isSelf, pic, ts) {
=======
    // ============================================================
    // CHAT MESSAGES
    // ============================================================
    function appendMessage(sender, text, isSelf, profilePic, timestamp) {
>>>>>>> parent of b21c083 (V7)
        const div = document.createElement('div');
        div.className = `message ${isSelf ? 'self' : ''}`;
        const avatar = profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(sender)}`;
        div.innerHTML = `
            <img class="msg-avatar" src="${avatar}" alt="${escapeHtml(sender)}">
            <div class="msg-body">
                <div class="msg-meta">
                    <strong>${escapeHtml(sender)}</strong>
                    <span class="msg-time">${timeStr(timestamp)}</span>
                </div>
                <span>${escapeHtml(text)}</span>
            </div>`;
=======
    // --- Messaging ---
    function appendMessage(sender, text, isSelf) {
        const div = document.createElement('div');
        div.className = `message ${isSelf ? 'self' : ''}`;
        div.innerHTML = `<strong>${sender}</strong> <span>${text}</span>`;
>>>>>>> parent of e729613 (v4)
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

<<<<<<< HEAD
    function sendMessage() {
        const val = chatInput.value.trim();
<<<<<<< HEAD
        if (!val) return;
        if (currentChannelType === 'dm') {
            if (!currentDmFriend) return;
            socket.emit('send-dm', { friendId: currentDmFriend.id, text: val });
        } else {
            const s = servers.find(svr => svr.id === currentServerId);
            if (!s) return;
            const textCh = s.channels.find(c => c.id === currentChannelId);
            if (!textCh) return;
            socket.emit('send-chat-message', { channelId: textCh.id, serverId: currentServerId, text: val });
=======
        if (!val || !currentChannelId) return;

        if (currentChannelType === 'dm') {
            const friendId = currentChannelId.split('_')[1];
            socket.emit('send-dm', { friendId, text: val });
        } else {
            // ÖNEMLİ: serverId de gönder
            socket.emit('send-chat-message', {
                channelId: currentChannelId,
                serverId: currentServerId,
                text: val
            });
>>>>>>> parent of b21c083 (V7)
        }
        appendMessage(currentUser.username, val, true, currentUser.profilePic, new Date().toISOString());
        chatInput.value = '';
    }

    chatInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });
    sendMsgBtn.addEventListener('click', sendMessage);

    // Gelen kanal mesajı
    socket.on('chat-message', d => {
<<<<<<< HEAD
        if (d.serverId === currentServerId && d.serverId != null) {
            appendMsg(d.sender, d.text, false, d.profilePic, d.timestamp);
        }
    });
    socket.on('dm-message', d => {
        clearDmNotif(d.friendId); // Eğer o arkadaşın DM'indeyse temizle
        if (currentChannelType === 'dm' && currentDmFriend?.id === d.friendId)
            appendMsg(d.message.sender, d.message.text, false, d.message.profilePic, d.message.timestamp);
=======
        if (d.channelId === currentChannelId) {
            appendMessage(d.sender, d.text, false, d.profilePic, d.timestamp);
=======
    chatInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter' && chatInput.value.trim()) {
            const val = chatInput.value.trim();
            if(currentChannelId.startsWith('dm_')) {
                socket.emit('send-dm', { friendId: currentChannelId.split('_')[1], text: val });
            } else {
                socket.emit('send-chat-message', currentChannelId, val);
            }
            appendMessage(currentUser.username, val, true);
            chatInput.value = '';
>>>>>>> parent of e729613 (v4)
        }
>>>>>>> parent of b21c083 (V7)
    });

<<<<<<< HEAD
    // Gelen DM
    socket.on('dm-message', d => {
        if (currentChannelId === `dm_${d.friendId}`) {
            appendMessage(d.message.sender, d.message.text, false, d.message.profilePic, d.message.timestamp);
        }
    });

    // ============================================================
    // VOICE CONTROLS
    // ============================================================
=======
    socket.on('chat-message', d => d.channelId === currentChannelId && appendMessage(d.sender, d.text, false));
    socket.on('dm-message', d => currentChannelId === `dm_${d.friendId}` && appendMessage(d.message.sender, d.message.text, false));

    // --- Controls ---
>>>>>>> parent of e729613 (v4)
    micBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        if (localStream) localStream.getAudioTracks()[0].enabled = !isMuted;
        micBtn.classList.toggle('leave-btn', isMuted);
        micBtn.innerHTML = `<i data-lucide="mic${isMuted ? '-off' : ''}"></i>`;
        initLucide();
    });

    deafenBtn.addEventListener('click', () => {
        isDeafened = !isDeafened;
<<<<<<< HEAD
        document.querySelectorAll('.voice-card audio').forEach(a => {
            const card = a.closest('.voice-card');
            if (card && card.getAttribute('data-peer-id') !== myPeer?.id) a.muted = isDeafened;
        });
        deafenBtn.classList.toggle('leave-btn', isDeafened);
        deafenBtn.innerHTML = `<i data-lucide="${isDeafened ? 'volume-x' : 'headphones'}"></i>`;
=======
        const allAudios = document.querySelectorAll('audio');
        allAudios.forEach(a => {
            if (a.parentElement.parentElement.getAttribute('data-peer-id') !== myPeer.id) {
                a.muted = isDeafened;
            }
        });
        deafenBtn.classList.toggle('leave-btn', isDeafened);
        deafenBtn.innerHTML = `<i data-lucide="headphones${isDeafened ? '-off' : ''}"></i>`;
>>>>>>> parent of e729613 (v4)
        initLucide();
        showToast(isDeafened ? 'Sesi kapattın' : 'Ses açıldı');
    });

    screenShareBtn.addEventListener('click', async () => {
        try {
            if(!isScreenSharing) {
                screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                isScreenSharing = true;
<<<<<<< HEAD
                screenShareBtn.classList.add('btn-active');
                updateStreams(screenStream);
                const myCard = document.querySelector(`[data-peer-id="${myPeer?.id}"]`);
                if (myCard) {
                    const v = myCard.querySelector('video');
                    v.srcObject = screenStream;
                    v.style.display = 'block';
                }
                screenStream.getVideoTracks()[0].addEventListener('ended', stopScreenShare);
                showToast('Ekran paylaşımı başladı', 'success');
=======
                screenShareBtn.classList.add('accent-glow');
                updateStreams(screenStream);
                const myCard = document.querySelector(`[data-peer-id="${myPeer.id}"]`);
                const v = myCard.querySelector('video');
                v.srcObject = screenStream; v.style.display = 'block';
>>>>>>> parent of e729613 (v4)
            } else {
                screenStream.getTracks().forEach(t => t.stop());
                isScreenSharing = false;
                updateStreams(localStream);
                const myCard = document.querySelector(`[data-peer-id="${myPeer.id}"]`);
                myCard.querySelector('video').style.display = 'none';
            }
        } catch (err) {
<<<<<<< HEAD
            if (err.name !== 'NotAllowedError') showToast('Ekran paylaşımı başarısız', 'error');
        }
    });

    function stopScreenShare() {
        if (screenStream) screenStream.getTracks().forEach(t => t.stop());
        isScreenSharing = false;
        screenShareBtn.classList.remove('btn-active');
        if (localStream) updateStreams(localStream);
        const myCard = document.querySelector(`[data-peer-id="${myPeer?.id}"]`);
        if (myCard) myCard.querySelector('video').style.display = 'none';
        showToast('Ekran paylaşımı durduruldu');
    }

=======
            console.error("Screen share failed:", err);
        }
    });

>>>>>>> parent of e729613 (v4)
    function updateStreams(stream) {
        Object.values(peers).forEach(call => {
            const videoTrack = stream.getVideoTracks()[0];
<<<<<<< HEAD
            const sender = call.peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
            if (sender && videoTrack) sender.replaceTrack(videoTrack).catch(console.warn);
=======
            const sender = call.peerConnection.getSenders().find(s => s.track.kind === 'video');
            if(sender && videoTrack) sender.replaceTrack(videoTrack).catch(e => console.error(e));
>>>>>>> parent of e729613 (v4)
            else if (videoTrack) call.peerConnection.addTrack(videoTrack, stream);
        });
    }

<<<<<<< HEAD
    disconnectBtn.addEventListener('click', () => leaveVoice(true));

<<<<<<< HEAD
    function renderMembersUI(members) {
        const online  = members.filter(m => m.isOnline);
        const offline = members.filter(m => !m.isOnline);
        membersList.innerHTML = '';

        function section(label, list) {
            if (!list.length) return;
            const hdr = document.createElement('div');
            hdr.className = 'members-section-hdr';
            hdr.textContent = `${label} — ${list.length}`;
            membersList.appendChild(hdr);
            list.forEach(m => {
                const row = document.createElement('div');
                row.className = 'member-row';
                const dotColor = STATUS_COLOR[m.status] || STATUS_COLOR.offline;
                row.innerHTML = `
                    <div style="position:relative;flex-shrink:0;">
                        <img src="${m.profilePic||`https://api.dicebear.com/7.x/avataaars/svg?seed=${esc(m.username)}`}"
                             class="member-avatar" alt="">
                        <span class="status-dot-sm" style="position:absolute;bottom:-1px;right:-1px;background:${dotColor};box-shadow:0 0 4px ${dotColor};"></span>
                    </div>
                    <div class="member-info">
                        <span class="member-name" style="${m.isOnline?'':'opacity:.5;'}">${esc(m.username)}${m.isOwner?' 👑':''}</span>
                        <span class="member-st" style="color:${dotColor};">${STATUS_LABEL[m.status]||'Çevrimdışı'}</span>
                    </div>`;
                row.addEventListener('click', () => {
                    if (m.id !== currentUser.id) openMemberProfile(m);
                });
                membersList.appendChild(row);
            });
        }

        section('ÇEVRİMİÇİ', online);
        section('ÇEVRİMDIŞI', offline);
    }

    toggleMembersBtn.addEventListener('click', () => {
        membersOpen = !membersOpen;
        if (membersOpen) {
            membersPanel.style.display = 'flex';
            if (currentServerId) openMembersPanel(currentServerId);
        } else {
            membersPanel.style.display = 'none';
        }
        toggleMembersBtn.classList.toggle('active', membersOpen);
    });

    socket.on('server-member-joined', d => {
        if (d.serverId === currentServerId) refreshMembersPanel();
    });

    socket.on('server-member-status', d => {
        // Sunucudaki birinin çevrimiçi durumu değiştiyse paneli tazele
        refreshMembersPanel();
    });

    socket.on('channel-created', d => {
        const s = servers.find(svr => svr.id === d.serverId);
        if (s) {
            s.channels.push(d.channel);
            if (currentServerId === d.serverId) renderSidebar();
        }
    });

    socket.on('server-updated', updatedServer => {
        const idx = servers.findIndex(s => s.id === updatedServer.id);
        if (idx !== -1) {
            servers[idx] = updatedServer;
            if (currentServerId === updatedServer.id) {
                mainHeaderTitle.textContent = updatedServer.name;
                sidebarCtxTitle.textContent = updatedServer.name.toUpperCase();
                renderSidebar();
            }
            renderServerList();
        }
    });

    // ── SESLİ ARAMA LOGİC (DM) ──────────────────────────────────────
    const incomingCallModal = document.getElementById('incoming-call-modal');
    let activeIncomingCallFrom = null;

    socket.on('incoming-call', d => {
        activeIncomingCallFrom = d.fromId;
        document.getElementById('inc-call-name').textContent = d.fromName;
        document.getElementById('inc-call-avatar').src = d.fromPic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${esc(d.fromName)}`;
        incomingCallModal.style.display = 'flex';
        // Opsiyonel: Zil sesi çalınabilir
    });

    socket.on('call-response', d => {
        if (d.accepted) {
            if (currentChannelId) leaveVoice(false);
            joinVoice('dm_' + d.fromId);
            showToast('Arama kabul edildi, bağlanılıyor...', 'success');
        } else {
            showToast('Arama reddedildi.', 'error');
        }
    });

    document.getElementById('btn-accept-call')?.addEventListener('click', () => {
        if (!activeIncomingCallFrom) return;
        socket.emit('dm-call-response', { toId: activeIncomingCallFrom, accepted: true });
        incomingCallModal.style.display = 'none';
        
        // Önce temizle sonra bağlan
        if (currentChannelId) leaveVoice(false);
        joinVoice('dm_' + activeIncomingCallFrom);
        activeIncomingCallFrom = null;
    });

    document.getElementById('btn-decline-call')?.addEventListener('click', () => {
        if (!activeIncomingCallFrom) return;
        socket.emit('dm-call-response', { toId: activeIncomingCallFrom, accepted: false });
        incomingCallModal.style.display = 'none';
        activeIncomingCallFrom = null;
    });


    // ── BİLDİRİM PANELİ ──────────────────────────────────────────────
    socket.on('receive-friend-request', req => {
        pendingRequests.push(req);
=======
    // ============================================================
    // FRIENDS & NOTIFICATIONS
    // ============================================================
    socket.on('receive-friend-request', (request) => {
        pendingRequests.push(request);
>>>>>>> parent of b21c083 (V7)
        updateNotifBadge();
    });

    socket.on('friend-added', (friend) => {
        if (!friends.find(f => f.id === friend.id)) {
            friends.push(friend);
            if (currentContext === 'friends') renderSidebar();
            showToast(`${friend.username} arkadaşlık isteğini kabul etti!`);
        }
    });

    function updateNotifBadge() {
        if (pendingRequests.length > 0) {
            notifBadge.style.display = 'flex';
            notifBadge.textContent = pendingRequests.length > 9 ? '9+' : pendingRequests.length;
        } else {
            notifBadge.style.display = 'none';
        }
    }

    function renderNotifPanel() {
        notifList.innerHTML = '';
        if (pendingRequests.length === 0) {
            notifList.innerHTML = '<div class="no-notif">Yeni bildirim yok</div>';
            return;
        }
        pendingRequests.forEach(req => {
            const item = document.createElement('div');
            item.className = 'notif-item';
            item.innerHTML = `
                <img src="${req.fromPic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.fromUsername}`}" alt="${escapeHtml(req.fromUsername)}">
                <div class="notif-info">
                    <p><strong>${escapeHtml(req.fromUsername)}</strong> sana arkadaşlık isteği gönderdi</p>
                    <span>${timeStr(req.timestamp)}</span>
                </div>
                <div class="notif-actions">
                    <button class="accept-btn" data-id="${req.fromId}">Kabul</button>
                    <button class="reject-btn" data-id="${req.fromId}">Reddet</button>
                </div>`;
            notifList.appendChild(item);
        });

        notifList.querySelectorAll('.accept-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const fromId = btn.dataset.id;
                socket.emit('accept-friend-request', fromId, (res) => {
                    if (res.success) {
                        friends.push(res.friend);
                        pendingRequests = pendingRequests.filter(r => r.fromId !== fromId);
                        updateNotifBadge();
                        renderNotifPanel();
                        if (currentContext === 'friends') renderSidebar();
                        showToast(`${res.friend.username} arkadaş listene eklendi!`);
                    }
                });
            });
        });

        notifList.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = pendingRequests.find(r => r.fromId === btn.dataset.id)?.fromUsername;
                pendingRequests = pendingRequests.filter(r => r.fromId !== btn.dataset.id);
                updateNotifBadge();
                renderNotifPanel();
                if (name) showToast(`${name} isteği reddedildi`);
            });
        });
    }

    notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        renderNotifPanel();
        const visible = notifPanel.style.display === 'flex';
        notifPanel.style.display = visible ? 'none' : 'flex';
    });

    // ============================================================
    // MODALS
    // ============================================================
    document.getElementById('nav-add-server').addEventListener('click', () => {
        document.getElementById('new-server-name').value = '';
        createServerModal.style.display = 'flex';
    });

    btnAddFriend.addEventListener('click', () => {
        document.getElementById('new-friend-username').value = '';
        document.getElementById('add-friend-message').textContent = '';
        addFriendModal.style.display = 'flex';
    });

    document.getElementById('nav-join-server').addEventListener('click', () => {
        document.getElementById('join-server-link').value = '';
        joinServerModal.style.display = 'flex';
    });

    // Davet linki kopyala
    btnInviteServer.addEventListener('click', () => {
        if (!currentServerId) return;
        // Render'da da çalışacak şekilde tam URL
        const link = `${window.location.origin}?invite=${currentServerId}`;

        const btn = btnInviteServer;
        btn.classList.add('copy-success');
        btn.querySelector('i').setAttribute('data-lucide', 'check');
        initLucide();
        btn.title = 'Kopyalandı!';

        navigator.clipboard.writeText(link)
            .then(() => {
                showToast('✅ Davet linki kopyalandı!', 'success');
            })
            .catch(() => {
                prompt('Davet linkini kopyala:', link);
            });

        setTimeout(() => {
            btn.classList.remove('copy-success');
            btn.querySelector('i').setAttribute('data-lucide', 'share-2');
            btn.title = 'Davet Linkini Kopyala';
            initLucide();
        }, 2500);
    });

    document.querySelectorAll('.close-modal').forEach(b => {
        b.addEventListener('click', () => b.closest('.modal-overlay').style.display = 'none');
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', e => {
            if (e.target === overlay) overlay.style.display = 'none';
        });
    });

    document.getElementById('confirm-create-server').addEventListener('click', () => {
        const name = document.getElementById('new-server-name').value.trim();
        if (!name) return;
        socket.emit('create-server', name, (res) => {
            if (res.success) {
                servers.push(res.server);
                createServerModal.style.display = 'none';
                renderServerList();
                activateServer(res.server);
                // Server ikonunu aktif yap
                setTimeout(() => {
                    document.querySelectorAll('.server-icon').forEach((el, i) => {
                        if (servers[i]?.id === res.server.id) el.classList.add('active');
                        else el.classList.remove('active');
                    });
                }, 50);
                showToast(`"${res.server.name}" sunucusu oluşturuldu!`);
=======
    disconnectBtn.addEventListener('click', () => {
        socket.emit('leave-channel', currentChannelId, myPeer.id);
        voiceGrid.style.display = 'none';
        voiceControls.style.display = 'none';
        welcomeMessage.style.display = 'flex';
        // Close all calls
        Object.values(peers).forEach(call => call.close());
        peers = {};
    });

    // --- Modal Logic ---
    document.getElementById('nav-add-server').addEventListener('click', () => createServerModal.style.display = 'flex');
    document.getElementById('btn-add-friend').addEventListener('click', () => addFriendModal.style.display = 'flex');
    document.getElementById('nav-join-server').addEventListener('click', () => joinServerModal.style.display = 'flex');
    
    document.querySelectorAll('.close-modal').forEach(b => b.addEventListener('click', () => {
        b.closest('.modal-overlay').style.display = 'none';
    }));

    document.getElementById('confirm-create-server').addEventListener('click', () => {
        const n = document.getElementById('new-server-name').value;
        if (!n) return;
        socket.emit('create-server', n, (res) => {
            if(res.success) { 
                servers.push(res.server); 
                renderServerList();
                createServerModal.style.display = 'none';
>>>>>>> parent of e729613 (v4)
            }
        });
    });

    document.getElementById('confirm-add-friend').addEventListener('click', () => {
<<<<<<< HEAD
        const name = document.getElementById('new-friend-username').value.trim();
        const msgEl = document.getElementById('add-friend-message');
        if (!name) return;
        socket.emit('send-friend-request', name, (res) => {
            msgEl.style.color = res.success ? 'var(--accent-green)' : 'var(--accent-red)';
            msgEl.textContent = res.message;
            if (res.success) {
                document.getElementById('new-friend-username').value = '';
                showToast(res.message);
=======
        const n = document.getElementById('new-friend-username').value;
        if (!n) return;
        socket.emit('add-friend', n, (res) => {
            if(res.success) { 
                friends.push(res.friend); 
                renderSidebar(); 
                addFriendModal.style.display = 'none'; 
            } else {
                document.getElementById('add-friend-message').textContent = res.message;
>>>>>>> parent of e729613 (v4)
            }
        });
    });

<<<<<<< HEAD
    document.getElementById('confirm-join-server').addEventListener('click', () => {
        let val = document.getElementById('join-server-link').value.trim();
        if (val.includes('?invite=')) val = val.split('?invite=')[1].split('&')[0];
        if (!val) return;
        socket.emit('join-server', val, (res) => {
            if (res.success) {
                servers.push(res.server);
                renderServerList();
                joinServerModal.style.display = 'none';
                activateServer(res.server);
                showToast(`"${res.server.name}" sunucusuna katıldın!`);
            } else {
                showToast(res.message, 'error');
            }
        });
    });

<<<<<<< HEAD
    // Ses Kanalı Oluşturma Olayı
    document.getElementById('confirm-create-voice').addEventListener('click', () => {
        const name = document.getElementById('new-voice-name').value.trim();
        const limit = document.getElementById('new-voice-limit').value.trim();
        if (!name || !currentServerId) return;
        socket.emit('create-voice-channel', { serverId: currentServerId, name, limit }, res => {
            if (res.success) {
                document.getElementById('create-voice-modal').style.display = 'none';
                showToast('Ses kanalı oluşturuldu!');
                // channel-created socket olayı sayfayı yenileyecektir.
                const s = servers.find(svr => svr.id === currentServerId);
                if (s && !s.channels.find(c => c.id === res.channel.id)) {
                    s.channels.push(res.channel);
                    renderSidebar();
                }
            } else {
                showToast(res.message, 'error');
            }
        });
    });

    // Davet linki kopyala
    btnInviteServer.addEventListener('click', () => {
        if (!currentServerId) return;
        const link = `${window.location.origin}?invite=${currentServerId}`;
        btnInviteServer.classList.add('copy-success');
        navigator.clipboard.writeText(link)
            .then(() => showToast('✅ Davet linki kopyalandı!', 'success'))
            .catch(() => { prompt('Linki kopyala:', link); });
        setTimeout(() => btnInviteServer.classList.remove('copy-success'), 3000);
    });
=======
    // ============================================================
    // SETTINGS MODAL
    // ============================================================
    document.getElementById('open-settings-btn').addEventListener('click', openSettings);
    document.getElementById('my-avatar').addEventListener('click', openSettings);
>>>>>>> parent of b21c083 (V7)

    function openSettings() {
        if (!currentUser) return;
        // Kullanıcı bilgilerini doldur
        document.getElementById('settings-username').textContent = currentUser.username;
        document.getElementById('settings-avatar').src = currentUser.profilePic;

<<<<<<< HEAD
    // Durum seçimi
    document.querySelectorAll('.status-option').forEach(el => {
        el.addEventListener('click', () => {
            document.querySelectorAll('.status-option').forEach(x => x.classList.remove('selected'));
            el.classList.add('selected');
            const newStatus = el.dataset.status;
            socket.emit('update-profile', { status: newStatus }, res => {
                if (res.success) {
                    myStatus = newStatus;
                    currentUser.status = newStatus;
                    updateMyStatusDot();
                    showToast(`Durum: ${STATUS_LABEL[newStatus]}`);
                    refreshMembersPanel();
                }
            });
        });
    });

    // İsim değiştir
    document.getElementById('pp-save-username').addEventListener('click', () => {
        const newUsername = document.getElementById('pp-new-username').value.trim();
        const msg = document.getElementById('pp-msg');
        if (!newUsername) { msg.style.color='var(--accent-red)'; msg.textContent='Kullanıcı adı boş olamaz.'; return; }
        socket.emit('update-profile', { newUsername }, res => {
            if (res.success) {
                currentUser.username = res.user.username;
                document.getElementById('pp-username').textContent = res.user.username;
                msg.style.color = 'var(--accent-green)'; msg.textContent = 'Kullanıcı adı güncellendi!';
                showToast('Kullanıcı adı değiştirildi!');
            } else { msg.style.color='var(--accent-red)'; msg.textContent = res.message; }
        });
    });

    // Şifre değiştir
    document.getElementById('pp-save-password').addEventListener('click', () => {
        const cp = document.getElementById('pp-current-pw').value;
        const np = document.getElementById('pp-new-pw').value;
        const cnp = document.getElementById('pp-confirm-pw').value;
        const msg = document.getElementById('pp-msg');
        if (!cp || !np || !cnp) { msg.style.color='var(--accent-red)'; msg.textContent='Tüm şifre alanlarını doldur.'; return; }
        if (np !== cnp) { msg.style.color='var(--accent-red)'; msg.textContent='Yeni şifreler eşleşmiyor.'; return; }
        if (np.length < 6) { msg.style.color='var(--accent-red)'; msg.textContent='Şifre en az 6 karakter olmalı.'; return; }
        socket.emit('update-profile', { newPassword: np, currPassword: cp }, res => {
            if (res.success) {
                msg.style.color='var(--accent-green)'; msg.textContent='Şifre güncellendi!';
                document.getElementById('pp-current-pw').value='';
                document.getElementById('pp-new-pw').value='';
                document.getElementById('pp-confirm-pw').value='';
                showToast('Şifre değiştirildi!');
            } else { msg.style.color='var(--accent-red)'; msg.textContent = res.message; }
        });
    });

    // Çıkış yap
    document.getElementById('pp-logout-btn')?.addEventListener('click', () => {
        if (!confirm('Çıkış yapmak istediğine emin misin?')) return;
        doLogout();
    });

    // Hesabı sil
    document.getElementById('pp-delete-account-btn').addEventListener('click', () => {
        if (!confirm('HESABINI KALICI OLARAK SİLMEK İSTEDİĞİNE EMİN MİSİN?\nBu işlem geri alınamaz!')) return;
        if (!confirm('GERÇEKTEN SİLİNSİN Mİ? Son kararınız mı?')) return;
        
        socket.emit('delete-account', res => {
            if (res.success) {
                showToast('Hesabın başarıyla silindi. Elveda...');
                doLogout();
            } else {
                showToast(res.message || 'Hesap silme başarısız.', 'error');
            }
        });
    });

    function doLogout() {
        leaveVoice(true);
        profilePanel.style.display = 'none';
        appSettingsModal.style.display = 'none';
        serverSettingsModal.style.display = 'none';
        if (incomingCallModal) incomingCallModal.style.display = 'none';
        if (document.getElementById('edit-channel-modal')) document.getElementById('edit-channel-modal').style.display = 'none';
        
        currentUser = null; friends = []; servers = []; pendingRequests = [];
        onlineFriends = new Set(); dmNotifications = new Map();
        currentContext = 'friends'; currentChannelId = null; currentServerId = null;
        appContainer.style.display = 'none';
        authOverlay.style.display = 'flex';
        authUsernameInput.value = ''; authPasswordInput.value = ''; authError.textContent = '';
        socket.disconnect(); socket.connect();
    }


    // ── UYGULAMA AYARLARI ─────────────────────────────────────────────
    document.getElementById('open-settings-btn').addEventListener('click', openAppSettings);

    function startMicTest() {
        if (!micAnalyser) return;
        const dataArray = new Uint8Array(micAnalyser.frequencyBinCount);
        const levelBar = document.getElementById('as-mic-test-level');
        
        function updateLevel() {
            if (appSettingsModal.style.display === 'none') return;
            micAnalyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for(let i=0; i<dataArray.length; i++) sum += dataArray[i];
            let avg = sum / dataArray.length;
            let percent = Math.min(100, Math.max(0, (avg / 128) * 100 * (appSettings.micVol / 100)));
            levelBar.style.width = percent + '%';
            
            // Renk değiştir (Ses çok yüksekse kırmızıya dönsün)
            if (percent > 85) levelBar.style.background = 'var(--accent-red)';
            else if (percent > 60) levelBar.style.background = '#eab308'; // yellow
            else levelBar.style.background = 'var(--accent-green)';
            
            testAnimFrame = requestAnimationFrame(updateLevel);
        }
        testAnimFrame = requestAnimationFrame(updateLevel);
    }

    function stopMicTest() {
        if (testAnimFrame) cancelAnimationFrame(testAnimFrame);
        document.getElementById('as-mic-test-level').style.width = '0%';
    }

    async function openAppSettings() {
        await loadAudioDevices();
        const micSel = document.getElementById('as-mic-select');
        const spkSel = document.getElementById('as-spk-select');
        micSel.innerHTML = spkSel.innerHTML = '';

        if (!audioDevices.length) {
            micSel.innerHTML = '<option value="default">Cihaz bulunamadı</option>';
=======
        // Mikrofon cihazlarını doldur
        const micSelect = document.getElementById('settings-mic-select');
        micSelect.innerHTML = '';
        if (audioDevices.length === 0) {
            micSelect.innerHTML = '<option>Cihaz bulunamadı</option>';
>>>>>>> parent of b21c083 (V7)
        } else {
            micSel.innerHTML = '<option value="default">Varsayılan Mikrofon</option>';
            audioDevices.forEach((d, i) => {
<<<<<<< HEAD
                if(!d.deviceId) return;
                const o = document.createElement('option');
                o.value = d.deviceId; o.textContent = d.label || `Mikrofon ${i+1}`;
                if (d.deviceId === appSettings.micId) o.selected = true;
                micSel.appendChild(o);
            });
        }
        if (!audioOutputs.length) {
            spkSel.innerHTML = '<option value="default">Varsayılan Çıkış</option>';
        } else {
            spkSel.innerHTML = '<option value="default">Varsayılan Hoparlör</option>';
            audioOutputs.forEach((d, i) => {
                if(!d.deviceId) return;
                const o = document.createElement('option');
                o.value = d.deviceId; o.textContent = d.label || `Hoparlör ${i+1}`;
                if (d.deviceId === appSettings.spkId) o.selected = true;
                spkSel.appendChild(o);
            });
        }
        
        document.getElementById('as-mic-vol').value = appSettings.micVol;
        document.getElementById('as-mic-vol-label').textContent = appSettings.micVol + '%';
        
        document.getElementById('as-noise-sup').checked = appSettings.noiseSup;
        document.getElementById('as-echo-canc').checked = appSettings.echoCanc;

        document.getElementById('as-vol').value = appSettings.spkVol;
        document.getElementById('as-vol-label').textContent = appSettings.spkVol + '%';
        
        appSettingsModal.style.display = 'flex';
=======
                const opt = document.createElement('option');
                opt.value = d.deviceId;
                opt.textContent = d.label || `Mikrofon ${i + 1}`;
                if (selectedMicId === d.deviceId) opt.selected = true;
                micSelect.appendChild(opt);
            });
        }

        // Ses seviyesi
        const volSlider = document.getElementById('settings-volume');
        volSlider.value = isDeafened ? 0 : 100;

        settingsModal.style.display = 'flex';
>>>>>>> parent of b21c083 (V7)
        initLucide();
        
        if (audioContext && audioContext.state === 'suspended') audioContext.resume();
        startMicTest();
    }
    
    // Uygulama ayarları kapanınca testi durdur
    const csBtn = appSettingsModal.querySelector('.close-modal');
    if(csBtn) {
        csBtn.addEventListener('click', stopMicTest);
    }
    appSettingsModal.addEventListener('click', e => {
        if (e.target === appSettingsModal) stopMicTest();
    });

    // Kayıt işlemleri
    async function reinitMic() {
        if (rawLocalStream) rawLocalStream.getTracks().forEach(t => t.stop());
        try {
            localStream = await getMicStream();
            if (isMuted) localStream.getAudioTracks().forEach(t => t.enabled = false);
            // Mevcut aramalardaki ses tracklerini güncelle
            Object.values(peers).forEach(call => {
                if (!call.peerConnection) return;
                const sender = call.peerConnection.getSenders().find(s => s.track && s.track.kind === 'audio');
                const newAudioTrack = localStream.getAudioTracks()[0];
                if (sender && newAudioTrack) sender.replaceTrack(newAudioTrack).catch(()=>{});
            });
        } catch(e) {
            showToast('Mikrofon ayarlanamadı', 'error');
        }
    }

<<<<<<< HEAD
    document.getElementById('as-mic-select').addEventListener('change', async e => {
        appSettings.micId = e.target.value; saveSettings();
        await reinitMic();
        showToast('Mikrofon değiştirildi');
    });

    document.getElementById('as-mic-vol').addEventListener('input', e => {
        const v = parseInt(e.target.value);
        appSettings.micVol = v; saveSettings();
        document.getElementById('as-mic-vol-label').textContent = v + '%';
        if (micGainNode) micGainNode.gain.setValueAtTime(v / 100, audioContext.currentTime);
    });

    document.getElementById('as-noise-sup').addEventListener('change', async e => {
        appSettings.noiseSup = e.target.checked; saveSettings();
        await reinitMic();
        showToast(appSettings.noiseSup ? 'Gürültü önleme devrede' : 'Gürültü önleme kapalı');
    });

    document.getElementById('as-echo-canc').addEventListener('change', async e => {
        appSettings.echoCanc = e.target.checked; saveSettings();
        await reinitMic();
        showToast(appSettings.echoCanc ? 'Yankı önleme devrede' : 'Yankı önleme kapalı');
    });

    document.getElementById('as-spk-select').addEventListener('change', e => {
        appSettings.spkId = e.target.value; saveSettings();
        const outputId = appSettings.spkId === 'default' ? '' : appSettings.spkId;
        // Tüm ses etiketlerine uygula
        document.querySelectorAll('audio, video').forEach(el => {
            if (typeof el.setSinkId !== 'undefined') el.setSinkId(outputId).catch(()=>{});
        });
        showToast('Hoparlör değiştirildi');
    });

    // Ses seviyesi
    document.getElementById('as-vol').addEventListener('input', e => {
        const v = parseInt(e.target.value);
        appSettings.spkVol = v; saveSettings();
        document.getElementById('as-vol-label').textContent = v + '%';
        document.querySelectorAll('.voice-card audio, .voice-card video').forEach(media => {
            if (media.closest('[data-peer-id]')?.dataset.peerId !== myPeer?.id) {
                media.volume = v / 100;
            }
        });
=======
    // Mikrofon değiştir
    document.getElementById('settings-mic-select').addEventListener('change', async (e) => {
        selectedMicId = e.target.value;
        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                audio: { deviceId: { exact: selectedMicId } }
            });
            if (localStream) localStream.getTracks().forEach(t => t.stop());
            localStream = newStream;
            // Peer'lara yeni stream gönder
            updateStreams(localStream);
            showToast('Mikrofon değiştirildi');
        } catch (err) {
            showToast('Mikrofon değiştirilirken hata oluştu', 'error');
        }
    });

    // Ses seviyesi
    document.getElementById('settings-volume').addEventListener('input', (e) => {
        const vol = e.target.value / 100;
        document.querySelectorAll('.voice-card audio').forEach(a => {
            const card = a.closest('.voice-card');
            if (card && card.getAttribute('data-peer-id') !== myPeer?.id) {
                a.volume = vol;
            }
        });
        document.getElementById('settings-volume-label').textContent = e.target.value + '%';
>>>>>>> parent of b21c083 (V7)
    });

    // Tema toggle
    document.getElementById('settings-theme-toggle').addEventListener('click', () => {
        document.body.classList.toggle('theme-light');
        const isLight = document.body.classList.contains('theme-light');
        document.getElementById('settings-theme-toggle').textContent = isLight ? '🌙 Koyu Mod' : '☀️ Açık Mod';
        showToast(isLight ? 'Açık mod aktif' : 'Koyu mod aktif');
    });

<<<<<<< HEAD
    // Ayarlardan çıkış
    document.getElementById('as-logout-btn').addEventListener('click', () => {
        if (!confirm('Çıkış yapmak istediğine emin misin?')) return;
        doLogout();
    });

    // ── SES KONTROLLERI ───────────────────────────────────────────────
    micBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        if (localStream) {
            localStream.getAudioTracks().forEach(t => t.enabled = !isMuted);
        }
        micBtn.classList.toggle('leave-btn', isMuted);
        micBtn.innerHTML = `<i data-lucide="${isMuted?'mic-off':'mic'}"></i>`;
        initLucide();
        showToast(isMuted ? 'Mikrofon kapatıldı' : 'Mikrofon açıldı');
    });

    deafenBtn.addEventListener('click', () => {
        isDeafened = !isDeafened;
        document.querySelectorAll('audio, video').forEach(media => {
            if (media.closest('[data-peer-id]')?.dataset.peerId !== myPeer?.id) {
                media.muted = isDeafened;
            }
        });
        deafenBtn.classList.toggle('leave-btn', isDeafened);
        deafenBtn.innerHTML = `<i data-lucide="${isDeafened?'volume-x':'headphones'}"></i>`;
        initLucide();
        showToast(isDeafened ? 'Ses kapatıldı' : 'Ses açıldı');
    });


    screenShareBtn.addEventListener('click', async () => {
        try {
            if (!isScreenSharing) {
                screenStream = await navigator.mediaDevices.getDisplayMedia({ video:true, audio:true });
                isScreenSharing = true; screenShareBtn.classList.add('btn-active');
                
                const myCard = document.querySelector(`[data-peer-id="${myPeer?.id}"]`);
                if (myCard) { 
                    const v=myCard.querySelector('video'); 
                    v.srcObject=screenStream; 
                    v.style.display='block'; 
                    v.muted=true;
                    myCard.classList.add('is-sharing-screen'); 
                }
                
                const mixedTracks = [];
                if (localStream) mixedTracks.push(...localStream.getAudioTracks());
                if (screenStream) mixedTracks.push(...screenStream.getTracks());
                const mixedStream = new MediaStream(mixedTracks);

                Object.keys(peers).forEach(peerId => {
                    if (peers[peerId]) peers[peerId].close();
                    const newCall = myPeer.call(peerId, mixedStream);
                    newCall.on('stream', us => handleRemoteStream(peerId, us));
                    peers[peerId] = newCall;
                });
                
                screenStream.getVideoTracks()[0].addEventListener('ended', stopScreenShare);
                showToast('Ekran paylaşımı başladı');
            } else stopScreenShare();
        } catch(e) { if (e.name!=='NotAllowedError') showToast('Ekran paylaşımı başarısız', 'error'); }
    });

    function stopScreenShare() {
        screenStream?.getTracks().forEach(t=>t.stop());
        isScreenSharing = false; screenShareBtn.classList.remove('btn-active');
        
        const myCard = document.querySelector(`[data-peer-id="${myPeer?.id}"]`);
        if (myCard) {
            myCard.querySelector('video').style.display='none';
            myCard.classList.remove('is-sharing-screen');
        }
        
        showToast('Ekran paylaşımı durduruldu');
        
        Object.keys(peers).forEach(peerId => {
            if (peers[peerId]) peers[peerId].close();
            const newCall = myPeer.call(peerId, localStream);
            newCall.on('stream', us => handleRemoteStream(peerId, us));
            peers[peerId] = newCall;
        });
    }

    disconnectBtn.addEventListener('click', () => leaveVoice(true));

    // ── YENİ MODALLAR VE MANTIK ─────────────────────────────────────────
    const serverSettingsModal = document.getElementById('server-settings-modal');
    const createVoiceModal = document.getElementById('create-voice-modal');
    
    // Server Ayarları Değişkeni
    let activeSettingsServerId = null;

    window.openServerSettings = function(server) {
        if (server.ownerId !== currentUser.id) {
            document.getElementById('edit-server-name').disabled = true;
            document.getElementById('edit-server-avatar').disabled = true;
            document.getElementById('btn-save-server-settings').style.display = 'none';
            document.getElementById('btn-delete-server').style.display = 'none';
        } else {
            document.getElementById('edit-server-name').disabled = false;
            document.getElementById('edit-server-avatar').disabled = false;
            document.getElementById('btn-save-server-settings').style.display = '';
            document.getElementById('btn-delete-server').style.display = '';
        }
        
        activeSettingsServerId = server.id;
        document.getElementById('settings-server-name-display').textContent = 'Ayarlar: ' + server.name;
        document.getElementById('edit-server-name').value = server.name;
        
        serverSettingsModal.style.display = 'flex';
    };

    document.getElementById('btn-server-settings')?.addEventListener('click', () => {
        const s = servers.find(svr => svr.id === currentServerId);
        if (s) {
            openServerSettings(s);
        } else {
            showToast('Sunucu bulunamadı.', 'error');
        }
    });

    // Sunucu ayarları kaydedildiğinde sidebar'ı güncellemek için global bir dinleyici
    socket.off('server-updated').on('server-updated', items => {
        const updatedServer = items;
        const idx = servers.findIndex(s => s.id === updatedServer.id);
        if (idx !== -1) {
            servers[idx] = updatedServer;
            if (currentServerId === updatedServer.id) {
                mainHeaderTitle.textContent = updatedServer.name;
                sidebarCtxTitle.textContent = updatedServer.name.toUpperCase();
                renderSidebar();
            }
            renderServerList();
        }
    });


    // ── SUNUCU AYARLARI KONTROLLERİ ──────────────────────────────
    document.getElementById('btn-save-server-settings')?.addEventListener('click', () => {
        if (!activeSettingsServerId) return;
        const name = document.getElementById('edit-server-name').value.trim();
        const avatar = document.getElementById('edit-server-avatar').value.trim();
        if (!name) return showToast('Sunucu adı boş olamaz', 'error');

        socket.emit('edit-server', { serverId: activeSettingsServerId, name, avatar }, res => {
            if (res.success) {
                const s = servers.find(svr => svr.id === activeSettingsServerId);
                if (s) { s.name = res.server.name; s.avatar = res.server.avatar; }
                document.getElementById('server-settings-modal').style.display = 'none';
                renderServerList();
                if (currentServerId === activeSettingsServerId) {
                    mainHeaderTitle.textContent = res.server.name;
                    sidebarCtxTitle.textContent = res.server.name.toUpperCase();
                }
                showToast('Sunucu ayarları güncellendi!');
            } else showToast(res.message, 'error');
        });
    });

    document.getElementById('btn-delete-server')?.addEventListener('click', () => {
        if (!activeSettingsServerId) return;
        if (confirm('DİKKAT: Sunucu kalıcı olarak silinecek. Emin misin?')) {
            socket.emit('delete-server', activeSettingsServerId, res => {
                if (res.success) {
                    servers = servers.filter(s => s.id !== activeSettingsServerId);
                    document.getElementById('server-settings-modal').style.display = 'none';
                    showToast('Sunucu silindi.', 'error');
                    navFriends.click();
                    renderServerList();
                } else showToast(res.message, 'error');
            });
        }
    });

    document.getElementById('btn-leave-server')?.addEventListener('click', () => {
        if (!activeSettingsServerId) return;
        if (confirm('Sunucudan ayrılmak istediğine emin misin?')) {
            socket.emit('leave-server', activeSettingsServerId, res => {
                if (res.success) {
                    servers = servers.filter(s => s.id !== activeSettingsServerId);
                    document.getElementById('server-settings-modal').style.display = 'none';
                    showToast('Sunucudan ayrıldınız.');
                    navFriends.click();
                    renderServerList();
                } else showToast(res.message, 'error');
            });
        }
    });


    // ── PROFİL AVATAR GÜNCELLEME ────────────────────────────────────
    document.getElementById('pp-refresh-avatar')?.addEventListener('click', () => {
        const seed = Math.random().toString(36).substring(2, 10);
        const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
        updateProfileAvatar(url);
    });

    function updateProfileAvatar(url) {
        socket.emit('update-profile', { profilePic: url }, res => {
            if (res.success) {
                currentUser.profilePic = url;
                document.getElementById('pp-avatar').src = url;
                myAvatarImg.src = url;
                // Chat'teki kendi mesajlarındaki PP'leri de güncelle
                document.querySelectorAll('.msg-avatar').forEach(img => {
                   if (img.dataset.uid === currentUser.id) img.src = url;
                });
                showToast('Profil resmi güncellendi!');
            } else showToast(res.message, 'error');
        });
    }




    // ── KANAL AYARLARI KONTROLLERİ ──────────────────────────────
    document.getElementById('ctx-edit-ch')?.addEventListener('click', () => {
        document.getElementById('edit-channel-modal').style.display = 'flex';
    });

    document.getElementById('btn-save-channel-settings')?.addEventListener('click', () => {
        if (!activeContextChannelId || !currentServerId) return;
        const name = document.getElementById('edit-ch-name').value.trim();
        const limit = document.getElementById('edit-ch-limit').value;
        if (!name) return showToast('Kanal adı boş olamaz', 'error');

        socket.emit('edit-channel', { serverId: currentServerId, channelId: activeContextChannelId, name, limit }, res => {
            if (res.success) {
                document.getElementById('edit-channel-modal').style.display = 'none';
                showToast('Kanal güncellendi!');
            } else showToast(res.message, 'error');
        });
    });

    document.getElementById('ctx-delete-ch')?.addEventListener('click', () => {
        if (!activeContextChannelId || !currentServerId) return;
        if (confirm('Kanalı silmek istediğine emin misin?')) {
            socket.emit('delete-channel', { serverId: currentServerId, channelId: activeContextChannelId }, res => {
                if (res.success) {
                    showToast('Kanal silindi.', 'error');
                    if (currentChannelId === activeContextChannelId) leaveVoice(false);
                } else showToast(res.message, 'error');
            });
        }
    });

    document.getElementById('btn-delete-channel')?.addEventListener('click', () => {
        document.getElementById('ctx-delete-ch').click();
        document.getElementById('edit-channel-modal').style.display = 'none';
    });

    document.getElementById('pp-delete-account-btn')?.addEventListener('click', () => {
        if (confirm('DİKKAT: Hesabınız kalıcı olarak SİLİNECEKTİR. Emin misiniz?')) {
            socket.emit('delete-account', r => {
                if (r.success) {
                    showToast('Hesabınız başarıyla silindi.', 'error');
                    profilePanel.style.display = 'none';
                    doLogout();
                } else showToast(r.message, 'error');
            });
        }
    });


    // Ses Kanalı Ekleme
    document.getElementById('confirm-create-voice')?.addEventListener('click', () => {
        if (!currentServerId) return;
        const name = document.getElementById('new-voice-name').value;
        const limit = document.getElementById('new-voice-limit').value;
        socket.emit('create-voice-channel', { serverId: currentServerId, name, limit }, r => {
            if (r.success) {
                showToast('Kanal oluşturuldu');
                createVoiceModal.style.display = 'none';
                document.getElementById('new-voice-name').value = '';
                document.getElementById('new-voice-limit').value = '';
                const s = servers.find(s => s.id === currentServerId);
                if (s) { s.channels.push(r.channel); renderSidebar(); }
            } else showToast(r.message || 'Hata', 'error');
        });
    });

    document.querySelectorAll('.close-modal').forEach(b => {
        b.addEventListener('click', e => {
            e.target.closest('.modal-overlay').style.display = 'none';
        });
    });

    // ── URL DAVET PARAMETRESİ ─────────────────────────────────────────
    try {
        const params = new URLSearchParams(window.location.search);
        const inv = params.get('invite');
        if (inv) window._pendingInvite = inv;
    } catch(e) {}

    // ── İLK TOOLTIP BAĞLAMA ───────────────────────────────────────────
    setTimeout(attachTooltips, 500);

    // ── KULLANICI / ÜYE PROFİL PANELİ (SUNUCU İÇİ) ───────────────────
    const memberProfileModal = document.getElementById('member-profile-modal');
    window.openMemberProfile = function(user) {
        document.getElementById('mp-avatar').src = user.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${esc(user.username)}`;
        document.getElementById('mp-username').textContent = user.username;
        
        const isFriend = friends.find(f => f.id === user.id);
        const addBtn = document.getElementById('mp-add-friend-btn');
        if (isFriend) {
            addBtn.innerHTML = `<i data-lucide="message-square"></i> Mesaj Gönder`;
            addBtn.onclick = () => {
                memberProfileModal.style.display = 'none';
                document.getElementById('nav-friends').click();
                showFriendProfile(isFriend);
            };
        } else {
            addBtn.innerHTML = `<i data-lucide="user-plus"></i> Arkadaşlık İsteği Gönder`;
            addBtn.onclick = () => {
                socket.emit('send-friend-request', user.username, res => {
                    showToast(res.message, res.success ? 'success' : 'error');
                });
            };
        }
        
        document.getElementById('mp-mutual-friends-btn').onclick = () => {
             socket.emit('get-mutual-details', user.id, res => {
                 if (res.success && res.mutualFriends.length > 0) showMutualDetails('Ortak Arkadaşlar', res.mutualFriends);
                 else showToast('Ortak arkadaş bulunamadı.', 'info');
             });
        };
        document.getElementById('mp-mutual-servers-btn').onclick = () => {
             socket.emit('get-mutual-details', user.id, res => {
                 if (res.success && res.mutualServers.length > 0) showMutualDetails('Ortak Sunucular', res.mutualServers);
                 else showToast('Ortak sunucu bulunamadı.', 'info');
             });
        };
        
        memberProfileModal.style.display = 'flex';
        initLucide();
    };

    // ── KONUŞMA ANİMASYONU ──────────────────────────────────────────
    function updateSpeakingAnimations() {
        if (document.getElementById('voice-grid').style.display !== 'none') {
            const dataArray = new Uint8Array(256);
            document.querySelectorAll('.voice-card').forEach(card => {
                let isSpeaking = false;
                
                if (card.getAttribute('data-peer-id') === myPeer?.id) {
                    if (micAnalyser && !isMuted) {
                        micAnalyser.getByteFrequencyData(dataArray);
                        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                        if (avg > 15) isSpeaking = true;
                    }
                } else if (card.analyser) {
                    card.analyser.getByteFrequencyData(dataArray);
                    const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                    if (avg > 15) isSpeaking = true;
                }

                if (isSpeaking) {
                    card.classList.add('is-speaking');
                } else {
                    card.classList.remove('is-speaking');
                }
            });
        }
        requestAnimationFrame(updateSpeakingAnimations);
    }
    updateSpeakingAnimations();
=======
    // Çıkış yap
    document.getElementById('settings-logout-btn').addEventListener('click', () => {
        if (!confirm('Çıkış yapmak istediğinizden emin misiniz?')) return;
        leaveVoice(true);
        settingsModal.style.display = 'none';
        currentUser = null;
        friends = [];
        servers = [];
        pendingRequests = [];
        currentContext = 'friends';
        currentChannelId = null;
        currentServerId = null;
        appContainer.style.display = 'none';
        authOverlay.style.display = 'flex';
        authUsernameInput.value = '';
        authPasswordInput.value = '';
        authError.textContent = '';
        // Socket yeniden bağlan
        socket.disconnect();
        socket.connect();
    });

    // URL davet parametresi
    const urlParams = new URLSearchParams(window.location.search);
    const inviteId  = urlParams.get('invite');
    if (inviteId) window._pendingInvite = inviteId;
>>>>>>> parent of b21c083 (V7)
=======
    // Sidebar context home click
    document.getElementById('nav-home').addEventListener('click', () => {
        currentContext = 'friends';
        document.querySelectorAll('.server-icon').forEach(el => el.classList.remove('active'));
        renderSidebar();
        switchMainView('home');
    });

    // Support Settings
    document.getElementById('open-settings-btn').addEventListener('click', () => {
        alert("Nexus Settings Interface coming soon!");
    });
>>>>>>> parent of e729613 (v4)
});
