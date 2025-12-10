import fs from 'fs';
import { PermissionFlagsBits } from 'discord.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));


export default {
name: 'setwelcome',
description: 'Set the welcome channel for this server',
async execute(message, args, client) {
if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ You need Administrator permission to use this command.');
if (!message.mentions.channels.size) return message.reply('❌ Please mention a channel. Usage: `.setwelcome #channel`');
const channel = message.mentions.channels.first();
let database = {};
try {
const data = fs.readFileSync(join(__dirname, '../../database.json'), 'utf8');
database = JSON.parse(data);
} catch (err) {
client.logger('error',err);
}
if (!database[message.guild.id]) {
database[message.guild.id] = {};
}
database[message.guild.id].welcomeChannel = channel.id;
try {
fs.writeFileSync(join(__dirname, '../../database.json'), JSON.stringify(database, null, 2));
message.reply(`✅ Welcome channel set to ${channel}!`);
} catch (err) {
client.logger('error',err);
message.reply('❌ Failed to save settings.');
}
}
};
