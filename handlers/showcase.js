const { Markup } = require('telegraf');

const products = [
    { id: 1, name: 'Продукт 1', clientPrice: 1000, clubPrice: 800, imageUrl: 'https://picsum.photos/200/300?random=1' },
    { id: 2, name: 'Продукт 2', clientPrice: 1500, clubPrice: 1200, imageUrl: 'https://picsum.photos/200/300?random=2' },
];

function showcaseHandler(bot) {
    bot.action('showcase', (ctx) => {
        try {
            ctx.reply(
                '🛍 Наша продукция:',
                Markup.inlineKeyboard(
                    products.map(product => [
                        Markup.button.callback(
                            `${product.name} (💰 ${product.clientPrice}₽ | 🏆 ${product.clubPrice}₽)`,
                            `product_${product.id}`
                        )
                    ])
                )
            );
            ctx.answerCbQuery();
        } catch (err) {
            console.error('Error in showcase action:', err);
            ctx.reply('Ошибка при загрузке продукции');
        }
    });

    bot.action(/product_(.+)/, (ctx) => {
        const productId = ctx.match[1];
        const product = products.find(p => p.id === Number(productId));

        try {
            ctx.replyWithPhoto(
                { url: product.imageUrl },
                {
                    caption: `✨ ${product.name}\n💰 Клиентская цена: ${product.clientPrice}₽\n🏆 Клубная цена: ${product.clubPrice}₽`,
                    reply_markup: Markup.inlineKeyboard([
                        [Markup.button.callback('⬅️ Назад к витрине', 'showcase')]
                    ])
                }
            );
            ctx.answerCbQuery();
        } catch (err) {
            console.error('Error in product action:', err);
            ctx.reply('Ошибка при загрузке продукта');
        }
    });
}

module.exports = { showcaseHandler };