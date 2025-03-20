const Content = require('../models/Content');
const { Markup } = require('telegraf');

async function getContent(section) {
    return await Content.findOne({ section }) || { text: 'Контент не задан' };
}

function contentHandler(bot) {
    bot.start(async (ctx) => {
        const username = ctx.from.first_name || ctx.from.username || 'Гость';
        const about = await getContent('about');

        const businessCard = `
🌟 *Ваша Визитка* 🌟  
👤 *Имя:* Иван Иванов  
💼 *Должность:* Основатель и CEO  
🏢 *Компания:* FutureTech Solutions  
📝 *О нас:* Инновационная компания, создающая решения для бизнеса будущего.  
📍 *Адрес:* г. Москва, ул. Технологий, д. 42  
📧 *Email:* ivan@futuretech.com  
🌐 *Сайт:* www.futuretech.com  
`;

        try {
            await ctx.replyWithAnimation(
                'https://t.me/gamee/112', // Замените на file_id, если не работает
                { caption: `✨ Привет, ${username}! Вот моя визитка:` }
            );

            await ctx.replyWithMarkdownV2(
                businessCard.replace(/([_*[\]()~`>#+-=|{}.!])/g, '\\$1'),
                Markup.inlineKeyboard([
                    [Markup.button.callback('🌟 О компании', 'about')],
                    [Markup.button.callback('🛍 Продукция', 'showcase')],
                    [Markup.button.callback('📞 Связаться', 'contact')],
                ])
            );
        } catch (err) {
            console.error('Error sending start message:', err);
            ctx.reply('Произошла ошибка при отправке визитки');
        }
    });

    bot.action('about', async (ctx) => {
        try {
            const about = await getContent('about');
            await ctx.replyWithMarkdownV2(`*О компании*\n${about.text.replace(/([_*[\]()~`>#+-=|{}.!])/g, '\\$1')}`);
            ctx.answerCbQuery();
        } catch (err) {
            console.error('Error in about action:', err);
            ctx.reply('Ошибка при загрузке информации о компании');
        }
    });

    bot.action('contact', (ctx) => {
        ctx.reply('📞 Свяжитесь с нами: @YourContact | +7 (XXX) XXX-XX-XX');
        ctx.answerCbQuery();
    });

    bot.command('edit', async (ctx) => {
        if (ctx.from.id !== Number(process.env.ADMIN_ID)) return;

        const [section, ...text] = ctx.message.text.split(' ').slice(1);
        if (!section || !text.length) {
            return ctx.reply('Формат: /edit [section] [text]');
        }

        try {
            await Content.findOneAndUpdate(
                { section },
                { text: text.join(' '), updatedAt: new Date() },
                { upsert: true }
            );
            ctx.reply(`Контент раздела "${section}" обновлен`);
        } catch (err) {
            console.error('Error editing content:', err);
            ctx.reply('Ошибка при обновлении контента');
        }
    });
}

module.exports = { contentHandler };