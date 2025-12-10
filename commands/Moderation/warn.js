import { PermissionFlagsBits } from 'discord.js';
import { createModCard } from '../../lib/canvas.js';

export default {
name: 'warn',
description: 'Warn a user and send a card',
async execute(message, args) {
if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers))
return message.reply(`You don't have permission to do this.`);
const target = message.mentions.users.first();
if (!target) return message.reply(`Mention someone to warn.`);
const reason = args.slice(1).join(' ') || 'No reason provided';
const member = message.guild.members.cache.get(target.id);
if (!member) return message.reply(`User isn't in this server.`);
try {
const buffer = await createModCard('WARN', target, message.author, reason);
await message.sendMessage([
{ type: 'text', content: `### ⚠️ **${target.tag}** has been warned.` },
{ type: 'image', url: 'attachment://warn-card.png', buffer }
]);
} catch (err) {
client.logger('error',err);
message.reply(`Failed to warn user.`);
}
}
};
