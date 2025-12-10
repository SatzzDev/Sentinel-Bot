import { ApplicationCommandOptionType } from "discord.js";

export default {
  name: "stop",
  aliases: ["st"],
  category: "Music",
  description: "Stop the player",
  usage: "stop",
  voiceChannel: true,
  async execute(message, args) {
    const { member, guild, channel } = message;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return message.sendMessage([
        {
          type: "text",
          content:
            "❌ **Voice Channel Required**\n\nYou need to be in a voice channel to play music!",
        },
      ]);
    }

    let player = message.client.kazagumo.players.get(guild.id);
    if (!player)
      return message.sendMessage([
        {
          type: "text",
          content: "❌ **No Player Found.**\n\n",
        },
      ]);
    player.destroy();
    return message.sendMessage([
      {
        type: "text",
        content: "Player *Stopped*.",
      },
    ]);
  },
};
