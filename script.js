document.addEventListener('DOMContentLoaded', () => {
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
                }
            } else {
                authError.textContent = res.message;
            }
        });
    }

    loginBtn.addEventListener('click', () => handleAuth('login'));
    registerBtn.addEventListener('click', () => handleAuth('register'));

    // --- UI Logic ---
    function renderServerList() {
        dynamicServerList.innerHTML = '';
        servers.forEach(s => {
            const el = document.createElement('div');
            el.className = `server-icon tooltip ${currentContext === s.id ? 'active' : ''}`;
            el.setAttribute('data-tooltip', s.name);
            el.innerHTML = s.name.substring(0, 1).toUpperCase();
            el.addEventListener('click', () => {
                currentContext = s.id;
                document.getElementById('nav-home').classList.remove('active');
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
                li.innerHTML = `<i class="fa-solid fa-user"></i> <span>${f.username}</span>`;
                li.addEventListener('click', () => openDM(f));
                dynamicChannelList.appendChild(li);
            });
        } else {
            const server = servers.find(s => s.id === currentContext);
            sidebarContextTitle.textContent = server.name.toUpperCase();
            server.channels.forEach(ch => {
                const li = document.createElement('li');
                li.className = currentChannelId === ch.id ? 'active' : '';
                li.innerHTML = `<i class="fa-solid ${ch.type==='voice' ? 'fa-volume-high' : 'fa-hashtag'}"></i> <span>${ch.name}</span>`;
                li.addEventListener('click', () => joinChannel(server.id, ch));
                dynamicChannelList.appendChild(li);
            });
        }
    }

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
        }
    }

    function openDM(friend) {
        currentChannelId = `dm_${friend.id}`;
        renderSidebar();
        mainHeaderTitle.textContent = friend.username;
        document.getElementById('main-header-icon').className = 'fa-solid fa-user';
        chatInput.disabled = false;
        chatMessages.innerHTML = '';
        socket.emit('get-dms', friend.id, (res) => {
            if(res.success) res.messages.forEach(m => appendMessage(m.sender, m.text, m.senderId === currentUser.id));
        });
    }

    // --- WebRTC & Signal ---
    function initWebRTC() {
        myPeer = new Peer(undefined, { host: '0.peerjs.com', port: 443, secure: true });
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            localStream = stream;
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
        
        addVoiceCard(myPeer.id, currentUser.username, null, true);
        socket.emit('join-channel', { serverId, channelId: channel.id, peerId: myPeer.id }, () => {});
    }

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
        const video = card.querySelector('video');
        if(stream.getVideoTracks().length > 0) {
            video.srcObject = stream;
            video.style.display = 'block';
            card.classList.add('is-video');
        } else {
            video.style.display = 'none';
            card.classList.remove('is-video');
        }
    }

    function addVoiceCard(peerId, username, stream, isSelf) {
        const template = document.getElementById('user-card-template');
        const clone = template.content.cloneNode(true);
        const card = clone.querySelector('.voice-card');
        card.setAttribute('data-peer-id', peerId);
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

    // Modals
    document.getElementById('nav-add-server').addEventListener('click', () => createServerModal.style.display = 'flex');
    document.getElementById('btn-add-friend').addEventListener('click', () => addFriendModal.style.display = 'flex');
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
});
