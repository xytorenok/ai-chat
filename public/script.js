const messagesDiv = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// История диалога для отправки в Gemini (чтобы он помнил контекст)
let chatHistory = []; 

// Функция добавления сообщения в UI
function addMessage(text, sender) {
    const div = document.createElement('div');
    div.classList.add('message', sender);
    div.textContent = text;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // UI Updates
    addMessage(text, 'user');
    userInput.value = '';
    userInput.disabled = true;
    sendBtn.disabled = true;

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: text,
                history: chatHistory
            })
        });

        const data = await response.json();

        if (data.error) {
            addMessage('Ошибка: ' + data.error, 'error');
        } else {
            addMessage(data.reply, 'ai');
            
            // Обновляем историю для контекста
            chatHistory.push({ role: 'user', parts: [{ text: text }] });
            chatHistory.push({ role: 'model', parts: [{ text: data.reply }] });
        }

    } catch (err) {
        addMessage('Ошибка сети', 'error');
        console.error(err);
    } finally {
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
    }
}

// Слушатели событий
sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});