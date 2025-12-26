export default {
  name: "hug",
  description: "Send a hug to someone",
  async execute(message, args, client) {
    try {
      const gifs = [
        "https://media.giphy.com/media/l2QDM9Jnim1YVILXa/giphy.gif",
        "https://media.giphy.com/media/od5H3PmEG5EVq/giphy.gif",
        "https://media.giphy.com/media/wnsgren9NtITS/giphy.gif",
      ];
      const gif = gifs[Math.floor(Math.random() * gifs.length)];
      const target = message.mentions.users.first() || null;
      const who = target ? `<@${target.id}>` : "themselves";
      return message.reply({
        flags: 32768,
        components: [
          {
            type: 17,
            accent_color: 58878,
            components: [
              { type: 12, items: [{ media: { url: gif } }] },
              { type: 10, content: `🤗 **${message.author.username}** gives a hug to **${who}**` },
            ],
          },
        ],
      });
    } catch (error) {
      console.error(error);
    }
  },
};
