import { PermissionFlagsBits } from 'discord.js';
import ms from 'ms';
import { createModCard } from '../../lib/canvas.js';

export default {
name: 'timeout',
description: 'Timeout a user for a duration',
async execute(message, args) {
if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) return message.reply(`You don't have permission to timeout users.`);
const target = message.mentions.members.first();
if (!target) return message.reply(`Mention a user to timeout.`);
const duration = args[1];
if (!duration || !ms(duration)) return message.reply(`Invalid duration.`);
const reason = args.slice(2).join(' ') || 'No reason provided';
try {
await target.timeout(ms(duration), reason);
const buffer = await createModCard(
'TIMEOUT',
target.user,
message.author,
`${duration} — ${reason}`
);
await message.sendMessage([
{ type: 'text', content: `### ⏳ **${target.user.tag}** has been timed out.` },
{ type: 'image', url: 'attachment://mod-card.png', buffer }
]);
} catch (err) {
client.logger('error',err);
message.reply(`Failed to timeout the user.`);
}
}
};
