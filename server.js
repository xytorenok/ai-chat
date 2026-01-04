const http = require('http');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;

// Инициализация SDK
const genAI = new GoogleGenerativeAI(API_KEY);

// === ВЫБОР МОДЕЛИ ИЗ ТВОЕГО СПИСКА ===
// gemini-2.5-flash — Идеальный баланс скорости и качества (рекомендую)
// gemini-2.5-pro   — Если нужны более глубокие рассуждения
// gemini-3-flash-preview — Если хочется протестировать 3-ю версию
const MODEL_NAME = "gemini-2.5-flash"; 

const model = genAI.getGenerativeModel({ model: MODEL_NAME });

const getMimeType = (filePath) => {
    const extname = path.extname(filePath);
    switch (extname) {
        case('.html'): return 'text/html';
        case('.css'): return 'text/css';
        case('.js'): return 'text/javascript';
        default: return 'text/plain';
    }
};

const server = http.createServer(async (req, res) => {
    console.log(`${req.method} ${req.url}`);

    // === API ENDPOINT ===
    if (req.url === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        
        req.on('end', async () => {
            try {
                const { history, message } = JSON.parse(body);

                // Запуск чата с историей
                const chat = model.startChat({
                    history: history || [],
                });

                // Отправка сообщения
                const result = await chat.sendMessage(message);
                const responseText = result.response.text();

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ reply: responseText }));

            } catch (error) {
                console.error('Gemini API Error:', error);
                
                let errorMsg = error.message || 'Internal Server Error';
                
                // Если модель слишком новая для текущей версии SDK (иногда бывает),
                // ошибка может выглядеть как 404, но обычно обновление имени решает проблему.
                if (errorMsg.includes('404')) {
                    errorMsg = `Модель ${MODEL_NAME} не найдена или недоступна для ключа.`;
                }

                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: errorMsg }));
            }
        });
        return;
    }

    // === СТАТИКА ===
    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
    
    if (!filePath.startsWith(path.join(__dirname, 'public'))) {
        res.writeHead(403); res.end('Forbidden'); return;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404); res.end('Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': getMimeType(filePath) });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Сервер запущен: http://localhost:${PORT}/`);
    console.log(`🤖 Используемая модель: ${MODEL_NAME}`);
});