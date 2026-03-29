document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Selectors ---
    const authOverlay        = document.getElementById('auth-overlay');
    const loginBtn           = document.getElementById('login-btn');
    const registerBtn        = document.getElementById('register-btn');
    const authUsernameInput  = document.getElementById('auth-username');
    const authPasswordInput  = document.getElementById('auth-password');
    const authError          = document.getElementById('auth-error');

    const appContainer       = document.getElementById('app-container');
    const mainHeaderTitle    = document.getElementById('main-header-title');
    const mainHeaderIcon     = document.getElementById('main-header-icon');
    const sidebarContextTitle = document.getElementById('sidebar-context-title');
    const dynamicServerList  = document.getElementById('dynamic-server-list');
    const dynamicChannelList = document.getElementById('dynamic-channel-list');
    const chatMessages       = document.getElementById('chat-messages');
    const chatInput          = document.getElementById('chat-input');
    const sendMsgBtn         = document.getElementById('send-msg-btn');
    const chatPanel          = document.getElementById('chat-panel');
    const chatPanelTitle     = document.getElementById('chat-panel-title');

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
    let socket = io(window.location.origin, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
    });
<<<<<<< HEAD

<<<<<<< HEAD
    // Sayfa yenilenince uyarı ver
    window.addEventListener('beforeunload', (e) => {
        // Oturum açıksa uyarı ver
        if (currentUser) {
            e.preventDefault();
            e.returnValue = 'Sayfa yenilenirse giriş ekranına yönlendirilirsiniz. Onaylıyor musunuz?';
        }
    });

=======
>>>>>>> parent of 87eae11 (v8)
    // ── STATE ────────────────────────────────────────────────────────
    let currentUser       = null;
    let friends           = [];
    let servers           = [];
    let pendingRequests   = [];
    let onlineFriends     = new Set();       // Set<userId>
    let dmNotifications   = new Map();       // Map<friendId, count>
    let currentContext    = 'friends';
=======
    let myPeer          = null;
    let currentUser     = null;
    let friends         = [];
    let servers         = [];
    let pendingRequests = [];
    let currentContext  = 'friends';
>>>>>>> parent of b21c083 (V7)
    let currentChannelId  = null;
    let currentServerId   = null;
    let currentChannelType = null; // 'text' | 'voice' | 'dm'
    let peers           = {};
    let localStream     = null;
    let screenStream    = null;
    let isMuted         = false;
    let isDeafened      = false;
    let isScreenSharing = false;
    let audioDevices    = [];
    let selectedMicId   = null;

    // ============================================================
    // UTILITY
    // ============================================================
    function initLucide() { if (window.lucide) lucide.createIcons(); }

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

    function handleAuth(type) {
        const username = authUsernameInput.value.trim();
        const password = authPasswordInput.value.trim();
        if (!username || !password) return showError('Lütfen tüm alanları doldurun.');

        const profilePic = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
        authError.textContent = '';

        socket.emit(type, { username, password, profilePic }, (res) => {
            if (res.success) {
                if (type === 'login') {
<<<<<<< HEAD
<<<<<<< HEAD
                    applyLoginResult(res);
=======
                    currentUser   = res.user;
                    friends       = res.friends || [];
                    servers       = res.servers || [];
=======
                    currentUser     = res.user;
                    friends         = res.friends || [];
                    servers         = res.servers || [];
>>>>>>> parent of b21c083 (V7)
                    pendingRequests = res.friendRequests || [];

                    authOverlay.style.display = 'none';
                    appContainer.style.display = 'flex';
                    document.querySelector('#my-avatar img').src = currentUser.profilePic;

                    initWebRTC();
                    renderServerList();
                    renderSidebar();
                    updateNotifBadge();
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
>>>>>>> parent of 87eae11 (v8)
                } else {
                    authError.style.color = 'var(--accent-green)';
                    authError.textContent = res.message;
                    authPasswordInput.value = '';
                }
            } else {
                showError(res.message);
            }
        });
    }

<<<<<<< HEAD
    // Giriş sonucunu uygula (hem manuel hem otomatik giriş için)
    function applyLoginResult(res, silent = false) {
        currentUser     = res.user;
        friends         = res.friends || [];
        servers         = res.servers || [];
        pendingRequests = res.friendRequests || [];
        myStatus        = res.user.status || 'online';
        onlineFriends   = new Set(res.onlineFriendIds || []);

        authOverlay.style.display = 'none';
        appContainer.style.display = 'flex';
        myAvatarImg.src = currentUser.profilePic;
        updateMyStatusDot();
        updateNotifBadge();
        initWebRTC();
        renderServerList();
        renderSidebar();
        setTimeout(attachTooltips, 100);
        initLucide();

        if (!silent) {
            // Davet linki bekliyor mu?
            const inv = window._pendingInvite;
            if (inv) {
                delete window._pendingInvite;
                if (confirm(`Sunucuya katılmak isteniyor.\nID: ${inv}\nDevam et?`)) {
                    socket.emit('join-server', inv, r => {
                        if (r.success) { servers.push(r.server); renderServerList(); activateServer(r.server); }
                        else showToast(r.message, 'error');
                    });
                }
            }
        }
    }

    // Sayfa yüklenince otomatik giriş fonksiyonu kaldırıldı (güvenlik için)
    function tryAutoLogin() {}

=======
>>>>>>> parent of 87eae11 (v8)
    loginBtn.addEventListener('click', () => handleAuth('login'));
    registerBtn.addEventListener('click', () => handleAuth('register'));
    authPasswordInput.addEventListener('keypress', e => { if (e.key === 'Enter') handleAuth('login'); });
    authUsernameInput.addEventListener('keypress', e => { if (e.key === 'Enter') authPasswordInput.focus(); });

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

    // ============================================================
    // SERVER LIST
    // ============================================================
    function renderServerList() {
        dynamicServerList.innerHTML = '';
        servers.forEach(s => {
            const el = document.createElement('div');
            el.className = `server-icon tooltip ${currentContext === s.id ? 'active' : ''}`;
            el.setAttribute('data-tooltip', s.name);
            el.textContent = s.name.substring(0, 2).toUpperCase();
            el.addEventListener('click', () => {
                activateServer(s);
                document.querySelectorAll('.server-icon').forEach(i => i.classList.remove('active'));
                document.getElementById('nav-friends').classList.remove('active');
                el.classList.add('active');
            });
            dynamicServerList.appendChild(el);
        });
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
            sidebarContextTitle.textContent = 'FRIENDS';
            btnAddFriend.style.display = '';
            btnInviteServer.style.display = 'none';

            if (friends.length === 0) {
                const li = document.createElement('li');
                li.style.cssText = 'color:var(--text-secondary);font-size:13px;padding:20px 14px;opacity:0.6;pointer-events:none;';
                li.textContent = 'Henüz arkadaşın yok. Ekle!';
                dynamicChannelList.appendChild(li);
            }

            friends.forEach(f => {
                const li = document.createElement('li');
<<<<<<< HEAD
                li.className = `ch-item ${currentDmFriend?.id === f.id ? 'active' : ''}`;
                li.innerHTML = `
                    <div style="position:relative;flex-shrink:0;">
                        <img src="${f.profilePic||`https://api.dicebear.com/7.x/avataaars/svg?seed=${esc(f.username)}`}"
                             style="width:30px;height:30px;border-radius:50%;object-fit:cover;display:block;">
                        <span class="status-dot-sm friend-status-dot" data-uid="${f.id}"
                              style="position:absolute;bottom:-1px;right:-1px;background:${STATUS_COLOR[isOn?'online':'offline']};
                                     box-shadow:0 0 5px ${STATUS_COLOR[isOn?'online':'offline']};"></span>
                    </div>
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(f.username)}</div>
                        <div style="font-size:11px;color:${STATUS_COLOR[isOn?'online':'offline']};">${STATUS_LABEL[isOn?'online':'offline']}</div>
                    </div>
                    <span class="dm-notif-dot friend-dm-dot" data-uid="${f.id}" style="display:${notifCnt>0?'flex':'none'};">${notifCnt>9?'9+':notifCnt||''}</span>`;
                li.addEventListener('click', () => { openDM(f); clearDmNotif(f.id); });
=======
                li.className = currentChannelId === `dm_${f.id}` ? 'active' : '';
                li.innerHTML = `<img src="${f.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${f.username}`}"
                    style="width:28px;height:28px;border-radius:8px;object-fit:cover;flex-shrink:0;">
                    <span>${escapeHtml(f.username)}</span>`;
                li.addEventListener('click', () => openDM(f));
>>>>>>> parent of b21c083 (V7)
                dynamicChannelList.appendChild(li);
            });

        } else {
            const server = servers.find(s => s.id === currentContext);
            if (!server) return;
            sidebarContextTitle.textContent = server.name.toUpperCase();
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
        }
        initLucide();
    }

<<<<<<< HEAD
    // ── ARKADAŞ PROFİL GÖRÜNÜMÜ (SAĞ PANEL) ──────────────────────────
    function renderFriendProfile(friend) {
        const isOn = onlineFriends.has(friend.id);
        const commonSrvs = servers.filter(s => s.members && s.members.some(m => m.id === friend.id));
        
        const psContent = document.getElementById('ps-content');
        psContent.innerHTML = `
            <div class="ps-avatar-section">
                <div class="ps-avatar-wrap">
                    <img src="${friend.profilePic||`https://api.dicebear.com/7.x/avataaars/svg?seed=${esc(friend.username)}`}" class="ps-avatar-img" alt="">
                    <span class="ps-status-dot" style="background:${STATUS_COLOR[friend.status||(isOn?'online':'offline')]};"></span>
                </div>
                <h2 class="ps-user-name">${esc(friend.username)}</h2>
                <p class="ps-user-status" style="color:${STATUS_COLOR[friend.status||(isOn?'online':'offline')]};">
                    ${STATUS_LABEL[friend.status||(isOn?'online':'offline')]}
                </p>
            </div>

            <div class="ps-actions-grid">
                <button class="ps-btn" id="ps-call-btn" title="Sesli Ara">
                    <i data-lucide="phone" style="width:16px;height:16px;"></i>
                </button>
                <button class="ps-btn" id="ps-copy-btn" title="Kullanıcı Adını Kopyala">
                    <i data-lucide="copy" style="width:16px;height:16px;"></i>
                </button>
                <button class="ps-btn danger" id="ps-remove-btn" title="Arkadaşlıktan Çıkar">
                    <i data-lucide="user-x" style="width:16px;height:16px;"></i>
                </button>
            </div>

            <div class="ps-section">
                <h4>ORTAK SUNUCULAR</h4>
                <div class="common-servers-list">
                    ${commonSrvs.length ? commonSrvs.map(s => `
                        <div class="common-server-item">
                            <span class="cs-icon">${s.name[0].toUpperCase()}</span>
                            <span>${esc(s.name)}</span>
                        </div>
                    `).join('') : '<p class="no-common">Ortak sunucu yok</p>'}
                </div>
            </div>`;

        welcomeMessage.style.display = 'none';
        voiceGrid.style.display = 'none';
        friendProfileView.style.display = 'flex';
        initLucide(); attachTooltips();

        document.getElementById('fpv-msg-btn').addEventListener('click', () => openDM(friend));
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
                    welcomeMessage.style.display = 'flex';
                    chatMessages.innerHTML = ''; chatInput.disabled = true;
                    renderSidebar();
                    showToast(`${friend.username} arkadaş listenden çıkarıldı`);
                }
            });
        });

        // DM chat'i hazırla (sağ panelde)
        openDMChat(friend);
=======
    function switchMainView(type, data) {
        if (type === 'server') {
            mainHeaderTitle.textContent = data.name;
            mainHeaderIcon.setAttribute('data-lucide', 'server');
        } else {
            mainHeaderTitle.textContent = 'Arkadaşlar';
            mainHeaderIcon.setAttribute('data-lucide', 'users');
        }
        initLucide();
>>>>>>> parent of b21c083 (V7)
    }

    // ============================================================
    // DM
    // ============================================================
    function openDM(friend) {
        currentChannelId   = `dm_${friend.id}`;
        currentServerId    = null;
        currentChannelType = 'dm';
        renderSidebar();
        mainHeaderTitle.textContent = friend.username;
        mainHeaderIcon.setAttribute('data-lucide', 'message-circle');
        chatPanelTitle.textContent  = friend.username;
        chatInput.disabled          = false;
        chatInput.placeholder       = `${friend.username} ile mesajlaş...`;
        chatMessages.innerHTML      = '';
        welcomeMessage.style.display = 'none';
        voiceGrid.style.display      = 'none';

        socket.emit('get-dms', friend.id, (res) => {
            if (res.success) {
                res.messages.forEach(m => appendMessage(m.sender, m.text, m.senderId === currentUser.id, m.profilePic, m.timestamp));
            }
        });
        initLucide();
    }

    // ============================================================
    // WebRTC
    // ============================================================
    function initWebRTC() {
<<<<<<< HEAD
<<<<<<< HEAD
        myPeer = new Peer(undefined, { host:'0.peerjs.com', port:443, secure:true,
            config: { iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]}
        });
        myPeer.on('open', id => console.log('PeerJS ID:', id));
        myPeer.on('error', e => { console.error('PeerJS:', e); showToast('Bağlantı hatası: ' + e.type, 'error'); });
        navigator.mediaDevices.getUserMedia({ audio: { echoCancellation:true, noiseSuppression:true, sampleRate:48000 }, video:false })
            .then(async stream => {
=======
        myPeer = new Peer(undefined, { host:'0.peerjs.com', port:443, secure:true });
        myPeer.on('open', id => console.log('PeerJS:', id));
        myPeer.on('error', e => console.error('PeerJS:', e));
        navigator.mediaDevices.getUserMedia({ audio:true, video:false })
=======
        myPeer = new Peer(undefined, { host: '0.peerjs.com', port: 443, secure: true });
        myPeer.on('open', id => console.log('PeerJS hazır:', id));
        myPeer.on('error', err => console.error('PeerJS hatası:', err));

        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
>>>>>>> parent of b21c083 (V7)
            .then(stream => {
>>>>>>> parent of 87eae11 (v8)
                localStream = stream;
                myPeer.on('call', call => {
                    call.answer(isScreenSharing && screenStream ? screenStream : localStream);
                    call.on('stream', userStream => handleRemoteStream(call.peer, userStream));
                    peers[call.peer] = call;
                });
<<<<<<< HEAD
                await loadAudioDevices();
                // Varsayılan mikrofonu seç
                if (audioDevices.length > 0) {
                    const def = audioDevices[0].deviceId;
                    // Eğer varsayılan değilse tekrar iste (bazı tarayıcılarda gerekebilir)
                    if (def !== 'default') {
                        const ns = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: { exact: def } } });
                        localStream.getTracks().forEach(t => t.stop());
                        localStream = ns;
                    }
                }
            }).catch(e => console.warn('Mikrofon:', e));
=======
                // Mikrofon cihazlarını listele
                loadAudioDevices();
            })
            .catch(err => console.warn('Mikrofon erişimi reddedildi:', err));
>>>>>>> parent of b21c083 (V7)
    }

    async function loadAudioDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            audioDevices = devices.filter(d => d.kind === 'audioinput');
        } catch(e) {}
    }

    // ============================================================
    // JOIN CHANNEL
    // ============================================================
    function joinChannel(serverId, channel) {
        if (channel.type === 'text') {
<<<<<<< HEAD
            if (currentChannelType === 'voice') leaveVoice(false);
            currentChannelId = channel.id; currentServerId = serverId; currentChannelType = 'text';
            currentDmFriend  = null;
=======
            if (voiceGrid.style.display === 'grid') leaveVoice(false);
            currentChannelId   = channel.id;
            currentServerId    = serverId;
            currentChannelType = 'text';
>>>>>>> parent of b21c083 (V7)
            renderSidebar();
            chatInput.disabled     = false;
            chatInput.placeholder  = `#${channel.name} kanalına mesaj gönder...`;
            chatPanelTitle.textContent = `#${channel.name}`;
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
        if (!myPeer?.id) { showToast('PeerJS henüz hazır değil...', 'error'); return; }
        currentChannelId = channel.id; currentServerId = serverId; currentChannelType = 'voice';
        currentDmFriend  = null;
        renderSidebar();
        welcomeMessage.style.display  = 'none';
        voiceGrid.style.display       = 'grid';
        voiceGrid.innerHTML           = '';
        voiceControls.style.display   = 'flex';
        document.getElementById('active-voice-channel').textContent = channel.name;
        addVoiceCard(myPeer.id, currentUser.username, true);
=======
        // ---- SES KANALI ----
        if (!myPeer || !myPeer.id) {
            showToast('PeerJS henüz hazır değil, bir saniye bekle...', 'error');
            return;
        }
>>>>>>> parent of b21c083 (V7)

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
<<<<<<< HEAD
            (res.existingPeers || []).forEach(ep => {
                addVoiceCard(ep.peerId, ep.username, false);
                updateVoiceStatusUI(ep.peerId, ep.isMuted, ep.isDeafened);
                
                const st = isScreenSharing && screenStream ? screenStream : localStream;
                if (st) {
                    const call = myPeer.call(ep.peerId, st);
                    if (call) { 
                        call.on('stream', us => {
                            handleRemoteStream(ep.peerId, us);
                            startSpeakingDetection(us, ep.peerId);
                        }); 
                        peers[ep.peerId] = call; 
                    }
                }
            });
            if (localStream) startSpeakingDetection(localStream, myPeer.id);
=======
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
>>>>>>> parent of b21c083 (V7)
        });
    }

    // Yeni kullanıcı bağlandı (birinci kullanıcı bu eventi alır)
    socket.on('user-connected', (peerId, username) => {
        if (currentChannelType !== 'voice') return;
<<<<<<< HEAD
        const st = isScreenSharing && screenStream ? screenStream : localStream;
        if (st) {
            const call = myPeer.call(peerId, st);
            if (call) { 
                call.on('stream', us => {
                    handleRemoteStream(peerId, us);
                    startSpeakingDetection(us, peerId);
                }); 
                peers[peerId] = call; 
=======
        const streamToSend = isScreenSharing && screenStream ? screenStream : localStream;
        if (streamToSend) {
            const call = myPeer.call(peerId, streamToSend);
            if (call) {
                call.on('stream', userStream => handleRemoteStream(peerId, userStream));
                peers[peerId] = call;
>>>>>>> parent of b21c083 (V7)
            }
        }
        addVoiceCard(peerId, username, null, false);
    });
<<<<<<< HEAD
    socket.on('voice-state-changed', d => {
        // d: { peerId, isMuted, isDeafened }
        updateVoiceStatusUI(d.peerId, d.isMuted, d.isDeafened);
=======

    socket.on('user-disconnected', peerId => {
        if (peers[peerId]) { peers[peerId].close(); delete peers[peerId]; }
        document.querySelector(`[data-peer-id="${peerId}"]`)?.remove();
        if (voiceGrid.style.display === 'grid' && voiceGrid.querySelectorAll('.voice-card').length === 0) {
            leaveVoice(false);
        }
>>>>>>> parent of b21c083 (V7)
    });

    function updateVoiceStatusUI(peerId, isMuted, isDeafened) {
        const wrap = document.getElementById(`v-status-${peerId}`);
        if (!wrap) return;
        wrap.innerHTML = '';
        if (isMuted) wrap.innerHTML += `<div class="v-icon" title="Mikrofon Kapalı"><i data-lucide="mic-off" style="width:11px;height:11px;"></i></div>`;
        if (isDeafened) wrap.innerHTML += `<div class="v-icon" title="Ses Kapalı"><i data-lucide="volume-x" style="width:11px;height:11px;"></i></div>`;
        initLucide();
    }

    function handleRemoteStream(peerId, stream) {
        const card = document.querySelector(`[data-peer-id="${peerId}"]`);
        if (!card) return;
        const audio = card.querySelector('audio');
        if (audio) audio.srcObject = stream;
        const video = card.querySelector('video');
        if (video && stream.getVideoTracks().length > 0) {
            video.srcObject = stream;
            video.style.display = 'block';
            card.querySelector('.avatar-ring').classList.add('has-video');
        } else if (video) {
            video.style.display = 'none';
            card.querySelector('.avatar-ring').classList.remove('has-video');
        }
    }

    function addVoiceCard(peerId, username, stream, isSelf) {
        if (document.querySelector(`[data-peer-id="${peerId}"]`)) return; // Duplicate önle
        const template = document.getElementById('user-card-template');
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector('.voice-card');
        card.setAttribute('data-peer-id', peerId);
        card.querySelector('.user-label').textContent = username + (isSelf ? ' (Sen)' : '');
        card.querySelector('.avatar-circle').style.backgroundImage =
            `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}')`;
        if (isSelf) card.querySelector('audio').muted = true;
        voiceGrid.appendChild(card);
        initLucide();
    }

    function leaveVoice(notify = true) {
        if (notify && currentChannelId && currentChannelType === 'voice') {
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

    // ============================================================
    // CHAT MESSAGES
    // ============================================================
    function appendMessage(sender, text, isSelf, profilePic, timestamp) {
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
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function sendMessage() {
        const val = chatInput.value.trim();
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
        }
        appendMessage(currentUser.username, val, true, currentUser.profilePic, new Date().toISOString());
        chatInput.value = '';
    }

    chatInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });
    sendMsgBtn.addEventListener('click', sendMessage);

    // Gelen kanal mesajı
    socket.on('chat-message', d => {
        if (d.channelId === currentChannelId) {
            appendMessage(d.sender, d.text, false, d.profilePic, d.timestamp);
        }
    });

    // Gelen DM
    socket.on('dm-message', d => {
        if (currentChannelId === `dm_${d.friendId}`) {
            appendMessage(d.message.sender, d.message.text, false, d.message.profilePic, d.message.timestamp);
        }
    });

    // ============================================================
    // VOICE CONTROLS
    // ============================================================
    micBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        if (localStream) localStream.getAudioTracks().forEach(t => t.enabled = !isMuted);
        micBtn.classList.toggle('leave-btn', isMuted);
        micBtn.innerHTML = `<i data-lucide="${isMuted ? 'mic-off' : 'mic'}"></i>`;
        initLucide();
    });

    deafenBtn.addEventListener('click', () => {
        isDeafened = !isDeafened;
        document.querySelectorAll('.voice-card audio').forEach(a => {
            const card = a.closest('.voice-card');
            if (card && card.getAttribute('data-peer-id') !== myPeer?.id) a.muted = isDeafened;
        });
        deafenBtn.classList.toggle('leave-btn', isDeafened);
        deafenBtn.innerHTML = `<i data-lucide="${isDeafened ? 'volume-x' : 'headphones'}"></i>`;
        initLucide();
        showToast(isDeafened ? 'Sesi kapattın' : 'Ses açıldı');
    });

    screenShareBtn.addEventListener('click', async () => {
        try {
            if (!isScreenSharing) {
                screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                isScreenSharing = true;
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
            } else {
                stopScreenShare();
            }
        } catch (err) {
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

    function updateStreams(stream) {
        Object.values(peers).forEach(call => {
            if (!call.peerConnection) return;
            const videoTrack = stream.getVideoTracks()[0];
            const sender = call.peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
            if (sender && videoTrack) sender.replaceTrack(videoTrack).catch(console.warn);
            else if (videoTrack) call.peerConnection.addTrack(videoTrack, stream);
        });
    }

    disconnectBtn.addEventListener('click', () => leaveVoice(true));

    // ============================================================
    // FRIENDS & NOTIFICATIONS
    // ============================================================
    socket.on('receive-friend-request', (request) => {
        pendingRequests.push(request);
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
<<<<<<< HEAD
        }));
        notifList.querySelectorAll('.reject-btn').forEach(btn => btn.addEventListener('click', () => {
            const n = pendingRequests.find(r=>r.fromId===btn.dataset.id)?.fromUsername;
            pendingRequests = pendingRequests.filter(r => r.fromId !== btn.dataset.id);
            updateNotifBadge(); renderNotifList();
            if (n) showToast(`${n} isteği reddedildi`);
        }));
<<<<<<< HEAD
    }

    socket.on('friend-request-rejected', d => {
        showToast(`${d.byUsername} arkadaşlık isteğini reddetti`, 'error');
    });

    // ── DURUM TAKİBİ (REAL-TIME) ──────────────────────────────────────
    socket.on('friend-online', d => {
        onlineFriends.add(d.userId);
        renderSidebar();
        refreshMembersPanel();
    });

    socket.on('friend-offline', d => {
        onlineFriends.delete(d.userId);
        renderSidebar();
        refreshMembersPanel();
    });

    socket.on('status-update', d => {
        if (d.userId === currentUser.id) return;
        if (d.status === 'offline') onlineFriends.delete(d.userId);
        else onlineFriends.add(d.userId);
        renderSidebar();
        if (currentDmFriend?.id === d.userId) renderFriendProfile(currentDmFriend);
        refreshMembersPanel();
    });

    socket.on('username-changed', d => {
        if (currentUser && d.userId === currentUser.id) currentUser.username = d.newUsername;
        const f = friends.find(u => u.id === d.userId);
        if (f) f.username = d.newUsername;
        
        if (currentDmFriend && currentDmFriend.id === d.userId) {
            currentDmFriend.username = d.newUsername;
            renderFriendProfile(currentDmFriend);
        }
        refreshMembersPanel();
    });

    socket.on('voice-channel-update', d => {
        const el = document.querySelector(`[data-channel-id="${d.channelId}"] .channel-name`);
        if (el) {
            const baseName = el.textContent.split(' (')[0];
            el.textContent = d.count > 0 ? `${baseName} (${d.count})` : baseName;
        }
    });

    function startSpeakingDetection(stream, peerId) {
        if (!window.AudioContext && !window.webkitAudioContext) return;
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            const data = new Uint8Array(analyser.frequencyBinCount);
            
            const check = () => {
                if (!document.querySelector(`[data-peer-id="${peerId}"]`)) {
                    audioContext.close(); return;
                }
                analyser.getByteFrequencyData(data);
                const avg = data.reduce((a,b) => a+b, 0) / data.length;
                const card = document.querySelector(`[data-peer-id="${peerId}"]`);
                if (card) card.classList.toggle('is-speaking', avg > 15);
                requestAnimationFrame(check);
            };
            check();
        } catch(e) { console.warn('Speaking detection error:', e); }
=======
>>>>>>> parent of 87eae11 (v8)
=======
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
>>>>>>> parent of b21c083 (V7)
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
            }
        });
    });

    document.getElementById('confirm-add-friend').addEventListener('click', () => {
        const name = document.getElementById('new-friend-username').value.trim();
        const msgEl = document.getElementById('add-friend-message');
        if (!name) return;
        socket.emit('send-friend-request', name, (res) => {
            msgEl.style.color = res.success ? 'var(--accent-green)' : 'var(--accent-red)';
            msgEl.textContent = res.message;
            if (res.success) {
                document.getElementById('new-friend-username').value = '';
                showToast(res.message);
            }
        });
    });

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

    // ============================================================
    // SETTINGS MODAL
    // ============================================================
    document.getElementById('open-settings-btn').addEventListener('click', openSettings);
    document.getElementById('my-avatar').addEventListener('click', openSettings);

    function openSettings() {
        if (!currentUser) return;
        // Kullanıcı bilgilerini doldur
        document.getElementById('settings-username').textContent = currentUser.username;
        document.getElementById('settings-avatar').src = currentUser.profilePic;

        // Mikrofon cihazlarını doldur
        const micSelect = document.getElementById('settings-mic-select');
        micSelect.innerHTML = '';
        if (audioDevices.length === 0) {
            micSelect.innerHTML = '<option>Cihaz bulunamadı</option>';
        } else {
            audioDevices.forEach((d, i) => {
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
        initLucide();
    }

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
    });

    // Tema toggle
    document.getElementById('settings-theme-toggle').addEventListener('click', () => {
        document.body.classList.toggle('theme-light');
        const isLight = document.body.classList.contains('theme-light');
        document.getElementById('settings-theme-toggle').textContent = isLight ? '🌙 Koyu Mod' : '☀️ Açık Mod';
        showToast(isLight ? 'Açık mod aktif' : 'Koyu mod aktif');
    });

<<<<<<< HEAD
<<<<<<< HEAD
    // ── TEMA ─────────────────────────────────────────────────────────
    let isLightTheme = false;

    // Oturumu yüklemeden önce temayı çek
    try {
        const savedTheme = localStorage.getItem('nexus_theme');
        if (savedTheme === 'light') toggleTheme(true);
    } catch(e) {}

    function toggleTheme(forceLight) {
        isLightTheme = forceLight !== undefined ? forceLight : !isLightTheme;
        localStorage.setItem('nexus_theme', isLightTheme ? 'light' : 'dark');
        
        if (isLightTheme) {
            document.documentElement.style.setProperty('--bg-dark',       '#f1f5f9');
            document.documentElement.style.setProperty('--bg-sidebar',    '#ffffff');
            document.documentElement.style.setProperty('--glass-panel',   'rgba(255,255,255,0.7)');
            document.documentElement.style.setProperty('--glass-bg',      'rgba(255,255,255,0.9)');
            document.documentElement.style.setProperty('--glass-border',  'rgba(0,0,0,0.08)');
            document.documentElement.style.setProperty('--text-primary',  '#0f172a');
            document.documentElement.style.setProperty('--text-secondary','#475569');
            document.documentElement.style.setProperty('--text-muted',    '#94a3b8');
            document.body.style.background = '#f1f5f9';
            document.getElementById('as-theme-toggle').textContent = '🌙 Koyu Moda Geç';
        } else {
            document.documentElement.style.setProperty('--bg-dark',       '#050208');
            document.documentElement.style.setProperty('--bg-sidebar',    '#0a0712');
            document.documentElement.style.setProperty('--glass-panel',   'rgba(25,20,40,0.65)');
            document.documentElement.style.setProperty('--glass-bg',      'rgba(18,12,28,0.85)');
            document.documentElement.style.setProperty('--glass-border',  'rgba(255,255,255,0.12)');
            document.documentElement.style.setProperty('--text-primary',  '#f8fafc');
            document.documentElement.style.setProperty('--text-secondary','#94a3b8');
            document.documentElement.style.setProperty('--text-muted',    '#64748b');
            document.body.style.background = '#050208';
            document.getElementById('as-theme-toggle').textContent = '☀️ Açık Moda Geç';
        }
    }

    document.getElementById('as-theme-toggle').addEventListener('click', () => {
        toggleTheme();
        showToast(isLightTheme ? 'Açık tema aktif' : 'Koyu tema aktif');
=======
    // Tema
    document.getElementById('as-theme-toggle').addEventListener('click', () => {
        const light = document.body.classList.toggle('theme-light');
        document.getElementById('as-theme-toggle').textContent = light ? '🌙 Koyu Moda Geç' : '☀️ Açık Moda Geç';
        showToast(light ? 'Açık tema' : 'Koyu tema');
>>>>>>> parent of 87eae11 (v8)
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
>>>>>>> parent of b21c083 (V7)
    });

    // URL davet parametresi
    const urlParams = new URLSearchParams(window.location.search);
    const inviteId  = urlParams.get('invite');
    if (inviteId) window._pendingInvite = inviteId;
});
