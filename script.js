document.addEventListener('DOMContentLoaded', () => {
    // ── DOM ──────────────────────────────────────────────────────────
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
    const regUsernameInput   = document.getElementById('reg-username');
    const regPasswordInput   = document.getElementById('reg-password');
    const regError           = document.getElementById('reg-error');
    const appContainer       = document.getElementById('app-container');
    const mainHeaderTitle    = document.getElementById('main-header-title');
    const mainHeaderIcon     = document.getElementById('main-header-icon');
    const sidebarCtxTitle    = document.getElementById('sidebar-context-title');
    const dynamicServerList  = document.getElementById('dynamic-server-list');
    const dynamicChannelList = document.getElementById('dynamic-channel-list');
    const chatMessages       = document.getElementById('chat-messages');
    const chatInput          = document.getElementById('chat-input');
    const sendMsgBtn         = document.getElementById('send-msg-btn');
    const rightPanelTitle    = document.getElementById('right-panel-title');
    const micBtn             = document.getElementById('mic-btn');
    const deafenBtn          = document.getElementById('deafen-btn');
    const screenShareBtn     = document.getElementById('screen-share-btn');
    const disconnectBtn      = document.getElementById('disconnect-btn');
    const voiceControls      = document.getElementById('voice-controls');
    const voiceGrid          = document.getElementById('voice-grid');
    const welcomeMessage     = document.getElementById('welcome-message');
    const friendProfileView  = document.getElementById('friend-profile-view');
    const notifBtn           = document.getElementById('nav-notifications');
    const notifBadge         = document.getElementById('notif-badge');
    const notifPanel         = document.getElementById('notif-panel');
    const notifList          = document.getElementById('notif-list');
    const dmBadge            = document.getElementById('dm-badge');
    const navFriends         = document.getElementById('nav-friends');
    const btnAddFriend       = document.getElementById('btn-add-friend');
    const btnInviteServer    = document.getElementById('btn-invite-server');
    const membersPanel       = document.getElementById('members-panel');
    const membersList        = document.getElementById('members-list');
    const toggleMembersBtn   = document.getElementById('toggle-members-btn');
    const profilePanel       = document.getElementById('profile-panel');
    const appSettingsModal   = document.getElementById('app-settings-modal');
    const myAvatarEl         = document.getElementById('my-avatar');
    const myAvatarImg        = document.querySelector('#my-avatar img');
    const myStatusDot        = document.getElementById('my-status-dot');

    // ── SOCKET ───────────────────────────────────────────────────────
    let socket = io(window.location.origin, {
        transports: ['websocket', 'polling'],
        reconnection: true, reconnectionDelay: 1000, reconnectionAttempts: 10,
    });

    // ── STATE ────────────────────────────────────────────────────────
    let currentUser       = null;
    let friends           = [];
    let servers           = [];
    let pendingRequests   = [];
    let onlineFriends     = new Set();       // Set<userId>
    let dmNotifications   = new Map();       // Map<friendId, count>
    let currentContext    = 'friends';
    let currentChannelId  = null;
    let currentServerId   = null;
    let currentChannelType = null;           // 'text' | 'voice' | 'dm'
    let currentDmFriend   = null;
    let membersOpen       = true;
    let myStatus          = 'online';
    let myPeer            = null;
    let peers             = {};
    let localStream       = null;
    let screenStream      = null;
    let isMuted           = false;
    let isDeafened        = false;
    let isScreenSharing   = false;
    let audioDevices      = [];
    let audioOutputs      = [];

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
    }
    function timeStr(ts) {
        if (!ts) return '';
        const d = new Date(ts), now = new Date();
        if (d.toDateString() === now.toDateString())
            return d.toLocaleTimeString('tr-TR', {hour:'2-digit', minute:'2-digit'});
        return d.toLocaleDateString('tr-TR',{day:'numeric',month:'short'}) + ' ' +
               d.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'});
    }
    function initLucide() { if (window.lucide) lucide.createIcons(); }

    // ── TOAST ────────────────────────────────────────────────────────
    const toastEl = document.getElementById('toast');
    function showToast(msg, type = 'success') {
        toastEl.textContent = msg;
        toastEl.className = `toast toast-${type} show`;
        clearTimeout(toastEl._t);
        toastEl._t = setTimeout(() => toastEl.classList.remove('show'), 3000);
    }

    // ── JS TOOLTIP (backdrop-filter z-index sorununu çözer) ──────────
    const globalTip = document.createElement('div');
    globalTip.id = 'global-tooltip';
    document.body.appendChild(globalTip);

    function attachTooltips() {
        document.querySelectorAll('[data-tooltip]').forEach(el => {
            if (el._tipBound) return;
            el._tipBound = true;
            el.addEventListener('mouseenter', () => {
                const txt = el.getAttribute('data-tooltip');
                if (!txt) return;
                globalTip.textContent = txt;
                const r = el.getBoundingClientRect();
                globalTip.style.top  = (r.top + r.height / 2) + 'px';
                globalTip.style.left = (r.right + 10) + 'px';
                globalTip.classList.add('visible');
            });
            el.addEventListener('mouseleave', () => globalTip.classList.remove('visible'));
        });
    }

    // ── AUTH ─────────────────────────────────────────────────────────
    let avatarSeed = 'Nexus';
    document.getElementById('refresh-avatar-btn').addEventListener('click', () => {
        avatarSeed = Math.random().toString(36).substring(2, 10);
        document.querySelector('#auth-avatar-preview img').src =
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
    });

    function handleAuth(type) {
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
            if (res.success) {
                if (type === 'login') {
                    currentUser   = res.user;
                    friends       = res.friends || [];
                    servers       = res.servers || [];
                    pendingRequests = res.friendRequests || [];
                    myStatus      = res.user.status || 'online';
                    onlineFriends = new Set(res.onlineFriendIds || []);

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
                } else {
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
                errorEl.style.color = 'var(--accent-red)';
                errorEl.textContent = res.message;
            }
        });
    }

    loginBtn.addEventListener('click', () => handleAuth('login'));
    registerBtn.addEventListener('click', () => handleAuth('register'));
    authPasswordInput.addEventListener('keypress', e => { if (e.key==='Enter') handleAuth('login'); });
    authUsernameInput.addEventListener('keypress', e => { if (e.key==='Enter') authPasswordInput.focus(); });
    regPasswordInput.addEventListener('keypress', e => { if (e.key==='Enter') handleAuth('register'); });
    regUsernameInput.addEventListener('keypress', e => { if (e.key==='Enter') regPasswordInput.focus(); });

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

    // ── DURUM NOKTALARI ──────────────────────────────────────────────
    const STATUS_COLOR = { online:'var(--accent-green)', dnd:'var(--accent-red)', invisible:'#607d8b', offline:'#607d8b' };
    const STATUS_LABEL = { online:'Çevrimiçi', dnd:'Rahatsız Etmeyin', invisible:'Görünmez', offline:'Çevrimdışı' };

    function updateMyStatusDot() {
        if (!myStatusDot) return;
        myStatusDot.style.background = STATUS_COLOR[myStatus] || STATUS_COLOR.online;
        myStatusDot.style.boxShadow = `0 0 6px ${STATUS_COLOR[myStatus]}`;
    }

    function statusDotHTML(uid, isOnline) {
        const st = isOnline ? 'online' : 'offline';
        return `<span class="status-dot-sm" style="background:${STATUS_COLOR[st]};box-shadow:0 0 5px ${STATUS_COLOR[st]};"></span>`;
    }

    // ── SOCKEt: ARKADAŞ DURUMU ────────────────────────────────────────
    socket.on('friend-online',  d => { onlineFriends.add(d.userId);    refreshFriendStatus(d.userId); });
    socket.on('friend-offline', d => { onlineFriends.delete(d.userId); refreshFriendStatus(d.userId); });
    socket.on('friend-status',  d => { refreshFriendStatus(d.userId); });

    function refreshFriendStatus(uid) {
        // Sidebar'daki ilgili satırı güncelle
        const dot = document.querySelector(`.friend-status-dot[data-uid="${uid}"]`);
        const isOn = onlineFriends.has(uid);
        if (dot) {
            dot.style.background = STATUS_COLOR[isOn ? 'online' : 'offline'];
            dot.style.boxShadow  = `0 0 5px ${STATUS_COLOR[isOn ? 'online' : 'offline']}`;
        }
        // Friend profile view açıksa güncelle
        if (currentDmFriend?.id === uid) showFriendProfile(friends.find(f=>f.id===uid) || currentDmFriend);
        // Üye listesi açıksa güncelle
        if (currentServerId) refreshMembersPanel();
    }

    // ── DM BİLDİRİM ──────────────────────────────────────────────────
    socket.on('dm-notification', d => {
        if (currentChannelType === 'dm' && currentDmFriend?.id === d.fromId) return; // Aktif chat, sayma
        const cur = dmNotifications.get(d.fromId) || 0;
        dmNotifications.set(d.fromId, cur + 1);
        updateDmBadge();
        updateFriendDmDot(d.fromId);
    });

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
        
        const rsPanel = document.getElementById('right-side-panel');
        if (rsPanel) rsPanel.style.display = 'none';
        
        membersPanel.style.display = 'none';
        document.querySelectorAll('.server-icon, .rail-btn').forEach(el => el.classList.remove('active'));
        navFriends.classList.add('active');
        mainHeaderTitle.textContent = 'Arkadaşlar';
        mainHeaderIcon.setAttribute('data-lucide', 'users');
        toggleMembersBtn.style.display = 'none';
        renderSidebar(); initLucide();
    });

    // ── SUNUCULAR ────────────────────────────────────────────────────
    function renderServerList() {
        dynamicServerList.innerHTML = '';
        servers.forEach(s => {
            const el = document.createElement('div');
            el.className = `server-icon ${currentContext === s.id ? 'active' : ''}`;
            el.setAttribute('data-tooltip', s.name);
            el.textContent = s.name.substring(0, 2).toUpperCase();
            el.addEventListener('click', () => {
                document.querySelectorAll('.server-icon,.rail-btn').forEach(i => i.classList.remove('active'));
                navFriends.classList.remove('active');
                el.classList.add('active');
                activateServer(s);
            });
            dynamicServerList.appendChild(el);
        });
        attachTooltips(); initLucide();
    }

    function activateServer(s) {
        currentContext = s.id; currentServerId = s.id;
        currentChannelType = null;
        
        // Taşıma mantığı: Chat'i sağ panele taşı
        const chatArea = document.getElementById('center-chat-area');
        const rsPanel = document.getElementById('right-side-panel');
        rsPanel.appendChild(chatArea);
        
        chatMessages.innerHTML = ''; chatInput.disabled = true;
        friendProfileView.style.display = 'none';
        document.getElementById('center-chat-area').style.display = 'flex';
        
        if (rightPanelTitle) rightPanelTitle.textContent = s.name + ' Sohbeti';
        welcomeMessage.style.display = 'flex';
        mainHeaderTitle.textContent = s ? s.name : 'Nexus';
        mainHeaderIcon.setAttribute('data-lucide', 'server');
        toggleMembersBtn.style.display = '';
        renderSidebar();

        if (membersOpen) {
            openMembersPanel(s.id);
            if (rsPanel) rsPanel.style.display = 'none';
        } else {
            if (rsPanel) rsPanel.style.display = 'flex';
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
        
        initLucide();
    }

    // ── SİDEBAR ──────────────────────────────────────────────────────
    function renderSidebar() {
        dynamicChannelList.innerHTML = '';
        if (currentContext === 'friends') {
            sidebarCtxTitle.textContent = 'ARKADAŞLAR';
            btnAddFriend.style.display = '';
            if (!friends.length) {
                const li = document.createElement('li');
                li.style.cssText = 'color:var(--text-secondary);font-size:12px;padding:20px 14px;opacity:.6;pointer-events:none;';
                li.textContent = 'Henüz arkadaşın yok.';
                dynamicChannelList.appendChild(li); return;
            }
            friends.forEach(f => {
                const isOn = onlineFriends.has(f.id);
                const notifCnt = dmNotifications.get(f.id) || 0;
                const li = document.createElement('li');
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
                li.addEventListener('click', () => { showFriendProfile(f); clearDmNotif(f.id); });
                dynamicChannelList.appendChild(li);
            });
        } else {
            const server = servers.find(s => s.id === currentContext);
            if (!server) return;
            sidebarCtxTitle.textContent = server.name.toUpperCase();
            btnAddFriend.style.display = 'none'; 
            const voiceChs = server.channels.filter(c => c.type === 'voice');

            // Ses Kanalları Header + Ekleme Butonu
            const hdr = document.createElement('li');
            hdr.className = 'ch-section-header'; 
            hdr.style.display = 'flex';
            hdr.style.justifyContent = 'space-between';
            hdr.style.alignItems = 'center';
            hdr.innerHTML = `<span>SES KANALLARI</span> <button id="add-voice-ch-btn" class="icon-btn-small" style="background:transparent; padding:2px;"><i data-lucide="plus" style="width:14px;height:14px;"></i></button>`;
            dynamicChannelList.appendChild(hdr);
            
            hdr.querySelector('#add-voice-ch-btn').addEventListener('click', () => {
                document.getElementById('create-voice-modal').style.display = 'flex';
                document.getElementById('new-voice-name').value = '';
                document.getElementById('new-voice-limit').value = '';
            });

            voiceChs.forEach(ch => {
                const li = document.createElement('li');
                li.className = `ch-item ${currentChannelId===ch.id?'active':''} ${currentChannelId===ch.id&&ch.type==='voice'?'voice-active':''}`;
                li.dataset.type = ch.type;
                li.innerHTML = `<i data-lucide="volume-2"></i><span style="flex:1;">${esc(ch.name)}</span> ${ch.limit ? `<span style="font-size:10px; color:var(--text-secondary);">` + (ch.users ? ch.users.length : 0) + `/` + ch.limit + `</span>` : ''}`;
                li.addEventListener('click', () => joinChannel(server.id, ch));
                dynamicChannelList.appendChild(li);
            });
        }
        initLucide();
    }

    // ── ARKADAŞ PROFİL GÖRÜNÜMÜ (MERKEZ) ─────────────────────────────
    function showFriendProfile(friend) {
        currentDmFriend = friend;
        renderSidebar(); // aktif satırı güncelle

        const isOn = onlineFriends.has(friend.id);
        
        // Taşıma mantığı: DMs'de Chat merkeze!
        const chatArea = document.getElementById('center-chat-area');
        document.querySelector('.view-container').appendChild(chatArea);

        // Modal / Panelleri düzenle
        welcomeMessage.style.display = 'none';
        voiceGrid.style.display = 'none';
        document.getElementById('center-chat-area').style.display = 'flex';
        
        const rsPanel = document.getElementById('right-side-panel');
        if (rsPanel) rsPanel.style.display = 'flex';
        friendProfileView.style.display = 'flex';

        // Yeni buton listesi
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
                    <button class="primary-btn fpv-action-btn" id="fpv-call-btn" style="justify-content:center; padding:10px; border-radius:8px;">
                        <i data-lucide="phone"></i> Arama Başlat
                    </button>
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

        document.getElementById('fpv-call-btn').addEventListener('click', () => {
            showToast('Arama özelliği yakında eklenecek!', 'info');
        });
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
        document.getElementById('fpv-mutual-servers-btn').addEventListener('click', () => showToast('Ortak sunucular yakında', 'info'));
        document.getElementById('fpv-mutual-friends-btn').addEventListener('click', () => showToast('Ortak arkadaşlar yakında', 'info'));

        // DM chat'i merkez alana yükle
        openDMChat(friend);
    }

    function openDM(friend) {
        openDMChat(friend);
        clearDmNotif(friend.id);
    }

    function openDMChat(friend) {
        currentChannelId   = `dm_${friend.id}`;
        currentServerId    = null;
        currentChannelType = 'dm';
        if (rightPanelTitle) rightPanelTitle.textContent = "Profil";
        mainHeaderTitle.textContent = friend.username;
        mainHeaderIcon.setAttribute('data-lucide', 'at-sign');
        initLucide();
        
        chatInput.disabled  = false;
        chatInput.placeholder = `${friend.username} ile mesajlaş...`;
        chatMessages.innerHTML = '';

        socket.emit('get-dms', friend.id, res => {
            if (res.success) res.messages.forEach(m =>
                appendMsg(m.sender, m.text, m.senderId===currentUser.id, m.profilePic, m.timestamp)
            );
        });
    }

    async function getMicStream() {
        const constraints = {
            audio: {
                deviceId: appSettings.micId !== 'default' ? { exact: appSettings.micId } : undefined,
                noiseSuppression: appSettings.noiseSup,
                echoCancellation: appSettings.echoCanc,
                autoGainControl: true
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
        myPeer = new Peer(undefined, { host:'0.peerjs.com', port:443, secure:true });
        myPeer.on('open', id => console.log('PeerJS:', id));
        myPeer.on('error', e => console.error('PeerJS:', e));
        getMicStream()
            .then(stream => {
                localStream = stream;
                myPeer.on('call', call => {
                    call.answer(isScreenSharing && screenStream ? screenStream : localStream);
                    call.on('stream', us => handleRemoteStream(call.peer, us));
                    peers[call.peer] = call;
                });
                loadAudioDevices();
            }).catch(e => {
                console.warn('Mikrofon:', e);
                // Eğer ayarlanan mikrofon yoksa varsayılana dön
                if(appSettings.micId !== 'default') {
                    appSettings.micId = 'default'; saveSettings();
                    initWebRTC(); // Tekrar dene
                }
            });
    }

    async function loadAudioDevices() {
        try {
            const devs = await navigator.mediaDevices.enumerateDevices();
            audioDevices = devs.filter(d => d.kind === 'audioinput');
            audioOutputs = devs.filter(d => d.kind === 'audiooutput');
        } catch(e) {}
    }

    // ── KANALA KATIL ─────────────────────────────────────────────────
    function joinChannel(serverId, channel) {
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
            
            welcomeMessage.style.display = 'none';
            chatMessages.innerHTML = '';

            socket.emit('get-channel-messages', channel.id, res => {
                if (res.success && res.messages.length) {
                    res.messages.forEach(m => appendMsg(m.sender, m.text, m.senderId===currentUser.id, m.profilePic, m.timestamp));
                } else {
                    chatMessages.innerHTML = `<div class="welcome-notif">
                        <i data-lucide="hash" style="width:40px;height:40px;color:var(--accent-purple);margin-bottom:12px;"></i>
                        <h3>#${esc(channel.name)}</h3>
                        <p>Bu kanalın başlangıcı. İlk mesajı sen gönder!</p>
                    </div>`;
                    initLucide();
                }
            });
            socket.emit('join-channel', { serverId, channelId: channel.id, peerId: null }, () => {});
            return;
        }

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

        socket.emit('join-channel', { serverId, channelId: channel.id, peerId: myPeer.id }, res => {
            if (!res) return;
            (res.existingPeers || []).forEach(ep => {
                addVoiceCard(ep.peerId, ep.username, false);
                const st = isScreenSharing && screenStream ? screenStream : localStream;
                if (st) {
                    const call = myPeer.call(ep.peerId, st);
                    if (call) { call.on('stream', us => handleRemoteStream(ep.peerId, us)); peers[ep.peerId] = call; }
                }
            });
        });
    }

    socket.on('user-connected', (peerId, username) => {
        if (currentChannelType !== 'voice') return;
        const st = isScreenSharing && screenStream ? screenStream : localStream;
        if (st) {
            const call = myPeer.call(peerId, st);
            if (call) { call.on('stream', us => handleRemoteStream(peerId, us)); peers[peerId] = call; }
        }
        addVoiceCard(peerId, username, false);
    });
    socket.on('user-disconnected', peerId => {
        if (peers[peerId]) { peers[peerId].close(); delete peers[peerId]; }
        document.querySelector(`[data-peer-id="${peerId}"]`)?.remove();
        if (voiceGrid.style.display === 'grid' && !voiceGrid.querySelector('.voice-card')) leaveVoice(false);
    });

    function handleRemoteStream(peerId, stream) {
        const card = document.querySelector(`[data-peer-id="${peerId}"]`);
        if (!card) return;
        const audio = card.querySelector('audio');
        if (audio) audio.srcObject = stream;
        const video = card.querySelector('video');
        if (video) {
            if (stream.getVideoTracks().length > 0) { video.srcObject = stream; video.style.display = 'block'; }
            else video.style.display = 'none';
        }
    }

    function addVoiceCard(peerId, username, isSelf) {
        if (document.querySelector(`[data-peer-id="${peerId}"]`)) return;
        const tmpl = document.getElementById('user-card-template');
        const card = tmpl.content.cloneNode(true).querySelector('.voice-card');
        card.setAttribute('data-peer-id', peerId);
        card.querySelector('.user-label').textContent = username + (isSelf ? ' (Ben)' : '');
        card.querySelector('.avatar-circle').style.backgroundImage =
            `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}')`;
        if (isSelf) card.querySelector('audio').muted = true;
        voiceGrid.appendChild(card); initLucide();
    }

    function leaveVoice(notify = true) {
        if (notify && currentChannelId && currentChannelType === 'voice')
            socket.emit('leave-channel', currentChannelId, myPeer?.id);
        Object.values(peers).forEach(c => c.close()); peers = {};
        voiceGrid.style.display = 'none'; voiceGrid.innerHTML = '';
        voiceControls.style.display = 'none';
        welcomeMessage.style.display = 'flex';
        currentChannelType = null; renderSidebar();
    }

    // ── CHAT ─────────────────────────────────────────────────────────
    function appendMsg(sender, text, isSelf, pic, ts) {
        const div = document.createElement('div');
        div.className = `message ${isSelf ? 'self' : ''}`;
        const avatar = pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(sender)}`;
        div.innerHTML = `
            <img class="msg-avatar" src="${avatar}" alt="">
            <div class="msg-body">
                <div class="msg-meta"><strong>${esc(sender)}</strong><span class="msg-time">${timeStr(ts)}</span></div>
                <span>${esc(text)}</span>
            </div>`;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function sendMessage() {
        const val = chatInput.value.trim();
        if (!val) return;
        if (currentChannelType === 'dm') {
            if (!currentDmFriend) return;
            socket.emit('send-dm', { friendId: currentDmFriend.id, text: val });
        } else {
            const s = servers.find(svr => svr.id === currentServerId);
            if (!s) return;
            const textCh = s.channels.find(c => c.type === 'text');
            if (!textCh) return;
            socket.emit('send-chat-message', { channelId: textCh.id, serverId: currentServerId, text: val });
        }
        appendMsg(currentUser.username, val, true, currentUser.profilePic, new Date().toISOString());
        chatInput.value = '';
    }

    chatInput.addEventListener('keypress', e => { if (e.key==='Enter') sendMessage(); });
    sendMsgBtn.addEventListener('click', sendMessage);

    socket.on('chat-message', d => {
        if (d.serverId === currentServerId && d.serverId != null) {
            appendMsg(d.sender, d.text, false, d.profilePic, d.timestamp);
        }
    });
    socket.on('dm-message', d => {
        clearDmNotif(d.friendId); // Eğer o arkadaşın DM'indeyse temizle
        if (currentChannelType === 'dm' && currentDmFriend?.id === d.friendId)
            appendMsg(d.message.sender, d.message.text, false, d.message.profilePic, d.message.timestamp);
    });

    // ── ÜYE LİSTESİ ──────────────────────────────────────────────────
    function openMembersPanel(serverId) {
        membersPanel.style.display = 'flex';
        socket.emit('get-server-members', serverId, res => {
            if (!res?.success) return;
            renderMembersUI(res.members);
        });
    }

    function refreshMembersPanel() {
        if (!currentServerId || !membersOpen) return;
        openMembersPanel(currentServerId);
    }

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
                membersList.appendChild(row);
            });
        }

        section('ÇEVRİMİÇİ', online);
        section('ÇEVRİMDIŞI', offline);
    }

    toggleMembersBtn.addEventListener('click', () => {
        membersOpen = !membersOpen;
        const rsPanel = document.getElementById('right-side-panel');
        if (membersOpen) {
            membersPanel.style.display = 'flex';
            if (currentServerId) openMembersPanel(currentServerId);
            if (rsPanel && currentServerId) rsPanel.style.display = 'none';
        } else {
            membersPanel.style.display = 'none';
            if (rsPanel && currentServerId) rsPanel.style.display = 'flex';
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

    // ── BİLDİRİM PANELİ ──────────────────────────────────────────────
    socket.on('receive-friend-request', req => {
        pendingRequests.push(req);
        updateNotifBadge();
    });
    socket.on('friend-added', f => {
        if (!friends.find(x => x.id === f.id)) {
            friends.push(f);
            if (currentContext === 'friends') renderSidebar();
            showToast(`${f.username} arkadaşlık isteğini kabul etti!`);
        }
    });
    socket.on('friend-removed', d => {
        friends = friends.filter(f => f.id !== d.userId);
        onlineFriends.delete(d.userId);
        if (currentContext === 'friends') renderSidebar();
    });

    function updateNotifBadge() {
        notifBadge.textContent = pendingRequests.length > 9 ? '9+' : pendingRequests.length;
        notifBadge.style.display = pendingRequests.length > 0 ? 'flex' : 'none';
    }

    function renderNotifList() {
        notifList.innerHTML = '';
        if (!pendingRequests.length) {
            notifList.innerHTML = '<div class="no-notif">Yeni bildirim yok</div>'; return;
        }
        pendingRequests.forEach(req => {
            const el = document.createElement('div');
            el.className = 'notif-item';
            el.innerHTML = `
                <img src="${req.fromPic||`https://api.dicebear.com/7.x/avataaars/svg?seed=${esc(req.fromUsername)}`}" alt="">
                <div class="notif-info">
                    <p><strong>${esc(req.fromUsername)}</strong> sana arkadaşlık isteği gönderdi</p>
                    <span>${timeStr(req.timestamp)}</span>
                </div>
                <div class="notif-actions">
                    <button class="accept-btn" data-id="${req.fromId}">Kabul</button>
                    <button class="reject-btn" data-id="${req.fromId}">Reddet</button>
                </div>`;
            notifList.appendChild(el);
        });
        notifList.querySelectorAll('.accept-btn').forEach(btn => btn.addEventListener('click', () => {
            const fromId = btn.dataset.id;
            socket.emit('accept-friend-request', fromId, res => {
                if (res.success) {
                    friends.push(res.friend);
                    pendingRequests = pendingRequests.filter(r => r.fromId !== fromId);
                    updateNotifBadge(); renderNotifList();
                    if (currentContext==='friends') renderSidebar();
                    showToast(`${res.friend.username} arkadaş listene eklendi!`);
                }
            });
        }));
        notifList.querySelectorAll('.reject-btn').forEach(btn => btn.addEventListener('click', () => {
            const n = pendingRequests.find(r=>r.fromId===btn.dataset.id)?.fromUsername;
            pendingRequests = pendingRequests.filter(r => r.fromId !== btn.dataset.id);
            updateNotifBadge(); renderNotifList();
            if (n) showToast(`${n} isteği reddedildi`);
        }));
    }

    notifBtn.addEventListener('click', e => {
        e.stopPropagation(); renderNotifList();
        const vis = notifPanel.style.display === 'flex';
        notifPanel.style.display = vis ? 'none' : 'flex';
    });

    // ── MODALLER ─────────────────────────────────────────────────────
    document.getElementById('nav-add-server').addEventListener('click', () => {
        document.getElementById('new-server-name').value = '';
        document.getElementById('create-server-modal').style.display = 'flex';
    });
    document.getElementById('nav-join-server').addEventListener('click', () => {
        document.getElementById('join-server-link').value = '';
        document.getElementById('join-server-modal').style.display = 'flex';
    });
    btnAddFriend.addEventListener('click', () => {
        document.getElementById('new-friend-username').value = '';
        document.getElementById('add-friend-message').textContent = '';
        document.getElementById('add-friend-modal').style.display = 'flex';
    });
    document.querySelectorAll('.close-modal').forEach(b =>
        b.addEventListener('click', () => b.closest('.modal-overlay').style.display = 'none')
    );
    document.querySelectorAll('.modal-overlay').forEach(ov =>
        ov.addEventListener('click', e => { if (e.target===ov) ov.style.display='none'; })
    );

    document.getElementById('confirm-create-server').addEventListener('click', () => {
        const name = document.getElementById('new-server-name').value.trim();
        if (!name) return;
        socket.emit('create-server', name, res => {
            if (res.success) {
                servers.push(res.server);
                document.getElementById('create-server-modal').style.display = 'none';
                renderServerList();
                activateServer(res.server);
                showToast(`"${res.server.name}" oluşturuldu!`);
            }
        });
    });

    document.getElementById('confirm-add-friend').addEventListener('click', () => {
        const name = document.getElementById('new-friend-username').value.trim();
        const msgEl = document.getElementById('add-friend-message');
        if (!name) return;
        socket.emit('send-friend-request', name, res => {
            msgEl.style.color = res.success ? 'var(--accent-green)' : 'var(--accent-red)';
            msgEl.textContent = res.message;
            if (res.success) { document.getElementById('new-friend-username').value = ''; showToast(res.message); }
        });
    });

    document.getElementById('confirm-join-server').addEventListener('click', () => {
        let val = document.getElementById('join-server-link').value.trim();
        // URL içindeki parametreyi çıkar
        try {
            if (val.includes('?invite=')) {
                const url = new URL(val.startsWith('http') ? val : 'http://x.x/' + val);
                val = url.searchParams.get('invite') || val.split('?invite=')[1]?.split('&')[0] || val;
            }
            if (val.includes('/invite/')) val = val.split('/invite/').pop();
        } catch(e) {}
        val = val.trim();
        if (!val) return;
        socket.emit('join-server', val, res => {
            if (res.success) {
                servers.push(res.server);
                document.getElementById('join-server-modal').style.display = 'none';
                renderServerList(); activateServer(res.server);
                showToast(`"${res.server.name}" sunucusuna katıldın!`);
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

    // ── PROFİL PANELI (sol alt avatar) ───────────────────────────────
    myAvatarEl.addEventListener('click', () => openProfilePanel());

    function openProfilePanel() {
        if (!currentUser) return;
        document.getElementById('pp-avatar').src = currentUser.profilePic;
        document.getElementById('pp-username').textContent = currentUser.username;
        document.getElementById('pp-new-username').value = '';
        document.getElementById('pp-current-pw').value = '';
        document.getElementById('pp-new-pw').value = '';
        document.getElementById('pp-confirm-pw').value = '';
        document.getElementById('pp-msg').textContent = '';
        // Durum seç
        document.querySelectorAll('.status-option').forEach(el => {
            el.classList.toggle('selected', el.dataset.status === myStatus);
        });
        profilePanel.style.display = 'flex';
        initLucide();
    }

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
        socket.emit('update-profile', { newPassword: np }, res => {
            if (res.success) {
                msg.style.color='var(--accent-green)'; msg.textContent='Şifre güncellendi!';
                document.getElementById('pp-current-pw').value='';
                document.getElementById('pp-new-pw').value='';
                document.getElementById('pp-confirm-pw').value='';
                showToast('Şifre değiştirildi!');
            } else { msg.style.color='var(--accent-red)'; msg.textContent = res.message; }
        });
    });

    // Çıkış yap (profil panelinden)
    document.getElementById('pp-logout-btn').addEventListener('click', () => {
        if (!confirm('Çıkış yapmak istediğine emin misin?')) return;
        doLogout();
    });

    function doLogout() {
        leaveVoice(true);
        profilePanel.style.display = 'none';
        appSettingsModal.style.display = 'none';
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
        } else {
            micSel.innerHTML = '<option value="default">Varsayılan Mikrofon</option>';
            audioDevices.forEach((d, i) => {
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
    });

    // Bağlantı hız testi
    document.getElementById('as-ping-btn').addEventListener('click', async () => {
        const res = document.getElementById('as-ping-result');
        res.textContent = 'Test yapılıyor...';
        const t = Date.now();
        try {
            await fetch('/health');
            const ms = Date.now() - t;
            res.textContent = `Gecikme: ${ms}ms ${ms<100?'🟢 Mükemmel':ms<300?'🟡 İyi':'🔴 Yavaş'}`;
        } catch { res.textContent = 'Test başarısız!'; }
    });

    // Ayarlardan çıkış
    document.getElementById('as-logout-btn').addEventListener('click', () => {
        if (!confirm('Çıkış yapmak istediğine emin misin?')) return;
        doLogout();
    });

    // ── SES KONTROLLERI ───────────────────────────────────────────────
    micBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        if (localStream) localStream.getAudioTracks().forEach(t => t.enabled = !isMuted);
        micBtn.classList.toggle('leave-btn', isMuted);
        micBtn.innerHTML = `<i data-lucide="${isMuted?'mic-off':'mic'}"></i>`;
        initLucide();
        showToast(isMuted ? 'Mikrofon kapatıldı' : 'Mikrofon açıldı');
    });

    deafenBtn.addEventListener('click', () => {
        isDeafened = !isDeafened;
        document.querySelectorAll('.voice-card audio').forEach(a => {
            if (a.closest('[data-peer-id]')?.dataset.peerId !== myPeer?.id) a.muted = isDeafened;
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
                if (myCard) { const v=myCard.querySelector('video'); v.srcObject=screenStream; v.style.display='block'; }
                Object.values(peers).forEach(call => {
                    const vt = screenStream.getVideoTracks()[0];
                    const s  = call.peerConnection?.getSenders().find(s=>s.track?.kind==='video');
                    if (s && vt) s.replaceTrack(vt).catch(()=>{});
                });
                screenStream.getVideoTracks()[0].addEventListener('ended', stopScreenShare);
                showToast('Ekran paylaşımı başladı');
            } else stopScreenShare();
        } catch(e) { if (e.name!=='NotAllowedError') showToast('Ekran paylaşımı başarısız', 'error'); }
    });

    function stopScreenShare() {
        screenStream?.getTracks().forEach(t=>t.stop());
        isScreenSharing = false; screenShareBtn.classList.remove('btn-active');
        document.querySelector(`[data-peer-id="${myPeer?.id}"]`)?.querySelector('video')?.style.setProperty('display','none');
        showToast('Ekran paylaşımı durduruldu');
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
        document.getElementById('edit-server-avatar').value = server.avatar || '';
        
        serverSettingsModal.style.display = 'flex';
    };

    document.getElementById('btn-server-settings')?.addEventListener('click', () => {
        const s = servers.find(svr => svr.id === currentServerId);
        if (s) openServerSettings(s);
    });

    document.getElementById('btn-invite-server')?.addEventListener('click', () => {
        if (!currentServerId) return;
        const link = `${window.location.origin}/?invite=${currentServerId}`;
        navigator.clipboard.writeText(link).then(() => showToast('Davet linki kopyalandı!'));
    });

    document.getElementById('btn-save-server-settings')?.addEventListener('click', () => {
        if (!activeSettingsServerId) return;
        const name = document.getElementById('edit-server-name').value;
        const avatar = document.getElementById('edit-server-avatar').value;
        socket.emit('edit-server', { serverId: activeSettingsServerId, name, avatar }, r => {
            if (r.success) {
                showToast('Sunucu güncellendi');
                serverSettingsModal.style.display = 'none';
                const s = servers.find(s => s.id === activeSettingsServerId);
                if (s) { s.name = r.server.name; s.avatar = r.server.avatar; renderServerList(); }
            } else showToast(r.message || 'Hata oluştu', 'error');
        });
    });

    document.getElementById('btn-leave-server')?.addEventListener('click', () => {
        if (!activeSettingsServerId) return;
        if (!confirm('Bu sunucudan ayrılmak istediğinize emin misiniz?')) return;
        socket.emit('leave-server', activeSettingsServerId, r => {
            if (r.success) {
                showToast('Sunucudan ayrıldınız');
                serverSettingsModal.style.display = 'none';
                servers = servers.filter(s => s.id !== activeSettingsServerId);
                renderServerList();
                document.getElementById('nav-friends').click(); 
            } else showToast(r.message || 'Hata', 'error');
        });
    });

    document.getElementById('btn-delete-server')?.addEventListener('click', () => {
        if (!activeSettingsServerId) return;
        if (!confirm('DİKKAT! Sunucu kalıcı olarak silinecek. Emin misiniz?')) return;
        socket.emit('delete-server', activeSettingsServerId, r => {
            if (r.success) {
                showToast('Sunucu silindi');
                serverSettingsModal.style.display = 'none';
                servers = servers.filter(s => s.id !== activeSettingsServerId);
                renderServerList();
                document.getElementById('nav-friends').click();
            } else showToast(r.message || 'Hata', 'error');
        });
    });

    // Profil Avatar Güncelleme ve Hesap Silme
    document.getElementById('pp-save-avatar')?.addEventListener('click', () => {
        const url = document.getElementById('pp-avatar-url').value;
        if (!url) return showToast('Açık bir URL girin', 'error');
        currentUser.profilePic = url;
        myAvatarImg.src = url;
        document.getElementById('pp-avatar').src = url;
        showToast('Profil resmi güncellendi (Yerel oturum)');
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
});
