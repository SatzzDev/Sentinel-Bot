import { PermissionFlagsBits } from 'discord.js';
import { createModCard } from '../../lib/canvas.js';


export default {
name: 'ban', 
description: 'Ban a user and send a card',
async execute(message, args, client) {
if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return message.reply({
  components: [
    {
      type: 17,
      components: [
        { type: 10, content: `You do not have permission to use this command.` }
      ]
    }
  ]
});
const targetUser = message.mentions.users.first();
if (!targetUser) return message.reply({
  components: [
    {
      type: 17,
      components: [
        { type: 10, content: `Please mention a user to ban.` }
      ]
    }
  ]
});
const reason = args.slice(1).join(' ') || 'No reason provided';
const member = message.guild.members.cache.get(targetUser.id);
if (!member) return message.reply({
  components: [
    {
      type: 17,
      components: [
        { type: 10, content: `User not found in this server.` }
      ]
    }
  ]
});
if (!member.bannable) return message.reply({
  components: [
    {
      type: 17,
      components: [
        { type: 10, content: `I cannot ban this user.` }
      ]
    }
  ]
});
try {
  const buffer = await createModCard('BAN', targetUser, message.author, reason);
  await member.ban({ reason: reason });
  await message.reply({
    files: [ { attachment: buffer, name: 'ban-card.png' } ],
    components: [
      {
        type: 17,
        components: [
          { type: 10, content: `### **${targetUser.tag}** has been banned.` }
        ]
      }
    ]
  });
} catch (err) {
  client.logger('error', err);
  await message.reply({
    components: [
      {
        type: 17,
        components: [
          { type: 10, content: `${emojis.error} Failed to ban user.` }
        ]
      }
    ]
  });
}
}
};
