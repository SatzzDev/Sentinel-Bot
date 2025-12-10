import { PermissionFlagsBits } from 'discord.js';
import { createModCard } from '../../lib/canvas.js';

export default {
name: 'unban',
description: 'Unban a user and send a card',
async execute(message, args) {
if (!message.member.permissions.has(PermissionFlagsBits.BanMembers))
return message.reply(`You don't have permission to do this.`);
const userId = args[0];
if (!userId) return message.reply(`Specify a user ID to unban.`);
const reason = args.slice(1).join(' ') || 'No reason provided';
try {
const banInfo = await message.guild.bans.fetch(userId).catch(() => null);
if (!banInfo) return message.reply(`User is not banned.`);
const buffer = await createModCard('UNBAN', banInfo.user, message.author, reason);
await message.guild.bans.remove(userId, reason);
await message.sendMessage([
{ type: 'text', content: `### **${banInfo.user.tag}** has been unbanned.` },
{ type: 'image', url: 'attachment://unban-card.png', buffer }
]);
} catch (err) {
client.logger('error',err);
message.reply(`Failed to unban user.`);
}
}
};
