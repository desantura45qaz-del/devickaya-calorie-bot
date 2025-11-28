// =============== НАСТРОЙКА БОТА ===============

const TelegramBot = require("node-telegram-bot-api");

// ВСТАВЬ СВОЙ ТОКЕН ❗❗❗
const TOKEN = "7719183383:AAEXyt9c15ln552uFzz_gCcxSyfsAsU8p7o";

const bot = new TelegramBot(TOKEN, {
  polling: true
});

console.log("Bot started...");


// =============== ОБРАБОТКА /start ===============

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
              web_app: { url: "https://miniappcalors-web.vercel.app" } // 🔗 ВСТАВЬ СВОЙ URL
            }
          ]
        ]
      }
    }
  );
});


// =============== ПОЛУЧЕНИЕ ДАННЫХ ИЗ MINI-APP ===============

bot.on("message", async (msg) => {
  if (!msg.web_app_data) return;

  try {
    const payload = JSON.parse(msg.web_app_data.data);
    const type = payload.type;

    // == 1. Запись блюда ==
    if (type === "meal_log_entry") {
      const meal = payload.meal;

      const name = meal.name;
      const weight = meal.weight_g;
      const kcal = meal.total_kcal;
      const kcal100 = meal.kcal_per_100g;
      const m100 = meal.macros_per_100;
      const mp = meal.macros_portion;

      let text = `🍽 <b>Блюдо добавлено в дневник</b>\n\n`;
      text += `<b>${name}</b>\n`;
      text += `Порция: <b>${weight} г</b>\n`;
      text += `Калорийность порции: <b>${kcal} ккал</b>\n\n`;

      if (kcal100 != null) text += `Ккал на 100 г: <b>${kcal100}</b>\n`;

      text += `\n<b>БЖУ на 100 г:</b>\n`;
      text += `• Белки: ${m100.protein} г\n`;
      text += `• Жиры: ${m100.fats} г\n`;
      text += `• Углеводы: ${m100.carbs} г\n`;

      text += `\n<b>БЖУ на порцию:</b>\n`;
      text += `• Белки: ~${mp.protein} г\n`;
      text += `• Жиры: ~${mp.fats} г\n`;
      text += `• Углеводы: ~${mp.carbs} г`;

      bot.sendMessage(msg.chat.id, text, { parse_mode: "HTML" });

      return;
    }

    // == 2. Суточная норма ==
    if (type === "calorie_result_daily") {
      const d = payload.data;

      let text = `📊 <b>Суточная норма</b>\n\n`;
      text += `Поддержание веса: ~ <b>${d.maintenance}</b> ккал\n`;
      text += `Рекомендуемая норма: <b>${d.target}</b> ккал/день\n\n`;

      text += `<b>Ориентировочные макросы:</b>\n`;
      text += `• Белки: <b>${d.protein}</b> г\n`;
      text += `• Жиры: <b>${d.fats}</b> г\n`;
      text += `• Углеводы: <b>${d.carbs}</b> г`;

      bot.sendMessage(msg.chat.id, text, { parse_mode: "HTML" });

      return;
    }

    // == 3. Карточка для сторис ==
    if (type === "story_card") {
      bot.sendMessage(
        msg.chat.id,
        "🖼 Твоя карточка готова!\nСохрани её как изображение и загрузи в сторис 💜"
      );
      return;
    }

    // == 4. Неизвестный тип данных ==
    bot.sendMessage(
      msg.chat.id,
      `Получен неизвестный тип данных: ${type}`
    );

  } catch (err) {
    console.error("Ошибка обработки WebApp данных:", err);
  }
});


// =============== HTTP-СЕРВЕР ДЛЯ RENDER ===============

const http = require("http");
const PORT = process.env.PORT || 3000;

http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Devickaya calorie bot is running\n");
  })
  .listen(PORT, () => {
    console.log(`HTTP server for healthcheck listening on port ${PORT}`);
  });