const TelegramBot = require("node-telegram-bot-api");

// === ТВОЙ ТОКЕН БОТА ===
const TOKEN = "7719183383:AAHk6ukYUZhVH5yT0DUeICi0Lyh_RyL1mlA";

// === Запуск в режиме polling ===
const bot = new TelegramBot(TOKEN, {
  polling: true,
});

console.log("Bot started...");


// ================= ОБРАБОТКА /start =================
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Привет! Я бот Devickaya 💜\n" +
      "Здесь будет твой дневник питания, калорийность блюд и рекомендации.\n\n" +
      "Открой мини-приложение кнопкой ниже 👇",
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Открыть мини-приложение",
              web_app: { url: "https://devickaya-app.vercel.app/" }, // ← если будет другой URL — поменяешь
            },
          ],
        ],
      },
    }
  );
});


// ========== Получение данных из мини-приложения ==========
bot.on("message", (msg) => {
  if (!msg?.web_app_data) return;

  let data = {};
  try {
    data = JSON.parse(msg.web_app_data.data);
  } catch (e) {
    bot.sendMessage(msg.chat.id, "Ошибка: не удалось прочитать данные 🤷‍♀️");
    return;
  }

  const type = data.type;

  // === 1. КАРТОЧКА БЛЮДА ===
  if (type === "meal_card") {
    bot.sendMessage(msg.chat.id, "🍽 Твоя карточка блюда сохранена!");
    return;
  }

  // === 2. КАРТОЧКА РЕЦЕПТА ===
  if (type === "recipe_card") {
    bot.sendMessage(msg.chat.id, "📗 Рецепт сохранён!");
    return;
  }

  // === 3. КАРТОЧКА СТОРИС ===
  if (type === "story_card") {
    bot.sendMessage(
      msg.chat.id,
      "📸 Твоя карточка готова!\nСохрани её как изображение и загрузи в сторис 💜"
    );
    return;
  }

  // === Если тип не распознан ===
  bot.sendMessage(msg.chat.id, `Получен неизвестный тип данных: ${type}`);
});


// === Мини-HTTP сервер для Render / UptimeRobot / Worker ===
const http = require("http");
const PORT = process.env.PORT || 3000;

http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Devickaya calorie bot is running\n");
  })
  .listen(PORT, () => {
    console.log(`HTTP healthcheck server running on port ${PORT}`);
  });