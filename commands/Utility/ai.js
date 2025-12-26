import OpenAI from 'openai';




export default {
  name: "ai",
  description: "Ask AI something",
  category: "Utility",

  async execute(message, args, client) {
    const sentinel = new OpenAI({
  apiKey: 'ddc-a4f-5a2fa37f060b4d71a969d087aa9d3e13',
  baseURL: 'https://api.a4f.co/v1',
});
    const query = args.join(" ");
if (!query) return message.reply({
  components: [
    {
      type: 17,
      components: [
        { type: 10, content: "input query!" }
      ]
    }
  ]
});

await message.channel.sendTyping();

const res = await sentinel.chat.completions.create({
    model: "provider-3/llama-4-maverick",
    messages: [
      { role: "system", content: "You are a helpful assistant that provides concise and accurate answers. you're name is Sentinel, made by Satzz. use discord message formatting, # this is h1, ## h2 and ## h3, - list and more" },
      { role: "user", content: query },
    ],
  });
    await message.sendMessage([{ type: "text", content: res.choices[0].message.content }]);
  },
};

