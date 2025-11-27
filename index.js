// index.js
// Бот Devickaya: WebApp калькулятор + дневник питания

const TelegramBot = require("node-telegram-bot-api");

// 🔐 Токен и WebApp URL берём из переменных окружения
const token = process.env.BOT_TOKEN;
const WEBAPP_URL =
  process.env.WEBAPP_URL || "https://miniappcalors-web.vercel.app";

if (!token) {
  console.error("❌ BOT_TOKEN не задан. Укажи его в Environment Variables.");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

/*
  🔥 Кнопка в нижнем меню Telegram — открывает WebApp без /start
*/
bot.setChatMenuButton({
  menu_button: {
    type: "web_app",
    text: "Калькулятор Devickaya",
    web_app: { url: WEBAPP_URL },
  },
});

// Команда /start — просто приветствие (не обязательно)
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    "Привет! 🌸\n\n" +
      "Используй кнопку «Калькулятор Devickaya» внизу чата.\n" +
      "Или нажми кнопку ниже 👇",
    {
      reply_markup: {
        keyboard: [
          [
            {
              text: "Открыть калькулятор",
              web_app: { url: WEBAPP_URL },
            },
          ],
        ],
        resize_keyboard: true,
      },
    }
  );
});

// Основной обработчик данных из WebApp
bot.on("message", (msg) => {
  if (!msg.web_app_data) return;

  let payload;

  try {
    payload = JSON.parse(msg.web_app_data.data);
  } catch (err) {
    bot.sendMessage(msg.chat.id, "Ошибка обработки данных 😔");
    return;
  }

  const type = payload.type;

  console.log("Получены данные:", payload);

  // === 1. БЛЮДО В ДНЕВНИК ===
  if (type === "meal_log_entry") {
    const meal = payload.meal || {};
    const ts = payload.timestamp;

    let timeStr = "время не указано";
    if (ts) {
      const dt = new Date(ts);
      timeStr = `${dt.toLocaleDateString()} ${dt.getHours()}:${dt.getMinutes()}`;
    }

    const name = meal.name || "Блюдо";
    const kcal100 = meal.kcal_per_100g;
    const weight_g = meal.weight_g;
    const totalKcal = meal.total_kcal;

    const per100 = meal.macros_per_100 || {};
    const portion = meal.macros_portion || {};

    let text = "🍽 <b>Блюдо добавлено в дневник</b>\n\n";
    text += `<b>${name}</b>\n${timeStr}\n\n`;
    text += `Порция: <b>${weight_g} г</b>\n`;
    text += `Ккал порции: <b>${totalKcal}</b>\n`;
    if (kcal100 != null) text += `Ккал на 100 г: <b>${kcal100}</b>\n`;

    if (
      per100.protein != null ||
      per100.fats != null ||
      per100.carbs != null
    ) {
      text += "\nНа 100 г:\n";
      if (per100.protein != null) text += `• Белки: ${per100.protein} г\n`;
      if (per100.fats != null) text += `• Жиры: ${per100.fats} г\n`;
      if (per100.carbs != null) text += `• Углеводы: ${per100.carbs} г\n`;
    }

    if (
      portion.protein != null ||
      portion.fats != null ||
      portion.carbs != null
    ) {
      text += "\nНа порцию:\n";
      if (portion.protein != null)
        text += `• Белки: ~${portion.protein} г\n`;
      if (portion.fats != null) text += `• Жиры: ~${portion.fats} г\n`;
      if (portion.carbs != null)
        text += `• Углеводы: ~${portion.carbs} г\n`;
    }

    bot.sendMessage(msg.chat.id, text, { parse_mode: "HTML" });
    return;
  }

  // === 2. СУТОЧНАЯ НОРМА ===
  if (type === "calorie_result_daily") {
    const d = payload.data;

    let text = "📊 <b>Суточная норма</b>\n\n";
    text += `Поддержание веса: <b>${d.maintenance} ккал</b>\n`;
    text += `Твоя норма: <b>${d.target} ккал</b>\n\n`;

    text += "БЖУ:\n";
    text += `• Белки: ${d.protein} г\n`;
    text += `• Жиры: ${d.fats} г\n`;
    text += `• Углеводы: ${d.carbs} г\n`;

    bot.sendMessage(msg.chat.id, text, { parse_mode: "HTML" });
    return;
  }

  // === 3. КАРТОЧКА СТОРИС ===
  if (type === "story_card") {
    bot.sendMessage(
      msg.chat.id,
      "🖼 Твоя карточка готова!\nСохрани её как изображение и загрузи в сторис 💜"
    );
    return;
  }

  bot.sendMessage(
    msg.chat.id,
    `Получен неизвестный тип данных: ${type}`
  );
});