import { ApplicationCommandOptionType } from "discord.js";

export default {
  name: "shuffle",
  aliases: ["sf"],
  category: "Music",
  description: "Shuffle Queue",
  usage: "shuffle",
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
    player.queue.shuffle();
    return message.sendMessage([
      {
        type: "text",
        content: `Shuffled ${player.queue.size} tracks in queue`,
      },
    ]);
  },
};
