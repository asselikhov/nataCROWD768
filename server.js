require('dotenv').config();
const { Telegraf } = require('telegraf');
const mongoose = require('mongoose');
const { session } = require('telegraf');
const express = require('express');
const { adminHandler } = require('./handlers/admin');
const { contentHandler } = require('./handlers/content');
const { showcaseHandler } = require('./handlers/showcase');

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();

// Подключение к MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware для логирования посещений
bot.use(session());
bot.use(async (ctx, next) => {
  const Visit = require('./models/Visit');
  await Visit.create({
    userId: ctx.from?.id,
    username: ctx.from?.username,
    timestamp: new Date()
  });
  await next();
});

// Регистрация обработчиков
bot.use(contentHandler);
bot.use(showcaseHandler);
bot.use(adminHandler);

// Настройка Webhook
const PORT = process.env.PORT || 3000;
app.use(bot.webhookCallback(`/bot${process.env.BOT_TOKEN}`));
bot.telegram.setWebhook(`https://${process.env.RENDER_APP_NAME}.onrender.com/bot${process.env.BOT_TOKEN}`);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Telegram Bot is running!');
});