export default {
  name: "say",
  description: "Make the bot repeat a message",
  async execute(message, args, client) {
    try {
      const text = args.join(" ");
      if (!text)
        return message.reply({
          flags: 32768,
          components: [
            {
              type: 17,
              accent_color: 58878,
              components: [{ type: 10, content: "❗ Beri teks untuk diulang. Contoh: !say halo semuanya" }],
            },
          ],
        });
      // send as normal channel message
      return message.channel.send({ content: text }).catch((e) => console.error(e));
    } catch (error) {
      console.error(error);
    }
  },
};
