import fs from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  name: "addemojis",
  description: "Add all emojis from the emoji folder to the specified server",
  async execute(message, args, client) {
    const guildId = "1446267079840763925";
    const guild = client.guilds.cache.get(guildId);
    if (!guild) {
      return message.sendMessage({
        type: "text",
        content:
          "<:Close:1446440902276153489> Bot is not in the specified server or invalid server ID.",
      });
    }

    // Check permissions
    if (!guild.members.me.permissions.has("ManageEmojisAndStickers")) {
      return message.sendMessage({
        type: "text",
        content:
          "<:Close:1446440902276153489> Bot does not have permission to manage emojis in this server.",
      });
    }

    const emojiFolder = join(__dirname, "../../emoji");
    const files = fs
      .readdirSync(emojiFolder)
      .filter((file) => file.endsWith(".png"));

    if (files.length === 0) {
      return message.sendMessage({
        type: "text",
        content:
          "<:Close:1446440902276153489> No PNG files found in the emoji folder.",
      });
    }

    let added = 0;
    let failed = 0;
    const results = [];

    for (const file of files) {
      const filePath = join(emojiFolder, file);
      const name = file.replace(".png", "").toLowerCase(); // Discord emoji names are lowercase

      try {
        await guild.emojis.create({ attachment: filePath, name });
        message.sendMessage([{ type: "text", content: `✅ Added: ${name}` }]);
        results.push(`✅ Added: ${name}`);
        added++;
      } catch (error) {
        results.push(
          `<:Close:1446440902276153489> Failed to add ${name}: ${error.message}`
        );
        failed++;
      }

      // Add a small delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const summary = `Added ${added} emojis, failed ${failed}.\n\n${results.join(
      "\n"
    )}`;
    message.sendMessage([{ type: "text", content: summary }]);
  },
};
