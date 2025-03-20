require('dotenv').config();
const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const { session } = require('telegraf');
const express = require('express');
const { adminHandler } = require('./handlers/admin');
const { contentHandler } = require('./handlers/content');
const { showcaseHandler } = require('./handlers/showcase');
const Visit = require('./models/Visit');

// Проверка переменных окружения
const requiredEnv = ['BOT_TOKEN', 'MONGODB_URI', 'ADMIN_ID', 'RENDER_APP_NAME'];
requiredEnv.forEach(key => {
  if (!process.env[key]) {
    console.error(`Missing required env variable: ${key}`);
    process.exit(1);
  }
});

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// Подключение к MongoDB Atlas (без устаревших опций)
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => {
      console.error('MongoDB connection error:', err);
      process.exit(1);
    });

// Middleware для логирования посещений
bot.use(session());
bot.use(async (ctx, next) => {
  if (ctx.from) {
    try {
      await Visit.create({
        userId: ctx.from.id,
        username: ctx.from.username,
        timestamp: new Date()
      });
    } catch (err) {
      console.error('Error logging visit:', err);
    }
  }
  await next();
});

// Регистрация обработчиков (передаем bot напрямую)
contentHandler(bot);
showcaseHandler(bot);
adminHandler(bot);

// Настройка Webhook
const PORT = process.env.PORT || 10000; // Render использует PORT из окружения
app.use(bot.webhookCallback(`/bot${process.env.BOT_TOKEN}`));
bot.telegram.setWebhook(`https://${process.env.RENDER_APP_NAME}.onrender.com/bot${process.env.BOT_TOKEN}`)
    .then(() => console.log('Webhook set successfully'))
    .catch(err => console.error('Error setting webhook:', err));

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Telegram Bot is running!');
});