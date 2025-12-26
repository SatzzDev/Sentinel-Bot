import fs from "fs";
import { join } from "path";

const DB_PATH = join(new URL("..", import.meta.url).pathname.replace(/\/$/, ""), "../database.json");

function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(raw || "{}");
  } catch (e) {
    return {};
  }
}

function writeDB(db) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
  } catch (e) {
    console.error("Failed to write DB:", e);
  }
}

export default {
  name: "afk",
  description: "Set yourself as AFK with an optional reason",
  async execute(message, args, client) {
    try {
      const reason = args.join(" ") || "AFK";
      const guildId = message.guild ? message.guild.id : "dm";
      const db = readDB();
      if (!db[guildId]) db[guildId] = {};
      if (!db[guildId].afk) db[guildId].afk = {};
      db[guildId].afk[message.author.id] = {
        reason,
        since: Date.now(),
      };
      writeDB(db);

      return message.reply({
        flags: 32768,
        components: [
          {
            type: 17,
            accent_color: 58878,
            components: [{ type: 10, content: `✅ You are now AFK: ${reason}` }],
          },
        ],
      });
    } catch (error) {
      console.error(error);
    }
  },
};
