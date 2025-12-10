import { ApplicationCommandOptionType } from "discord.js";

export default {
  name: "playpause",
  aliases: ["pp"],
  category: "Music",
  description: "Toggle play/pause in the current music player",
  usage: "playpause",
  voiceChannel: true,
  async execute(message, args) {
    const { member, guild } = message;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return message.sendMessage([
        {
          type: "text",
          content:
            "❌ **Voice Channel Required**\n\nYou need to be in a voice channel to use this command!",
        },
      ]);
    }

    const player = message.client.kazagumo.players.get(guild.id);
    if (!player || (!player.playing && !player.paused)) {
      return message.sendMessage([
        {
          type: "text",
          content: "❌ **No active player found.**",
        },
      ]);
    }

    if (player.paused) {
      await player.resume();
      return message.sendMessage([
        {
          type: "text",
          content: "▶️ Resumed the player.",
        },
      ]);
    } else {
      await player.pause();
      return message.sendMessage([
        {
          type: "text",
          content: "⏸️ Paused the player.",
        },
      ]);
    }
  },
};
