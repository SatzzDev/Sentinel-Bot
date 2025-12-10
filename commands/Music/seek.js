import { ApplicationCommandOptionType } from "discord.js";

export default {
  name: "seek",
  aliases: [],
  category: "Music",
  description: "Seek to a specific time in the current track",
  usage: "seek <time in seconds>",
  voiceChannel: true,
  async execute(message, args) {
    const { member, guild } = message;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return message.sendMessage([
        {
          type: "text",
          content: "❌ **Voice Channel Required**\n\nYou need to be in a voice channel to seek a track!",
        },
      ]);
    }

    const player = message.client.kazagumo.players.get(guild.id);
    if (!player || !player.playing) {
      return message.sendMessage([
        {
          type: "text",
          content: "❌ **No active player found.**",
        },
      ]);
    }

    if (!args.length) {
      return message.sendMessage([
        {
          type: "text",
          content: "❌ **Missing time argument**\n\nUsage: `.seek <time in seconds>`",
        },
      ]);
    }

    const time = Number(args[0]);
    if (isNaN(time) || time < 0 || time > player.current.duration / 1000) {
      return message.sendMessage([
        {
          type: "text",
          content: `❌ **Invalid time**\n\nPlease provide a time between 0 and ${Math.floor(player.current.duration / 1000)} seconds.`,
        },
      ]);
    }

    try {
      await player.seek(time * 1000);
      return message.sendMessage([
        {
          type: "text",
          content: `⏩ Seeked to ${time} seconds.`,
        },
      ]);
    } catch (error) {
      console.error("Error seeking:", error);
      return message.sendMessage([
        {
          type: "text",
          content: `❌ **Seek error:** ${error.message || error}`,
        },
      ]);
    }
  },
};
