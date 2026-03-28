document.addEventListener('DOMContentLoaded', () => {
    const toggleChatBtn = document.getElementById('toggle-chat');
    const closeChatBtn = document.getElementById('close-chat');
    const chatPanel = document.getElementById('chat-panel');
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.querySelector('.chat-messages');

    // Toggle Chat Panel
    toggleChatBtn.addEventListener('click', () => {
        chatPanel.classList.toggle('hidden');
        if (!chatPanel.classList.contains('hidden')) {
            toggleChatBtn.style.background = 'rgba(0, 209, 255, 0.1)';
            toggleChatBtn.style.color = 'var(--accent-cyan)';
            toggleChatBtn.style.borderColor = 'var(--accent-cyan)';
        } else {
            toggleChatBtn.style.background = '';
            toggleChatBtn.style.color = '';
            toggleChatBtn.style.borderColor = '';
        }
    });

    closeChatBtn.addEventListener('click', () => {
        chatPanel.classList.add('hidden');
        toggleChatBtn.style.background = '';
        toggleChatBtn.style.color = '';
        toggleChatBtn.style.borderColor = '';
    });

    // Simple Message Sending
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && messageInput.value.trim() !== '') {
            sendMessage();
        }
    });

    const sendBtn = document.querySelector('.send-btn');
    sendBtn.addEventListener('click', sendMessage);

    function sendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;

        const msgDiv = document.createElement('div');
        msgDiv.className = 'message';
        msgDiv.innerHTML = `
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" class="msg-avatar">
            <div class="msg-content">
                <span class="msg-user">You</span>
                <p class="msg-text">${text}</p>
            </div>
        `;
        
        chatMessages.appendChild(msgDiv);
        messageInput.value = '';
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Add a subtle pop animation to the new message
        msgDiv.style.opacity = '0';
        msgDiv.style.transform = 'translateY(10px)';
        setTimeout(() => {
            msgDiv.style.transition = 'all 0.4s ease';
            msgDiv.style.opacity = '1';
            msgDiv.style.transform = 'translateY(0)';
        }, 10);
    }

    // Nav Button Activation
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Control Button Toggles (Visual only)
    const controlButtons = document.querySelectorAll('.control-btn:not(.leave-btn)');
    controlButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active-state');
            if (btn.classList.contains('active-state')) {
                btn.style.color = btn.title === 'Mute' ? '#ef4444' : 'var(--accent-cyan)';
                btn.style.background = 'rgba(255, 255, 255, 0.1)';
                if (btn.title === 'Mute') {
                    btn.querySelector('i').setAttribute('data-lucide', 'mic-off');
                } else if (btn.title === 'Deafen') {
                    btn.querySelector('i').setAttribute('data-lucide', 'headphones-off');
                }
            } else {
                btn.style.color = '';
                btn.style.background = '';
                if (btn.title === 'Mute') {
                    btn.querySelector('i').setAttribute('data-lucide', 'mic');
                } else if (btn.title === 'Deafen') {
                    btn.querySelector('i').setAttribute('data-lucide', 'headphones');
                }
            }
            lucide.createIcons();
        });
    });
});
