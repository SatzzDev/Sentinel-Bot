import { createProfileCard } from '../../lib/canvas.js';
import { AttachmentBuilder } from 'discord.js';

export default {
name: 'userinfo',
description: 'Show user information with a profile card',
async execute(message, args, client) {
const targetUser = message.mentions.users.first() || message.author;
const member = message.guild.members.cache.get(targetUser.id);
if (!member) return message.reply(`User not found in this server.`);
try {
const buffer = await createProfileCard(targetUser, message.guild);
await message.sendMessage([{ type: 'image', url: 'attachment://user-card.png', buffer }]);
} catch (err) {
client.logger('error',err);
await message.reply(`Failed to generate profile card.`);
}
}
}

