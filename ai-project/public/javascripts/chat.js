document.addEventListener('DOMContentLoaded', function() {
    const chatBody = document.getElementById('chat-body');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');

    // 自动调整输入框高度
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // 发送消息
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message === '') return;

        // 添加用户消息到聊天窗口
        addMessage('user', message);
        chatInput.value = '';
        chatInput.style.height = 'auto';

        // 显示正在输入状态
        showTypingIndicator();

        // 发送消息到服务器
        fetch('/api/qwen/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'user',
                        content: message
                    }
                ]
            })
        })
        .then(response => response.json())
        .then(data => {
            // 移除正在输入状态
            removeTypingIndicator();
            
            if (data.code === 200 && data.data.choices && data.data.choices.length > 0) {
                const botMessage = data.data.choices[0].message.content;
                addMessage('bot', botMessage);
            } else {
                addMessage('bot', '抱歉，我暂时无法回答你的问题，请稍后再试。');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            removeTypingIndicator();
            addMessage('bot', '抱歉，连接服务器失败，请稍后再试。');
        });
    }

    // 添加消息到聊天窗口
    function addMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;
        
        messageDiv.appendChild(contentDiv);
        chatBody.appendChild(messageDiv);
        
        // 滚动到底部
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // 显示正在输入状态
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            typingDiv.appendChild(dot);
        }
        
        chatBody.appendChild(typingDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // 移除正在输入状态
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // 发送按钮点击事件
    sendButton.addEventListener('click', sendMessage);

    // 回车键发送消息
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
});