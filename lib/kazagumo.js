import { Kazagumo } from "kazagumo";
import { Connectors } from "shoukaku";

// Konfigurasi Node Lavalink
export const Nodes = [
  {
    name: "main",
    url: "lavalink.jirayu.net:13592",
    auth: "youshallnotpass",
    secure: false,
  },
  // Tambahkan node backup jika diperlukan
  // {
  //   name: "backup",
  //   url: "backup.lavalink.com:443",
  //   auth: "password123",
  //   secure: true,
  // }
];

// Fungsi untuk membuat Kazagumo instance
export function createKazagumo(client) {
  const kazagumo = new Kazagumo(
    {
      defaultSearchEngine: "youtube",
      // Function untuk mengirim data ke Discord Gateway
      send: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
      },
    },
    new Connectors.DiscordJS(client),
    Nodes
  );

  // ===== SHOUKAKU EVENTS (Lavalink Connection) =====
  kazagumo.shoukaku.on("ready", (name) => {
    console.log(`✅ Lavalink ${name}: Ready!`);
  });

  kazagumo.shoukaku.on("error", (name, error) => {
    console.error(`❌ Lavalink ${name}: Error Caught,`, error);
  });

  kazagumo.shoukaku.on("close", (name, code, reason) => {
    console.warn(
      `⚠️ Lavalink ${name}: Closed, Code ${code}, Reason ${
        reason || "No reason"
      }`
    );
  });

  kazagumo.shoukaku.on("debug", (name, info) => {
    console.debug(`🔍 Lavalink ${name}: Debug,`, info);
  });

  kazagumo.shoukaku.on("disconnect", (name, count) => {
    const players = [...kazagumo.shoukaku.players.values()].filter(
      (p) => p.node.name === name
    );
    players.map((player) => {
      kazagumo.destroyPlayer(player.guildId);
      player.destroy();
    });
    console.warn(`🔌 Lavalink ${name}: Disconnected`);
  });

  // ===== KAZAGUMO EVENTS (Player Events) =====

  // Event ketika track mulai diputar
  kazagumo.on("playerStart", async (player, track) => {
    console.log(`🎵 Now playing: ${track.title} in guild ${player.guildId}`);

    try {
      // Ambil channel dan gunakan sendMessage
      const textChannel = client.channels.cache.get(player.textId);
      if (!textChannel) return;

      // Cek apakah channel punya method sendMessage (custom util)
      if (textChannel.sendMessage) {
        const msg = await textChannel.sendMessage([
          {
            type: "text",
            content: "<:Music:1446441038540439634> **Now Playing**",
          },
          {
            type: "section",
            texts: [`[${track.title} - ${track.author}] (${track.uri})`],
            thumbnail: track.thumbnail ? { url: track.thumbnail } : undefined,
          },
          {
            type: "separator",
          },
          {
            type: "buttons",
            buttons: [
              {
                url: track.uri,
                emoji: { name: "Link", id: "1446440997318951022" },
              },
            ],
          },
        ]);

        // Simpan message untuk di-edit nanti
        player.data.set("message", msg);
      } else {
        // Fallback ke send biasa jika sendMessage tidak tersedia
        const msg = await textChannel.send({
          content: `🎵 Now playing **${track.title}** by **${track.author}**`,
        });
        player.data.set("message", msg);
      }
    } catch (error) {
      console.error("Error sending playerStart message:", error);
    }
  });

  // Event ketika track selesai diputar
  kazagumo.on("playerEnd", (player, track) => {
    console.log(`⏹️ Finished playing in guild ${player.guildId}`);
  });

  // Event ketika queue kosong
  // kazagumo.on("playerEmpty", async (player) => {
  //   console.log(
  //     `📭 Queue empty in guild ${player.guildId}, destroying player...`
  //   );

  //   try {
  //     const textChannel = client.channels.cache.get(player.textId);
  //     if (!textChannel) return;

  //     if (textChannel.sendMessage) {
  //       await textChannel.sendMessage([
  //         {
  //           type: "text",
  //           content:
  //             "👋 **Queue Ended**\n\nDestroyed player due to inactivity.",
  //         },
  //       ]);
  //     } else {
  //       await textChannel.send({
  //         content: "👋 Destroyed player due to inactivity.",
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error sending playerEmpty message:", error);
  //   }

  //   player.destroy();
  // });

  // Event ketika player ditutup
  kazagumo.on("playerClosed", (player, data) => {
    console.log(`🔒 Player closed in guild ${player.guildId}`);
  });

  // Event ketika terjadi error saat resolve track
  kazagumo.on("playerResolveError", async (player, track, error) => {
    console.error(`❌ Player resolve error in guild ${player.guildId}:`, error);

    try {
      const textChannel = client.channels.cache.get(player.textId);
      if (!textChannel) return;

      if (textChannel.sendMessage) {
        await textChannel.sendMessage([
          {
            type: "text",
            content: `❌ **Failed to Load Track**\n\n${track.title}\n\nSkipping to next track...`,
          },
        ]);
      } else {
        await textChannel.send({
          content: `❌ Failed to load track: **${track.title}**. Skipping...`,
        });
      }
    } catch (err) {
      console.error("Error sending playerResolveError message:", err);
    }
  });

  // Event ketika terjadi exception pada player
  kazagumo.on("playerException", async (player, data) => {
    console.error(`❌ Player exception in guild ${player.guildId}:`, data);

    try {
      const textChannel = client.channels.cache.get(player.textId);
      if (!textChannel) return;

      if (textChannel.sendMessage) {
        await textChannel.sendMessage([
          {
            type: "text",
            content: `❌ **Playback Error**\n\nAn error occurred while playing. Skipping track...`,
          },
        ]);
      } else {
        await textChannel.send({
          content: "❌ An error occurred while playing. Skipping track...",
        });
      }
    } catch (err) {
      console.error("Error sending playerException message:", err);
    }
  });

  // Event ketika player di-update
  kazagumo.on("playerUpdate", (player, data) => {
    // Optional: Log player updates untuk debugging
    // console.log(`🔄 Player update in guild ${player.guildId}`);
  });

  return kazagumo;
}
