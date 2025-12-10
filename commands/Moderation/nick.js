import { PermissionFlagsBits } from 'discord.js';


export default {
name: 'nick',
description: 'Change or reset a user nickname',
async execute(message, args) {
if (!message.member.permissions.has(PermissionFlagsBits.ManageNicknames))
return message.reply("You don't have permission to change nicknames.");
const target = message.mentions.members.first();
if (!target) return message.reply(`Mention a user first.`);
if (!args[1]) return message.reply(`Provide a nickname or "reset".`);
const newNick = args.slice(1).join(' ');
try {
if (newNick.toLowerCase() === 'reset') {
await target.setNickname(null, `Reset by ${message.author.tag}`);
} else {
await target.setNickname(newNick, `Changed by ${message.author.tag}`);
}
await message.sendMessage([{ type: 'text', content: `### ✏️ Nickname updated for **${target.user.tag}**.` },]);
} catch (err) {
client.logger('error',err);
return message.reply(`Failed to change nickname.`);
}
}
};
