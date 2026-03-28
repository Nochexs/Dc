document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Selectors ---
    const authOverlay = document.getElementById('auth-overlay');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const authUsernameInput = document.getElementById('auth-username');
    const authPasswordInput = document.getElementById('auth-password');
    const authError = document.getElementById('auth-error');

    const appContainer = document.getElementById('app-container');
    const mainHeaderTitle = document.getElementById('main-header-title');
    const sidebarContextTitle = document.getElementById('sidebar-context-title');
    const dynamicServerList = document.getElementById('dynamic-server-list');
    const dynamicChannelList = document.getElementById('dynamic-channel-list');
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
    let isScreenSharing = false;

    // --- Initialization ---
    function initLucide() {
        if (window.lucide) lucide.createIcons();
    }

    // --- Authentication ---
    function handleAuth(type) {
        const username = authUsernameInput.value.trim();
        const password = authPasswordInput.value.trim();
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
                    
                    initWebRTC();
                    renderServerList();
                    renderSidebar();
                    initLucide();
                } else {
                    authError.style.color = 'var(--accent-green)';
                    authError.textContent = res.message;
                }
            } else {
                authError.textContent = res.message;
            }
        });
    }

    loginBtn.addEventListener('click', () => handleAuth('login'));
    registerBtn.addEventListener('click', () => handleAuth('register'));

    // --- Navigation & UI Rendering ---
    function renderServerList() {
        dynamicServerList.innerHTML = '';
        servers.forEach(s => {
            const el = document.createElement('div');
            el.className = `server-icon tooltip ${currentContext === s.id ? 'active' : ''}`;
            el.setAttribute('data-tooltip', s.name);
            el.innerHTML = s.name.substring(0, 1).toUpperCase();
            el.addEventListener('click', () => {
                currentContext = s.id;
                document.querySelectorAll('.server-icon').forEach(i => i.classList.remove('active'));
                el.classList.add('active');
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
                li.addEventListener('click', () => openDM(f));
                dynamicChannelList.appendChild(li);
            });
        } else {
            const server = servers.find(s => s.id === currentContext);
            sidebarContextTitle.textContent = server.name.toUpperCase();
            server.channels.forEach(ch => {
                const li = document.createElement('li');
                li.className = currentChannelId === ch.id ? 'active' : '';
                const iconType = ch.type === 'voice' ? 'mic' : 'hash';
                li.innerHTML = `<i data-lucide="${iconType}"></i> <span>${ch.name}</span>`;
                li.addEventListener('click', () => joinChannel(server.id, ch));
                dynamicChannelList.appendChild(li);
            });
        }
        initLucide();
    }

    function switchMainView(type, data) {
        if(type === 'server') {
            mainHeaderTitle.textContent = data.name;
            document.getElementById('main-header-icon').setAttribute('data-lucide', 'server');
        } else {
            mainHeaderTitle.textContent = 'Friends';
            document.getElementById('main-header-icon').setAttribute('data-lucide', 'users');
        }
        initLucide();
    }

    function openDM(friend) {
        currentChannelId = `dm_${friend.id}`;
        renderSidebar();
        mainHeaderTitle.textContent = friend.username;
        document.getElementById('main-header-icon').setAttribute('data-lucide', 'user');
        chatInput.disabled = false;
        chatMessages.innerHTML = '';
        welcomeMessage.style.display = 'none';
        socket.emit('get-dms', friend.id, (res) => {
            if(res.success) res.messages.forEach(m => appendMessage(m.sender, m.text, m.senderId === currentUser.id));
        });
        initLucide();
    }

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
    }

    function joinChannel(serverId, channel) {
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
    }

    socket.on('user-connected', (peerId, username) => {
        const call = myPeer.call(peerId, isScreenSharing ? screenStream : localStream);
        if (call) {
            call.on('stream', userStream => handleRemoteStream(peerId, userStream));
            peers[peerId] = call;
        }
        addVoiceCard(peerId, username, null, false);
    });

    socket.on('user-disconnected', peerId => {
        if(peers[peerId]) peers[peerId].close();
        document.querySelector(`[data-peer-id="${peerId}"]`)?.remove();
        delete peers[peerId];
        if (voiceGrid.children.length === 0) {
            voiceGrid.style.display = 'none';
            voiceControls.style.display = 'none';
            welcomeMessage.style.display = 'flex';
        }
    });

    function handleRemoteStream(peerId, stream) {
        const card = document.querySelector(`[data-peer-id="${peerId}"]`);
        if(!card) return;
        const audio = card.querySelector('audio');
        if (audio) audio.srcObject = stream;
        
        const video = card.querySelector('video');
        if(stream.getVideoTracks().length > 0) {
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
        card.querySelector('.avatar-circle').style.backgroundImage = `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${username}')`;
        if(isSelf) card.querySelector('audio').muted = true;
        voiceGrid.appendChild(card);
    }

    // --- Messaging ---
    function appendMessage(sender, text, isSelf) {
        const div = document.createElement('div');
        div.className = `message ${isSelf ? 'self' : ''}`;
        div.innerHTML = `<strong>${sender}</strong> <span>${text}</span>`;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

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
        }
    });

    socket.on('chat-message', d => d.channelId === currentChannelId && appendMessage(d.sender, d.text, false));
    socket.on('dm-message', d => currentChannelId === `dm_${d.friendId}` && appendMessage(d.message.sender, d.message.text, false));

    // --- Controls ---
    micBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        if (localStream) localStream.getAudioTracks()[0].enabled = !isMuted;
        micBtn.classList.toggle('leave-btn', isMuted);
        micBtn.innerHTML = `<i data-lucide="mic${isMuted ? '-off' : ''}"></i>`;
        initLucide();
    });

    deafenBtn.addEventListener('click', () => {
        isDeafened = !isDeafened;
        const allAudios = document.querySelectorAll('audio');
        allAudios.forEach(a => {
            if (a.parentElement.parentElement.getAttribute('data-peer-id') !== myPeer.id) {
                a.muted = isDeafened;
            }
        });
        deafenBtn.classList.toggle('leave-btn', isDeafened);
        deafenBtn.innerHTML = `<i data-lucide="headphones${isDeafened ? '-off' : ''}"></i>`;
        initLucide();
    });

    screenShareBtn.addEventListener('click', async () => {
        try {
            if(!isScreenSharing) {
                screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                isScreenSharing = true;
                screenShareBtn.classList.add('accent-glow');
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
        } catch (err) {
            console.error("Screen share failed:", err);
        }
    });

    function updateStreams(stream) {
        Object.values(peers).forEach(call => {
            const videoTrack = stream.getVideoTracks()[0];
            const sender = call.peerConnection.getSenders().find(s => s.track.kind === 'video');
            if(sender && videoTrack) sender.replaceTrack(videoTrack).catch(e => console.error(e));
            else if (videoTrack) call.peerConnection.addTrack(videoTrack, stream);
        });
    }

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
            }
        });
    });

    document.getElementById('confirm-add-friend').addEventListener('click', () => {
        const n = document.getElementById('new-friend-username').value;
        if (!n) return;
        socket.emit('add-friend', n, (res) => {
            if(res.success) { 
                friends.push(res.friend); 
                renderSidebar(); 
                addFriendModal.style.display = 'none'; 
            } else {
                document.getElementById('add-friend-message').textContent = res.message;
            }
        });
    });

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
});
