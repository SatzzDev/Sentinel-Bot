import { ApplicationCommandOptionType } from "discord.js";

export default {
  name: "play",
  aliases: ["p"],
  category: "Music",
  description: "Play music from YouTube using Lavalink and Kazagumo",
  usage: "play <song name or url>",
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

    if (!args.length) {
      return message.sendMessage([
        {
          type: "text",
          content:
            "❌ **Missing Query**\n\nPlease provide a song name or URL!\n\n**Usage:**\n• `.play <song name or URL> [--loop]`",
        },
      ]);
    }

    // Parse loop flag
    const hasLoopFlag = args.includes("--loop") || args.includes("-loop");

    // Filter out loop flags from query
    const query = args
      .filter((arg) => arg !== "--loop" && arg !== "-loop")
      .join(" ");

    if (!query) {
      return message.sendMessage([
        {
          type: "text",
          content:
            "❌ **Empty Query**\n\nPlease provide a song name or URL after removing flags!",
        },
      ]);
    }

    try {

      let player = message.client.kazagumo.players.get(message.guild.id)
      if (!player) {
      player = await message.client.kazagumo.createPlayer({
        loadBalancer: true,
        guildId: guild.id,
        textId: channel.id,
        voiceId: voiceChannel.id,
        volume: 100,
        deaf: true,
      });
    }
      // Search for tracks
      const result = await message.client.kazagumo.search(query, {
        requester: member.user,
      });

      if (!result.tracks.length) {
        return message.sendMessage([
          {
            type: "text",
            content: `❌ **Track Not Found**\n\nNo results found for **${query}**.\n\nTry using a more specific name or URL.`,
          },
        ]);
      }

      // Handle playlist vs single track
      if (result.type === "PLAYLIST") {
        player.queue.add(result.tracks);

        await message.reply({
  "flags": 32768,
  "components": [
    {
      "type": 17,
      "accent_color": null,
      "spoiler": true,
      "components": [
        {
          "type": 9,
          "components": [
            {
              "type": 10,
              "content": `### <:Check:1446440889646846004> Playlist Added to Queue\n${result.playlistName}\n-# ${result.tracks.length} Tracks`
            }
          ],
          "accessory": {
            "type": 11,
            "media": {
              "url": "https://www.freepnglogos.com/uploads/spotify-logo-png/spotify-icon-green-logo-8.png"
            },
          }
        }
      ]
    }
  ]
});
      } else {
        if (player.playing) return
        const track = result.tracks[0];
        player.queue.add(track);
        message.reply({
  "flags": 32768,
  "components": [ {
    "type": 17,
    "accent_color": null,
    "components": [
      {
        "type": 9,
        "components": [
          {
            "type": 10,
            "content": `### <:Check:1446440889646846004> Added to Queue\n[${track.title} - ${track.author}](${track.uri})`
          }
        ],
        "accessory": {
          "type": 11,
          "media": {
            "url": track.thumbnail
          }
        }
      }
    ]
  }]});
      }
      if (!player.playing && !player.paused) {
        await player.play();
      }
    } catch (error) {
      console.error("❌ Error playing track:", error);
      return message.sendMessage([
        {
          type: "text",
          content: `❌ **Playback Error**\n\nSomething went wrong while playing the track.\n\n**Error:** ${
            error.message || error
          }`,
        },
      ]);
    }
  },
};
