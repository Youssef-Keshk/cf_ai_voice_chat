const API_BASE_URL = 'https://cf_ai_voice_chat.youssefkeshk001.workers.dev';

// Session persistence
let sessionId = localStorage.getItem('chatSessionId') || 'session_' + Math.random().toString(36).substring(2, 9);
localStorage.setItem('chatSessionId', sessionId);

const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const recordBtn = document.getElementById('record-btn');

function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function appendMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'ai-message');
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    contentDiv.textContent = text;
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function showTypingIndicator() {
    const loader = document.createElement('div');
    loader.id = 'ai-loader';
    loader.classList.add('typing-indicator');
    loader.innerHTML = '<span></span><span></span><span></span>';
    messagesContainer.appendChild(loader);
    scrollToBottom();
}

function removeTypingIndicator() {
    const loader = document.getElementById('ai-loader');
    if (loader) loader.remove();
}

/**
 * Primary Messaging Logic
 */
async function sendMessage(overrideText = null) {
    const text = overrideText || messageInput.value.trim();
    if (!text) return;

    if (!overrideText) messageInput.value = '';
    appendMessage(text, 'user');
    showTypingIndicator();

    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, sessionId })
        });

        const data = await response.json();
        removeTypingIndicator();

        if (data.response) {
            appendMessage(data.response, 'ai');
        }
    } catch (error) {
        removeTypingIndicator();
        console.error('Chat error:', error);
        appendMessage('Error: Connection to assistant failed.', 'ai');
    }
}

/**
 * Voice-to-Text: Web Speech API Implementation
 */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => recordBtn.classList.add('recording');
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        sendMessage(transcript);
    };
    recognition.onend = () => recordBtn.classList.remove('recording');

    recordBtn.addEventListener('click', () => {
        try { recognition.start(); } catch (e) { recognition.stop(); }
    });
} else {
    recordBtn.style.display = 'none';
}

sendBtn.addEventListener('click', () => sendMessage());
messageInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
