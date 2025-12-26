export default {
  name: "roll",
  description: "Roll dice. Examples: !roll d20, !roll 2d6",
  async execute(message, args, client) {
    try {
      const input = args[0] || "d6";
      const match = input.match(/^(\d*)d(\d+)$/i);
      let total = 0;
      let detail = "";
      if (match) {
        let count = parseInt(match[1]) || 1;
        const sides = parseInt(match[2]);
        if (count > 100) count = 100;
        const rolls = [];
        for (let i = 0; i < count; i++) {
          const r = Math.floor(Math.random() * sides) + 1;
          rolls.push(r);
          total += r;
        }
        detail = `${rolls.join(", ")} (total ${total})`;
      } else {
        // try simple number
        const sides = parseInt(input.replace(/d/i, "")) || 6;
        const r = Math.floor(Math.random() * sides) + 1;
        total = r;
        detail = `${r}`;
      }
      return message.reply({
        flags: 32768,
        components: [
          {
            type: 17,
            accent_color: 58878,
            components: [{ type: 10, content: `🎲 Rolled ${input}: ${detail}` }],
          },
        ],
      });
    } catch (error) {
      console.error(error);
    }
  },
};
