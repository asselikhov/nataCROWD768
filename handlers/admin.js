const Visit = require('../models/Visit');

function adminHandler(bot) {
  bot.command('admin', async (ctx) => {
    if (ctx.from.id !== Number(process.env.ADMIN_ID)) {
      return ctx.reply('Доступ только для администратора');
    }

    const totalVisits = await Visit.countDocuments();
    const uniqueVisitors = await Visit.distinct('userId').then(users => users.length);
    const todayVisits = await Visit.countDocuments({
      timestamp: { $gte: new Date().setHours(0,0,0,0) }
    });

    ctx.reply(
      `📊 Статистика бота:\n` +
      `👥 Всего посещений: ${totalVisits}\n` +
      `👤 Уникальных посетителей: ${uniqueVisitors}\n` +
      `📅 Посещений сегодня: ${todayVisits}\n\n` +
      `✏️ Для редактирования: /edit [section] [text]`
    );
  });
}

module.exports = { adminHandler };