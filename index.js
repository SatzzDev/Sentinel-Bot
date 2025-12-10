// ============== index.js ==============
import {
Client,
GatewayIntentBits,
ContainerBuilder,
TextDisplayBuilder,
MessageFlags,
SectionBuilder,
ButtonBuilder,
ButtonStyle,
StringSelectMenuBuilder,
SeparatorBuilder,
BaseChannel,
AttachmentBuilder,
Message,
Partials,
BaseInteraction,
Collection,
} from "discord.js";
import chalk from "chalk";
import util from "util";
import fs from "fs";
import { createWelcomeCard } from "./lib/canvas.js";
import { fileURLToPath } from "url";
import { dirname, join, relative, sep } from "path";
import { buildMessageComponents } from "./lib/componentsV2Builder.js";
import { createKazagumo } from './lib/kazagumo.js';
import { DISCORD_TOKEN, CLIENT_ID, OWNER_ID } from './config.js'

const __dirname = dirname(fileURLToPath(import.meta.url));


// ============== EXTEND PROTOTYPES ==============
BaseChannel.prototype.sendMessage = async function (...config) {
const { container, attachments } = buildMessageComponents(...config);
const payload = {
components: [container],
flags: MessageFlags.IsComponentsV2,
};
if (attachments.length > 0) payload.files = attachments;
return this.send(payload);
};

Message.prototype.editMsg = async function (...config) {
const { container, attachments } = buildMessageComponents(...config);
const payload = {
components: [container],
flags: MessageFlags.IsComponentsV2,
};
if (attachments.length > 0) payload.files = attachments;
return this.edit(payload);
};


Message.prototype.sendMessage = async function (...config) {
const { container, attachments } = buildMessageComponents(...config);
const payload = {
components: [container],
flags: MessageFlags.IsComponentsV2,
};
if (attachments.length > 0) payload.files = attachments;
return this.reply(payload);
};


Message.prototype.send = async function (...config) {
const { container, attachments } = buildMessageComponents(...config);
const payload = {
components: [container],
flags: MessageFlags.IsComponentsV2,
};
if (attachments.length > 0) payload.files = attachments;
return this.reply(payload);
};


BaseInteraction.prototype.sendMessage = async function (...config) {
const { container, attachments } = buildMessageComponents(...config);
const payload = {
components: [container],
flags: MessageFlags.IsComponentsV2,
};
if (attachments.length > 0) payload.files = attachments;
return this.reply(payload);
};


const originalReply = Message.prototype.reply;
Message.prototype.reply = async function (tek) {
if (typeof tek === "string") {
const payload = {
"flags": 32768,
"components": [
{
"type": 17,
"components": [
{
"type": 10,
"content": tek
},
{
"type": 14
},
{
"type": 10,
"content": "-# Made With ☕ by [Satzz.](https://satzz.cloud)"
}
],
"accent_color": 2621695,
"spoiler": false
}
]
}
return originalReply.call(this, payload);
} else return originalReply.call(this, tek)
};

// ============== DISCORD CLIENT ============== \\
export const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent,
GatewayIntentBits.GuildEmojisAndStickers,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.GuildModeration,
GatewayIntentBits.GuildVoiceStates,
],
partials: [Partials.Channel, Partials.Message, Partials.User],
});

client.logger = (type, text) => {
let tag;
switch (type) {
case "success":
tag = chalk.greenBright("[ SUCCESS ]");
break;
case "error":
tag = chalk.redBright("[ ERROR ]");
break;
case "warn":
tag = chalk.yellowBright("[ WARN ]");
break;
case "info":
default:
tag = chalk.blueBright("[ INFO ]");
break;
}
console.log(`${tag} ${text}`);
};

// ============== COMMANDS LOADER ============== \\
client.commands = new Collection();
const commandsPath = join(__dirname, "commands");
function getAllCommandFiles(dir, base = "commands") {
let results = [];
const list = fs.readdirSync(dir, { withFileTypes: true });
for (const item of list) {
const fullPath = join(dir, item.name);
if (item.isDirectory()) {
results = results.concat(getAllCommandFiles(fullPath, base));
} else if (item.isFile() && item.name.endsWith(".js")) {
const relatives = relative(join(__dirname, base), fullPath);
const parts = relatives.split(sep);
const category = parts.length > 1 ? parts[0] : "Uncategorized";
results.push({ fullPath, category });
}
}
return results;
}

async function loadCommands() {
client.commands.clear();
const files = getAllCommandFiles(commandsPath);
for (const file of files) {
try {
const command = await import(`file://${file.fullPath}`);
if (command.default && command.default.name && command.default.execute) {
command.default.category = file.category;
client.commands.set(command.default.name, command.default);
client.logger(
"info",
`Loaded: ${command.default.category}/${command.default.name}`
);
}
} catch (err) {
client.logger("error", `Failed loading ${file.fullPath} : ${util.format(err)}`);
}
}
client.logger("info", `${client.commands.size} commands active`);
}

// ============== MESSAGE EVENT ============== //
client.on("messageCreate", async (message) => {
if (message.author.bot) return;
if (message.content.startsWith("=>")) {
if (message.author.id !== OWNER_ID)
return message.sendMessage({
type: "text",
content: "❌ Nope. Eval is owner-only.",
});
const code = message.content.slice(2);
if (!code)
return message.sendMessage({
type: "text",
content: "❌ Kasih kodenya dulu.",
});
let result = await eval(code);
if (typeof result !== "string") result = util.inspect(result, { depth: 1 });
if (result.length > 1950) result = result.slice(0, 1950) + "...";
message.reply(`# Eval Result\n\n-# Javascript\n\n\`\`\`\n${result}\n\`\`\``);
}
const prefix = "!";
if (!message.content.startsWith(prefix)) return;
const args = message.content.slice(prefix.length).trim().split(/ +/);
const commandName = args.shift().toLowerCase();
const command = client.commands.get(commandName);
if (!command) return;
try {
await command.execute(message, args, client);
} catch (error) {
client.logger(
"info",
`Error executing command ${commandName}:${util.format(error)}`
);
message.reply("❌ Terjadi error saat menjalankan command!");
}
});

// ============== GREETING EVENT ============== //
client.on("guildMemberAdd", async (member) => {
try {
const buffer = await createWelcomeCard(member.user, member.guild);
let database = {};
try {
const data = fs.readFileSync(join(__dirname, "database.json"), "utf8");
database = JSON.parse(data);
} catch (error) {
client.logger("error", `Error reading database: ${error}`);
}
let channel = member.guild.systemChannel;
if (database[member.guild.id] && database[member.guild.id].welcomeChannel) {
channel = member.guild.channels.cache.get(
database[member.guild.id].welcomeChannel
);
}
if (channel) {
channel.send({
flags: 32768,
files: [{attachment:buffer, name: 'welcome-card.png'}],
components: [
{
type: 17,
accent_color: 181404,
spoiler: false,
components: [
{
type: 12,
items: [
{
media: {
url: "attachment://welcome-card.png"
}
}
]
},
{
type: 10,
content: `# Welcome aboard, ${member.user}\nYou’ve officially landed in a space where ideas evolve, creativity syncs, and the community vibes like a well-structured ecosystem.\nHere, every new member adds a fresh spark — and trust me, we’re all about building momentum.\nFeel free to roam, drop a hello, or dive straight into the convo. This place grows because people like you jump in.\n\n## Getting Started\n\n1. Check the rules — keep the place clean and drama-free, just like a production server.\n2. Peek into the channels — each one has its own purpose, workflow, and energy.\n3. Introduce yourself — we’re a community, not a ghost town.\n4. Grab any roles you need — think of it as configuring your user profile in the system.\n5. If you're lost, ping the mods — they’re basically customer support but with more patience.\n\nYou’re all set. Time to plug in and start building memories.`
},
]
},
]
});
}
} catch (error) {
client.logger("error", `Error generating welcome card:', ${error}`);
}
});

// ============== READY EVENT ============== //
// The ready event has been renamed to clientReady to distinguish it from the gateway READY event and will only emit under that name in v15. Please use clientReady instead.
client.once("clientReady", () => {
client.logger("success", "Connected to Discord API!");
client.logger("success", `Logged in as ${client.user.tag}`);
client.logger("success", `Loaded ${client.commands.size} commands`);
});

// ============== LOAD COMMAND ON STARTUP ============== //
await loadCommands();
client.kazagumo = createKazagumo(client);
// ============== DISCORD LOGIN ============== //
await client.login(DISCORD_TOKEN);

// ============== COMMAND RELOAD ============== //
fs.watch(commandsPath, { recursive: true }, (eventType, filename) => {
if (filename && filename.endsWith(".js")) {
client.logger(
"info",
`Detected change in ${filename}, reloading commands...`
);
loadCommands();
}
});
