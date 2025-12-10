import { PermissionFlagsBits } from 'discord.js';
import { createModCardV2 } from '../../lib/canvas.js';


export default {
name: 'lock',
description: 'Lock the current channel',
async execute(message, args) {
if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels))
return message.reply(`You don't have permission to do this.`);
const reason = args.join(' ') || 'No Reason Provided.';
const channel = message.channel;
const moderator = message.author;
try {
await channel.permissionOverwrites.edit(message.guild.id, { SendMessages: false });
const buffer = await createModCardV2('LOCK', channel, moderator, reason);
await message.sendMessage([{ type: 'text', content: `### 🔒 Channel has been locked.` },{ type: 'image', url: 'attachment://mod-card.png', buffer }]);
} catch (err) {
client.logger('error',err);
message.reply(`Failed to lock this channel.`);
}
}
};
