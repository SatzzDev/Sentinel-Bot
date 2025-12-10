import { AttachmentBuilder } from 'discord.js';
import { createBotCard } from '../../lib/canvas.js';

export default{
name: 'botinfo',
description: 'Show bot information with a bot info card',
async execute(message, args, client) {
try {
const buffer = await createBotCard(message.client);
await message.sendMessage([{ type: 'image', url: 'attachment://bot-card.png', buffer }]);
} catch (err) {
client.logger('error',err);
await message.reply(`${emojis.error} Failed to generate bot info card.`);
}
}
};