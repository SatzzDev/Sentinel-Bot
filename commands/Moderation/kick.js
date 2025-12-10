import { PermissionFlagsBits } from 'discord.js';
import { createModCard } from '../../lib/canvas.js';


export default {
name: 'kick',
description: 'Kick a user and send a card',
async execute(message, args, client) {
if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) return message.reply({
  components: [
    {
      type: 17,
      components: [
        { type: 10, content: `${emojis.error} You do not have permission to use this command.` }
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
        { type: 10, content: `${emojis.warning} Please mention a user to kick.` }
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
if (!member.kickable) return message.reply({
  components: [
    {
      type: 17,
      components: [
        { type: 10, content: `I cannot kick this user.` }
      ]
    }
  ]
});
try {
  const buffer = await createModCard('KICK', targetUser, message.author, reason);
  await member.kick(reason);
  await message.reply({
    files: [ { attachment: buffer, name: 'kick-card.png' } ],
    components: [
      {
        type: 17,
        components: [
          { type: 10, content: `### **${targetUser.tag}** has been kicked.` }
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
          { type: 10, content: `Failed to kick user.` }
        ]
      }
    ]
  });
}
}
}
