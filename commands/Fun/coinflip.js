export default {
  name: "coinflip",
  description: "Flip a coin (heads or tails)",
  async execute(message, args, client) {
    try {
      const res = Math.random() < 0.5 ? "Heads 🪙" : "Tails 🪙";
      return message.reply({
        flags: 32768,
        components: [
          {
            type: 17,
            accent_color: 58878,
            components: [{ type: 10, content: `**Coinflip:** ${res}` }],
          },
        ],
      });
    } catch (error) {
      console.error(error);
    }
  },
};
