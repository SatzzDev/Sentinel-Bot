import { fetch } from "undici";

export default {
  name: "google",
  description: "Ask Google AI something",
  category: "Utility",

  async execute(message, args, client) {
    const query = args.join(" ");
    if (!query) return message.reply("masukin pertanyaan dulu lah 😭");

    await message.channel.sendTyping();

    const url = `https://www.searchapi.io/api/v1/search?api_key=BLScazexjBZXawiAroPk6dY2&engine=google_ai_mode&q=${encodeURIComponent(
      query
    )}`;
    const req = await fetch(url);
    const data = await req.json();

    // Parse markdown ke text_blocks structure
    const textBlocks = parseMarkdownToBlocks(data.markdown);

    // Format untuk Discord
    const formattedText = formatBlocksForDiscord(textBlocks);

    const links = (data.reference_links || []).slice(0, 3);
    const buttons = links.map((l) => ({
      label: l.title.length > 30 ? l.title.slice(0, 30) + "…" : l.title,
      url: l.link,
      emoji: "🔗",
    }));
    await message.sendMessage([{ type: "text", content: formattedText }]);
  },
};

function parseMarkdownToBlocks(markdown) {
  if (!markdown) return [];

  const blocks = [];
  const lines = markdown.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith("# ")) {
      blocks.push({ type: "header", answer: line.slice(2) });
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      // Collect list items
      const items = [];
      while (
        i < lines.length &&
        (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* "))
      ) {
        items.push({ type: "paragraph", answer: lines[i].trim().slice(2) });
        i++;
      }
      i--; // Step back one
      blocks.push({ type: "unordered_list", items });
    } else if (line) {
      blocks.push({ type: "paragraph", answer: line });
    }
  }

  return blocks;
}

function formatBlocksForDiscord(blocks) {
  return blocks
    .map((block) => {
      switch (block.type) {
        case "header":
          return `\n**${block.answer}**\n`;
        case "paragraph":
          return block.answer;
        case "unordered_list":
          return block.items.map((item) => `• ${item.answer}`).join("\n");
        default:
          return "";
      }
    })
    .join("\n");
}
