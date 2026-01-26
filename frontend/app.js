// Configuration
const API_BASE_URL = 'https://cf_ai_voice_chat.youssefkeshk001.workers.dev';

// Session Management
let sessionId = localStorage.getItem('chatSessionId');
if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('chatSessionId', sessionId);
}

// DOM Elements
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const recordBtn = document.getElementById('record-btn');
const speakingViz = document.getElementById('speaking-viz');

/**
 * UI Helper: Auto-scroll to bottom
 */
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * UI Helper: Append message bubbles
 */
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

/**
 * UI Helper: Toggle "AI is typing" animation
 */
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
 * Voice Synthesis: Calls /voice and plays audio with visualizer
 */
async function speakText(text) {
    if (!text) return;

    try {
        // Show the wave animation
        speakingViz.classList.add('active');

        const response = await fetch(`${API_BASE_URL}/voice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text.substring(0, 250) }) // Bark has character limits
        });

        if (!response.ok) throw new Error('Voice synthesis failed');

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        // Hide waveform when audio finishes
        audio.onended = () => {
            speakingViz.classList.remove('active');
        };

        await audio.play();
    } catch (error) {
        console.error('Audio playback error:', error);
        speakingViz.classList.remove('active');
    }
}

/**
 * Primary Chat Logic
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
            body: JSON.stringify({
                message: text,
                sessionId: sessionId
            })
        });

        const data = await response.json();
        removeTypingIndicator();

        if (data.response) {
            appendMessage(data.response, 'ai');
            // AI starts speaking
            await speakText(data.response);
        } else {
             appendMessage('I processed that, but had no response.', 'ai');
        }

    } catch (error) {
        removeTypingIndicator();
        console.error('Error:', error);
        appendMessage('Error: Could not reach the assistant.', 'ai');
    }
}

// --- Event Listeners ---

sendBtn.addEventListener('click', () => sendMessage());

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// --- Speech Recognition ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        recordBtn.classList.add('recording');
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        sendMessage(transcript);
    };

    recognition.onend = () => {
        recordBtn.classList.remove('recording');
    };

    recordBtn.addEventListener('click', () => {
        try {
            recognition.start();
        } catch (e) {
            recognition.stop();
        }
    });
} else {
    recordBtn.style.display = 'none';
}
