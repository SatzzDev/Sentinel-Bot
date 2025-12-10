export default {
name: 'ping',
description: 'Replies with Pong!',
async execute(message, args, client) {
const sent = await message.reply('🏓 Pinging...');
const timeDiff = sent.createdTimestamp - message.createdTimestamp;
sent.edit(`🏓 Pong! Latency: ${timeDiff}ms | API Latency: ${Math.round(client.ws.ping)}ms`);
}
};