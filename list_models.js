require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("ОШИБКА: Не найден GEMINI_API_KEY в файле .env");
    process.exit(1);
}

async function checkModels() {
    console.log("Запрашиваем список моделей...");
    
    try {
        // Прямой запрос к API для получения списка
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        
        console.log("\n=== ДОСТУПНЫЕ МОДЕЛИ (поддерживающие чат) ===");
        
        // Фильтруем модели, которые умеют генерировать контент
        const chatModels = data.models
            .filter(m => m.supportedGenerationMethods.includes("generateContent"))
            .map(m => m.name.replace('models/', '')); // Убираем префикс models/

        chatModels.forEach(name => {
            console.log(`- ${name}`);
        });

        console.log("\n=== РЕКОМЕНДУЕМЫЕ ДЛЯ ИСПОЛЬЗОВАНИЯ ===");
        if (chatModels.includes('gemini-1.5-flash')) console.log("✅ gemini-1.5-flash (Быстрая, стабильная)");
        if (chatModels.includes('gemini-1.5-pro')) console.log("✅ gemini-1.5-pro (Умная, стабильная)");
        if (chatModels.includes('gemini-2.0-flash-exp')) console.log("🚀 gemini-2.0-flash-exp (Экспериментальная, новая)");

    } catch (error) {
        console.error("Ошибка при получении списка:", error.message);
    }
}

checkModels();