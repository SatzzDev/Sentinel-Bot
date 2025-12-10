export default {
name: 'emojis',
description: 'Show all server emojis',
async execute(message, args, client) {
const emojis = message.guild.emojis.cache;
if (!emojis.size) return message.sendMessage([{type:'text', content:'### Server ini kosong… kayak hati yang belum diisi.'}]);
const list = emojis.map(e => `${e} \`<:${e.name}:${e.id}>\``).join('\n');
//if (list.length > 2000) return message.sendMessage([{type:'text', content:'### Emoji terlalu banyak buat dikirim, bro 😭'}]);
message.sendMessage([{type:'text', content:`### Emojis di server **${message.guild.name}**:\n\n${list}`}]);
}
};
