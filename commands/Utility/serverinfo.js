import { createServerCard } from '../../lib/canvas.js';

export default {
name: 'serverinfo',
description: 'Show server information with a server info card',
async execute(message, args, client) {
try {
const buffer = await createServerCard(message.guild);
await message.sendMessage([{ type: 'image', url: 'attachment://server-card.png', buffer }]);
} catch (err) {
client.logger('error',err);
await message.reply(`Failed to generate server card.`);
}
}
};