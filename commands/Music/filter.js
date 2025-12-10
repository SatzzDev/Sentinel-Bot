import { ApplicationCommandOptionType } from "discord.js";

const validFilters = [
  "bassboost",
  "8D",
  "vaporwave",
  "nightcore",
  "phaser",
  "tremolo",
  "vibrato",
  "reverse",
  "treble",
  "normalizer",
  "surrounding",
  "pulsator",
  "subboost",
  "karaoke",
  "flanger",
  "gate",
  "haas",
  "mcompand",
  "mono",
  "mBass",
];

export default {
  name: "filter",
  aliases: [],
  category: "Music",
  description: "Apply audio filters to the current playing track",
  usage: "filter <filterName>",
  voiceChannel: true,
  async execute(message, args) {
    const { member, guild } = message;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      return message.sendMessage([
        {
          type: "text",
          content: "❌ **Voice Channel Required**\n\nYou need to be in a voice channel to use filters!",
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
          content: `❌ **Missing filter name**\n\nAvailable filters: ${validFilters.join(", ")}`,
        },
      ]);
    }

    const filterName = args[0].toLowerCase();

    if (!validFilters.includes(filterName)) {
      return message.sendMessage([
        {
          type: "text",
          content: `❌ **Invalid filter name**\n\nAvailable filters: ${validFilters.join(", ")}`,
        },
      ]);
    }

    try {
      const enabling = !player.filters[filterName];
      await player.setFilters({ [filterName]: enabling });
      return message.sendMessage([
        {
          type: "text",
          content: `${enabling ? "✅ Enabled" : "❌ Disabled"} filter: ${filterName}`,
        },
      ]);
    } catch (error) {
      console.error("Error applying filter:", error);
      return message.sendMessage([
        {
          type: "text",
          content: `❌ **Filter error:** ${error.message || error}`,
        },
      ]);
    }
  },
};
