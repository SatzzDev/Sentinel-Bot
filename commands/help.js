import util from "node:util";

export default {
name: "help",
description: "Show all commands with navigation",
async execute(message, args, client) {
try {
const categoryIcons = {
Music: "<:Music:1446441038540439634>",
Owner: "<:King:1446440984178200666>",
Information: "<:Information:1446440977458790571>",
Utility: "<:Hammer2:1446440965131993190>",
Moderation: "<:Moderator:1446441028537024574>",
};

const grouped = {};

for (const cmd of client.commands.values()) {
if (cmd.name === "help") continue;
const category = cmd.category || "Uncategorized";
if (!grouped[category]) grouped[category] = [];
grouped[category].push(cmd);
}

const pages = [];
let pageIndex = 0;

// ====== PAGE 1: INTRO ======
pages.push({
title: "<:Book:1446446420566478940> Welcome",
content:
"**Welcome to the Command Center.**\n" +
"You’re now accessing the core control panel of this system — the place where every feature, tool, and workflow is neatly organized for operational excellence.\n" +
"Use the navigation buttons below to explore categories, review capabilities, and optimize how you interact with the bot.\n\n" +
"**Getting Started:**\n" +
"- Review each category to understand the available functionality\n" +
"- All commands are triggered using the ! prefix\n" +
"- Select Next to move through the directory\n" +
"Efficiency is the priority — take your time, explore, execute"
});

// ====== OTHER PAGES FOR EACH CATEGORY ======
for (const category in grouped) {
const icon =
categoryIcons[category] || "<:Interrogation:1446443210749509672>";

let text = `## ${icon} ${category}\n`;
for (const cmd of grouped[category]) {
text += `- **!${cmd.name}** — ${
cmd.description || "No description"
}\n`;
}

pages.push({
title: `${icon} ${category}`,
content: text.trim(),
});
}

pages.push({
title: "📌 Summary",
content:
`Total Commands: **${client.commands.size}**\n` +
"Thanks for using this bot — keep building greatness."
});

const generatePayload = () => ({
flags: 32768,
components: [
{
type: 17,
accent_color: 58878,
components: [
{
type: 10,
content: pages[pageIndex].content,
},
{
type: 1,
components: [
{
type: 2,
style: 2,
custom_id: "back",
label: "Back",
disabled: pageIndex === 0,
},
{
type: 2,
style: 2,
custom_id: "next",
label: "Next",
disabled: pageIndex === pages.length - 1,
},
],
},
],
},
],
});

const msg = await message.reply(generatePayload());

const collector = msg.createMessageComponentCollector({
time: 60_000,
});

collector.on("collect", async (i) => {
if (i.user.id !== message.author.id) return i.deferUpdate();
if (i.customId === "next") pageIndex++;
if (i.customId === "back") pageIndex--;
await i.update(generatePayload());
});

collector.on("end", async () => {
msg.edit({
components: [],
}).catch(() => {});
});
} catch (error) {
console.error(util.format(error));
}
},
};
