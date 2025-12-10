import util from "node:util"
export default {
name: "help",
description: "Show all commands by category",
async execute(message, args, client) {
try {
// 🎨 Mapping kategori ke icon
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

let output = "";

for (const category in grouped) {
// Ambil icon dari mapping, fallback ke default icon
const icon =
categoryIcons[category] || "<:Interrogation:1446443210749509672>";

output += `## ${icon} ${category}\n`;
for (const cmd of grouped[category]) {
output += `- **.${cmd.name}** — ${
cmd.description || "No description"
}\n`;
}
output += "\n";
}

await message.reply({
"flags": 32768,
"components": [
{
"type": 17,
"accent_color": 58878,
"spoiler": false,
"components": [
{
"type": 10,
"content": "<:Book:1446446420566478940> Command Directory"
},
{
"type": 10,
"content": output.trim()
},
{
"type": 10,
"content": `Total Commands: ${client.commands.size}`
},
{
"type": 1,
"components": [
{
"type": 2,
"style": 5,
"emoji": {
"id": "1446440997318951022",
"name": "Link",
"animated": false
},
"url": "https://github.com/SatzzDev",
},
{
"type": 2,
"style": 5,
"emoji": {
"id": "1446446420566478940",
"name": "Book",
"animated": false
},
"url": "https://discord.js.org/",
}
]
}
]
}
]
});
} catch (error) {
console.error(util.format(error));
}
},
};
