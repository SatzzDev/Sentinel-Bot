import { PermissionFlagsBits } from "discord.js";

export default {
  name: "deepclean",
  description:
    "Delete ALL bot messages + prefixed user messages in this channel.",

  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages))
      return message.reply(
        "<:Close:1446440902276153489> You don’t have the required permissions."
      );

    const prefix = "!";
    let total = 0;
    let lastId = null;

    while (true) {
      const msgs = await message.channel.messages.fetch({
        limit: 100,
        ...(lastId && { before: lastId }),
      });

      if (msgs.size === 0) break;

      const target = msgs.filter(
        (m) =>
          m.author.bot || m.content.startsWith(".") || m.content.startsWith("!")
      );

      for (const m of target.values()) {
        await m.delete().catch(() => {});
      }

      total += target.size;
      lastId = msgs.last().id;

      await new Promise((r) => setTimeout(r, 500));
    }

    message.channel.send(`Selesai. ${total} pesan disapu bersih 🧹✨`);
  },
};
