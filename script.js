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

    // Modals
    const createServerModal  = document.getElementById('create-server-modal');
    const addFriendModal     = document.getElementById('add-friend-modal');
    const joinServerModal    = document.getElementById('join-server-modal');

    // --- State ---
    // Render.com'da ve local'de çalışır
    let socket = io(window.location.origin, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
    });
    let myPeer          = null;
    let currentUser     = null;
    let friends         = [];
    let servers         = [];
    let pendingRequests = [];
    let currentContext  = 'friends';
    let currentChannelId = null;
    let currentServerId  = null;
    let peers           = {};
    let localStream     = null;
    let screenStream    = null;
    let isMuted         = false;
    let isDeafened      = false;
    let isScreenSharing = false;

    // --- Utility ---
    function initLucide() {
        if (window.lucide) lucide.createIcons();
    }

    function showError(msg) {
        authError.style.color = 'var(--accent-red)';
        authError.textContent = msg;
    }

    // --- Auth ---
    // Avatar randomizer
    const avatarSeeds = ['Nexus','Byte','Cipher','Nova','Pixel','Storm','Flux','Zephyr'];
    let avatarSeed = 'Nexus';
    document.getElementById('refresh-avatar-btn').addEventListener('click', () => {
        avatarSeed = Math.random().toString(36).substring(2, 10);
        document.querySelector('#auth-avatar-preview img').src =
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`;
    });

    function handleAuth(type) {
        const username = authUsernameInput.value.trim();
        const password = authPasswordInput.value.trim();
        if (!username || !password) return showError('Please fill in all fields.');

        const profilePic = `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed || username}`;

        socket.emit(type, { username, password, profilePic }, (res) => {
            if (res.success) {
                if (type === 'login') {
                    currentUser     = res.user;
                    friends         = res.friends || [];
                    servers         = res.servers || [];
                    pendingRequests = res.friendRequests || [];

                    authOverlay.style.display = 'none';
                    appContainer.style.display = 'flex';

                    // Update UI sidebar user profile
                    document.querySelector('#my-avatar img').src = currentUser.profilePic;

                    initWebRTC();
                    renderServerList();
                    renderSidebar();
                    updateNotifBadge();
                    initLucide();
                } else {
                    // Register success
                    authError.style.color = 'var(--accent-green)';
                    authError.textContent = 'Account created! You can now log in.';
                    authPasswordInput.value = '';
                }
            } else {
                showError(res.message);
            }
        });
    }

    loginBtn.addEventListener('click', () => handleAuth('login'));
    registerBtn.addEventListener('click', () => handleAuth('register'));

    // Also handle Enter key on inputs
    authPasswordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAuth('login');
    });

    // --- Navigation ---
    document.getElementById('nav-friends').addEventListener('click', () => {
        currentContext = 'friends';
        currentChannelId = null;
        currentServerId = null;
        chatInput.disabled = true;
        voiceGrid.style.display = 'none';
        voiceControls.style.display = 'none';
        welcomeMessage.style.display = 'flex';
        chatMessages.innerHTML = '';
        document.querySelectorAll('.server-icon, .rail-action-btn').forEach(el => el.classList.remove('active'));
        document.getElementById('nav-friends').classList.add('active');
        renderSidebar();
        switchMainView('home');
    });

    // --- Server List Render ---
    function renderServerList() {
        dynamicServerList.innerHTML = '';
        servers.forEach(s => {
            const el = document.createElement('div');
            el.className = `server-icon tooltip ${currentContext === s.id ? 'active' : ''}`;
            el.setAttribute('data-tooltip', s.name);
            el.textContent = s.name.substring(0, 2).toUpperCase();
            el.addEventListener('click', () => {
                currentContext = s.id;
                currentServerId = s.id;
                document.querySelectorAll('.server-icon').forEach(i => i.classList.remove('active'));
                document.getElementById('nav-friends').classList.remove('active');
                el.classList.add('active');
                renderSidebar();
                switchMainView('server', s);
            });
            dynamicServerList.appendChild(el);
        });
        initLucide();
    }

    // --- Sidebar Render ---
    function renderSidebar() {
        dynamicChannelList.innerHTML = '';

        if (currentContext === 'friends') {
            sidebarContextTitle.textContent = 'FRIENDS';
            btnAddFriend.style.display = '';
            btnInviteServer.style.display = 'none';

            if (friends.length === 0) {
                const empty = document.createElement('li');
                empty.style.cssText = 'color:var(--text-secondary);font-size:13px;padding:20px 14px;opacity:0.6;';
                empty.textContent = 'No friends yet. Add some!';
                dynamicChannelList.appendChild(empty);
            }

            friends.forEach(f => {
                const li = document.createElement('li');
                li.className = currentChannelId === `dm_${f.id}` ? 'active' : '';
                li.innerHTML = `
                    <img src="${f.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${f.username}`}"
                         style="width:28px;height:28px;border-radius:8px;object-fit:cover;">
                    <span>${f.username}</span>`;
                li.addEventListener('click', () => openDM(f));
                dynamicChannelList.appendChild(li);
            });

        } else {
            const server = servers.find(s => s.id === currentContext);
            if (!server) return;
            sidebarContextTitle.textContent = server.name.toUpperCase();
            btnAddFriend.style.display = 'none';
            btnInviteServer.style.display = '';

            // Section labels
            const textChannels = server.channels.filter(c => c.type === 'text');
            const voiceChannels = server.channels.filter(c => c.type === 'voice');

            function renderSection(label, channels) {
                if (channels.length === 0) return;
                const header = document.createElement('li');
                header.style.cssText = 'font-size:11px;font-weight:700;color:var(--text-secondary);letter-spacing:1px;padding:10px 14px 4px;cursor:default;pointer-events:none;';
                header.textContent = label.toUpperCase();
                dynamicChannelList.appendChild(header);

                channels.forEach(ch => {
                    const li = document.createElement('li');
                    li.className = currentChannelId === ch.id ? 'active' : '';
                    const iconType = ch.type === 'voice' ? 'mic' : 'hash';
                    li.innerHTML = `<i data-lucide="${iconType}"></i> <span>${ch.name}</span>`;
                    li.addEventListener('click', () => joinChannel(server.id, ch));
                    dynamicChannelList.appendChild(li);
                });
            }

            renderSection('Text Channels', textChannels);
            renderSection('Voice Channels', voiceChannels);
        }
        initLucide();
    }

    function switchMainView(type, data) {
        if (type === 'server') {
            mainHeaderTitle.textContent = data.name;
            mainHeaderIcon.setAttribute('data-lucide', 'server');
        } else {
            mainHeaderTitle.textContent = 'Friends';
            mainHeaderIcon.setAttribute('data-lucide', 'users');
        }
        initLucide();
    }

    // --- Direct Messages ---
    function openDM(friend) {
        currentChannelId = `dm_${friend.id}`;
        currentServerId = null;
        renderSidebar();
        mainHeaderTitle.textContent = friend.username;
        mainHeaderIcon.setAttribute('data-lucide', 'message-circle');
        chatInput.disabled = false;
        chatInput.placeholder = `Message ${friend.username}...`;
        chatMessages.innerHTML = '';
        welcomeMessage.style.display = 'none';
        voiceGrid.style.display = 'none';

        socket.emit('get-dms', friend.id, (res) => {
            if (res.success) {
                res.messages.forEach(m => appendMessage(m.sender, m.text, m.senderId === currentUser.id, m.profilePic, m.timestamp));
            }
        });
        initLucide();
    }

    // --- WebRTC ---
    function initWebRTC() {
        myPeer = new Peer(undefined, { host: '0.peerjs.com', port: 443, secure: true });

        myPeer.on('open', id => {
            console.log('PeerJS ready:', id);
        });

        myPeer.on('error', err => console.error('PeerJS error:', err));

        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then(stream => {
                localStream = stream;
                myPeer.on('call', call => {
                    call.answer(isScreenSharing && screenStream ? screenStream : localStream);
                    call.on('stream', userStream => handleRemoteStream(call.peer, userStream));
                    peers[call.peer] = call;
                });
            })
            .catch(err => console.warn('Mic access denied:', err));
    }

    function joinChannel(serverId, channel) {
        if (channel.type === 'text') {
            // Leave voice if in one
            if (voiceGrid.style.display === 'grid') {
                leaveVoice();
            }
            currentChannelId = channel.id;
            currentServerId = serverId;
            renderSidebar();
            chatInput.disabled = false;
            chatInput.placeholder = `Message #${channel.name}...`;
            welcomeMessage.style.display = 'none';
            chatMessages.innerHTML = '';

            // Load existing messages
            socket.emit('get-channel-messages', channel.id, (res) => {
                if (res.success && res.messages.length > 0) {
                    res.messages.forEach(m => appendMessage(m.sender, m.text, m.senderId === currentUser.id, m.profilePic, m.timestamp));
                } else {
                    chatMessages.innerHTML = `<div class="welcome-notif"><i data-lucide="hash"></i><h3>#${channel.name}</h3><p>Be the first to send a message!</p></div>`;
                    initLucide();
                }
            });

            // Join socket room for real-time
            socket.emit('join-channel', { serverId, channelId: channel.id, peerId: myPeer ? myPeer.id : null }, () => {});
            return;
        }

        // Voice Channel
        if (!myPeer) return alert('PeerJS not ready yet. Please wait a moment.');

        currentChannelId = channel.id;
        currentServerId = serverId;
        renderSidebar();
        welcomeMessage.style.display = 'none';
        voiceGrid.style.display = 'grid';
        voiceGrid.innerHTML = '';
        voiceControls.style.display = 'flex';
        document.getElementById('active-voice-channel').textContent = channel.name;

        addVoiceCard(myPeer.id, currentUser.username, null, true);
        socket.emit('join-channel', { serverId, channelId: channel.id, peerId: myPeer.id }, () => {});
    }

    socket.on('user-connected', (peerId, username) => {
        if (!localStream && !screenStream) return;
        const streamToSend = isScreenSharing && screenStream ? screenStream : localStream;
        if (streamToSend) {
            const call = myPeer.call(peerId, streamToSend);
            if (call) {
                call.on('stream', userStream => handleRemoteStream(peerId, userStream));
                peers[peerId] = call;
            }
        }
        addVoiceCard(peerId, username, null, false);
    });

    socket.on('user-disconnected', peerId => {
        if (peers[peerId]) peers[peerId].close();
        document.querySelector(`[data-peer-id="${peerId}"]`)?.remove();
        delete peers[peerId];
        if (voiceGrid.children.length === 0) {
            leaveVoice();
        }
    });

    function handleRemoteStream(peerId, stream) {
        const card = document.querySelector(`[data-peer-id="${peerId}"]`);
        if (!card) return;
        const audio = card.querySelector('audio');
        if (audio) audio.srcObject = stream;
        const video = card.querySelector('video');
        if (stream.getVideoTracks().length > 0) {
            video.srcObject = stream;
            video.style.display = 'block';
            card.querySelector('.avatar-ring').classList.add('has-video');
        } else {
            video.style.display = 'none';
            card.querySelector('.avatar-ring').classList.remove('has-video');
        }
    }

    function addVoiceCard(peerId, username, stream, isSelf) {
        const template = document.getElementById('user-card-template');
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector('.voice-card');
        card.setAttribute('data-peer-id', peerId);
        card.querySelector('.user-label').textContent = username + (isSelf ? ' (You)' : '');
        card.querySelector('.avatar-circle').style.backgroundImage =
            `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${username}')`;
        if (isSelf) card.querySelector('audio').muted = true;
        voiceGrid.appendChild(card);
    }

    function leaveVoice() {
        voiceGrid.style.display = 'none';
        voiceGrid.innerHTML = '';
        voiceControls.style.display = 'none';
        welcomeMessage.style.display = 'flex';
    }

    // --- Messaging ---
    function appendMessage(sender, text, isSelf, profilePic, timestamp) {
        const div = document.createElement('div');
        div.className = `message ${isSelf ? 'self' : ''}`;
        const avatar = profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sender}`;
        const time = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        div.innerHTML = `
            <img class="msg-avatar" src="${avatar}" alt="${sender}">
            <div class="msg-body">
                <div class="msg-meta">
                    <strong>${sender}</strong>
                    <span class="msg-time">${time}</span>
                </div>
                <span>${escapeHtml(text)}</span>
            </div>`;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function escapeHtml(str) {
        return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function sendMessage() {
        const val = chatInput.value.trim();
        if (!val || !currentChannelId) return;
        if (currentChannelId.startsWith('dm_')) {
            const friendId = currentChannelId.split('_')[1];
            socket.emit('send-dm', { friendId, text: val });
        } else {
            socket.emit('send-chat-message', currentChannelId, val);
        }
        appendMessage(currentUser.username, val, true, currentUser.profilePic, new Date().toISOString());
        chatInput.value = '';
    }

    chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
    sendMsgBtn.addEventListener('click', sendMessage);

    socket.on('chat-message', d => {
        if (d.channelId === currentChannelId) {
            appendMessage(d.sender, d.text, false, d.profilePic, d.timestamp);
        }
    });

    socket.on('dm-message', d => {
        if (currentChannelId === `dm_${d.friendId}`) {
            appendMessage(d.message.sender, d.message.text, false, d.message.profilePic, d.message.timestamp);
        }
    });

    // --- Voice Controls ---
    micBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        if (localStream) localStream.getAudioTracks().forEach(t => t.enabled = !isMuted);
        micBtn.classList.toggle('leave-btn', isMuted);
        micBtn.innerHTML = `<i data-lucide="${isMuted ? 'mic-off' : 'mic'}"></i>`;
        initLucide();
    });

    deafenBtn.addEventListener('click', () => {
        isDeafened = !isDeafened;
        document.querySelectorAll('audio').forEach(a => {
            const card = a.closest('.voice-card');
            if (card && card.getAttribute('data-peer-id') !== myPeer?.id) {
                a.muted = isDeafened;
            }
        });
        deafenBtn.classList.toggle('leave-btn', isDeafened);
        deafenBtn.innerHTML = `<i data-lucide="${isDeafened ? 'headphones-off' : 'headphones'}"></i>`;
        // headphones-off doesn't exist in lucide, use volume-x instead
        deafenBtn.innerHTML = `<i data-lucide="${isDeafened ? 'volume-x' : 'headphones'}"></i>`;
        initLucide();
    });

    screenShareBtn.addEventListener('click', async () => {
        try {
            if (!isScreenSharing) {
                screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                isScreenSharing = true;
                screenShareBtn.classList.add('accent-glow');
                screenShareBtn.style.color = 'var(--accent-cyan)';
                screenShareBtn.style.boxShadow = 'var(--glow-cyan)';
                updateStreams(screenStream);
                const myCard = document.querySelector(`[data-peer-id="${myPeer?.id}"]`);
                if (myCard) {
                    const v = myCard.querySelector('video');
                    v.srcObject = screenStream;
                    v.style.display = 'block';
                }
                screenStream.getVideoTracks()[0].addEventListener('ended', () => {
                    stopScreenShare();
                });
            } else {
                stopScreenShare();
            }
        } catch (err) {
            console.error('Screen share failed:', err);
        }
    });

    function stopScreenShare() {
        if (screenStream) screenStream.getTracks().forEach(t => t.stop());
        isScreenSharing = false;
        screenShareBtn.style.color = '';
        screenShareBtn.style.boxShadow = '';
        if (localStream) updateStreams(localStream);
        const myCard = document.querySelector(`[data-peer-id="${myPeer?.id}"]`);
        if (myCard) myCard.querySelector('video').style.display = 'none';
    }

    function updateStreams(stream) {
        Object.values(peers).forEach(call => {
            if (!call.peerConnection) return;
            const videoTrack = stream.getVideoTracks()[0];
            const sender = call.peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
            if (sender && videoTrack) sender.replaceTrack(videoTrack).catch(e => console.warn(e));
            else if (videoTrack) call.peerConnection.addTrack(videoTrack, stream);
        });
    }

    disconnectBtn.addEventListener('click', () => {
        if (currentChannelId) socket.emit('leave-channel', currentChannelId, myPeer?.id);
        Object.values(peers).forEach(call => call.close());
        peers = {};
        voiceGrid.innerHTML = '';
        leaveVoice();
    });

    // --- Friends ---
    socket.on('receive-friend-request', (request) => {
        pendingRequests.push(request);
        updateNotifBadge();
        renderNotifPanel();
    });

    socket.on('friend-added', (friend) => {
        friends.push(friend);
        if (currentContext === 'friends') renderSidebar();
    });

    function updateNotifBadge() {
        if (pendingRequests.length > 0) {
            notifBadge.style.display = 'block';
            notifBadge.textContent = pendingRequests.length > 9 ? '9+' : pendingRequests.length;
        } else {
            notifBadge.style.display = 'none';
        }
    }

    function renderNotifPanel() {
        notifList.innerHTML = '';
        if (pendingRequests.length === 0) {
            notifList.innerHTML = '<div class="no-notif">No new notifications</div>';
            return;
        }
        pendingRequests.forEach(req => {
            const item = document.createElement('div');
            item.className = 'notif-item';
            item.innerHTML = `
                <img src="${req.fromPic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.fromUsername}`}" alt="${req.fromUsername}">
                <div class="notif-info">
                    <p><strong>${req.fromUsername}</strong> sent you a friend request</p>
                    <span>${new Date(req.timestamp).toLocaleDateString()}</span>
                </div>
                <div class="notif-actions">
                    <button class="accept-btn" data-id="${req.fromId}">Accept</button>
                    <button class="reject-btn" data-id="${req.fromId}">Ignore</button>
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
                    }
                });
            });
        });

        notifList.querySelectorAll('.reject-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const fromId = btn.dataset.id;
                pendingRequests = pendingRequests.filter(r => r.fromId !== fromId);
                updateNotifBadge();
                renderNotifPanel();
            });
        });
    }

    // Notifications panel toggle
    notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        renderNotifPanel();
        notifPanel.style.display = notifPanel.style.display === 'flex' ? 'none' : 'flex';
    });

    // --- Modals ---
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

    // Invite link button
    btnInviteServer.addEventListener('click', () => {
        if (!currentServerId) return;
        const link = `${window.location.origin}?invite=${currentServerId}`;
        navigator.clipboard.writeText(link).then(() => {
            btnInviteServer.style.color = 'var(--accent-green)';
            setTimeout(() => { btnInviteServer.style.color = ''; }, 2000);
        }).catch(() => {
            prompt('Copy invite link:', link);
        });
    });

    document.querySelectorAll('.close-modal').forEach(b => {
        b.addEventListener('click', () => {
            b.closest('.modal-overlay').style.display = 'none';
        });
    });

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.style.display = 'none';
        });
    });

    document.getElementById('confirm-create-server').addEventListener('click', () => {
        const name = document.getElementById('new-server-name').value.trim();
        if (!name) return;
        socket.emit('create-server', name, (res) => {
            if (res.success) {
                servers.push(res.server);
                renderServerList();
                createServerModal.style.display = 'none';
                // Auto-switch to new server
                currentContext = res.server.id;
                currentServerId = res.server.id;
                renderSidebar();
                switchMainView('server', res.server);
            }
        });
    });

    document.getElementById('confirm-add-friend').addEventListener('click', () => {
        const name = document.getElementById('new-friend-username').value.trim();
        const msgEl = document.getElementById('add-friend-message');
        if (!name) return;
        socket.emit('send-friend-request', name, (res) => {
            if (res.success) {
                msgEl.style.color = 'var(--accent-green)';
                msgEl.textContent = res.message;
                document.getElementById('new-friend-username').value = '';
            } else {
                msgEl.style.color = 'var(--accent-red)';
                msgEl.textContent = res.message;
            }
        });
    });

    document.getElementById('confirm-join-server').addEventListener('click', () => {
        let val = document.getElementById('join-server-link').value.trim();
        // Support full URL invite links
        if (val.includes('?invite=')) {
            val = val.split('?invite=')[1];
        }
        if (!val) return;
        socket.emit('join-server', val, (res) => {
            if (res.success) {
                servers.push(res.server);
                renderServerList();
                joinServerModal.style.display = 'none';
                currentContext = res.server.id;
                currentServerId = res.server.id;
                renderSidebar();
                switchMainView('server', res.server);
            } else {
                alert(res.message || 'Could not join server.');
            }
        });
    });

    // Settings placeholder
    document.getElementById('open-settings-btn').addEventListener('click', () => {
        alert('Settings coming soon!');
    });

    // Avatar click -> settings
    document.getElementById('my-avatar').addEventListener('click', () => {
        alert(`Logged in as: ${currentUser?.username}`);
    });

    // Check invite URL param on load
    const urlParams = new URLSearchParams(window.location.search);
    const inviteId = urlParams.get('invite');
    if (inviteId) {
        // Will be used after login
        window._pendingInvite = inviteId;
    }
});
