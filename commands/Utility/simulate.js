export default {
name: 'sim',
description: 'Simulate Wellcome or Leave message',
async execute(message, args, client) {
if (!args[0] || !['add', 'remove'].includes(args[0].toLowerCase())) {
return message.sendMessage({type:'text', content:'### Usage: `s <add|remove>`'});
}
const type = args[0].toLowerCase() ? args[0].toLowerCase() == 'add' ? 'guildMemberAdd' : args[0].toLowerCase() == 'remove' ? 'guildMemberRemove' : null : null;
client.emit(type, message.member);
}
};
