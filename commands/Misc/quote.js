export default {
  name: "quote",
  description: "Show quote of the day or a random quote (uses ZenQuotes API)",
  async execute(message, args, client) {
    try {
      const mode = args[0] ? args[0].toLowerCase() : "today";
      let quoteObj = null;

      // Try fetching from ZenQuotes API if available
      if (typeof fetch === "function") {
        try {
          if (mode === "random") {
            const res = await fetch("https://zenquotes.io/api/random");
            const data = await res.json();
            if (Array.isArray(data) && data.length) quoteObj = { text: data[0].q, author: data[0].a };
          } else {
            const res = await fetch("https://zenquotes.io/api/today");
            const data = await res.json();
            if (Array.isArray(data) && data.length) quoteObj = { text: data[0].q, author: data[0].a };
          }
        } catch (e) {
          console.error("Quote API fetch failed:", e);
        }
      }

      // Fallback local quotes if API unavailable or failed
      if (!quoteObj) {
        const quotes = [
          { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
          { text: "Life is 10% what happens to us and 90% how we react to it.", author: "Charles R. Swindoll" },
          { text: "Do not watch the clock. Do what it does. Keep going.", author: "Sam Levenson" },
          { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
          { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
          { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
          { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
          { text: "The purpose of our lives is to be happy.", author: "Dalai Lama" },
          { text: "Get busy living or get busy dying.", author: "Stephen King" },
          { text: "You only live once, but if you do it right, once is enough.", author: "Mae West" },
        ];

        if (mode === "random") {
          quoteObj = quotes[Math.floor(Math.random() * quotes.length)];
        } else {
          const today = new Date().toISOString().slice(0, 10);
          let hash = 0;
          for (let i = 0; i < today.length; i++) {
            hash = (hash << 5) - hash + today.charCodeAt(i);
            hash |= 0;
          }
          const idx = Math.abs(hash) % quotes.length;
          quoteObj = quotes[idx];
        }
      }

      const header = mode === "random" ? "💬 Random Quote" : "💡 Quote of the Day";
      const content = `${header}\n\n"${quoteObj.text}"\n— ${quoteObj.author || "Unknown"}`;

      return message.reply({
        flags: 32768,
        components: [
          {
            type: 17,
            accent_color: 58878,
            components: [{ type: 10, content }],
          },
        ],
      });
    } catch (error) {
      console.error(error);
    }
  },
};
