export default {
  name: "8ball",
  description: "Ask the magic 8-ball",
  async execute(message, args, client) {
    try {
      const question = args.join(" ");
      if (!question)
        return message.reply({
          flags: 32768,
          components: [
            {
              type: 17,
              accent_color: 58878,
              components: [{ type: 10, content: "❓ Tanyakan sesuatu dulu, mis. !8ball apakah hari ini akan hujan?" }],
            },
          ],
        });
      const responses = [
        "It is certain.",
        "Without a doubt.",
        "You may rely on it.",
        "Ask again later.",
        "Better not tell you now.",
        "Don't count on it.",
        "My sources say no.",
        "Very doubtful.",
      ];
      const answer = responses[Math.floor(Math.random() * responses.length)];
      return message.reply({
        flags: 32768,
        components: [
          {
            type: 17,
            accent_color: 58878,
            components: [{ type: 10, content: `🎱 **Q:** ${question}\n**A:** ${answer}` }],
          },
        ],
      });
    } catch (error) {
      console.error(error);
    }
  },
};
