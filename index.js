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


const buildPayload = (...config) => {
const { container, attachments } = buildMessageComponents(...config);
const payload = {
components: [container],
flags: MessageFlags.IsComponentsV2,
};
if (attachments.length > 0) payload.files = attachments;
return payload;
};

// ============== EXTEND PROTOTYPES ==============
BaseChannel.prototype.sendMessage = async function (...config) {
return this.send(buildPayload(...config));
};

Message.prototype.editMsg = async function (...config) {
return this.edit(buildPayload(...config));
};

Message.prototype.sendMessage = async function (...config) {
return this.reply(buildPayload(...config));
};

Message.prototype.send = async function (...config) {
return this.reply(buildPayload(...config));
};

BaseInteraction.prototype.sendMessage = async function (...config) {
return this.reply(buildPayload(...config));
};




const originalReply = Message.prototype.reply;
Message.prototype.reply = async function (tek) {
if (typeof tek === "string") {
const payload = {
flags: MessageFlags.IsComponentsV2,
components: [
{
type: 17,
accent_color: 2621695,
spoiler: false,
components: [
{
type: 10,
content: tek,
},
{
type: 14,
spacing: 2
},
{
type: 10,
content: "-# Made With ☕ by [Satzz.](https://satzz.cloud)",
},
],
},
],
};
return originalReply.call(this, payload);
} else return originalReply.call(this, tek);
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
	// --- AFK handling: clear AFK when user returns, and notify when mentioned/replied to ---
	try {
		const dbPath = join(__dirname, "database.json");
		let database = {};
		try {
			const data = fs.readFileSync(dbPath, "utf8");
			database = JSON.parse(data || "{}");
		} catch (e) {
			database = {};
		}

		const guildId = message.guild ? message.guild.id : "dm";

		// If author was AFK, remove AFK and notify
		if (database[guildId] && database[guildId].afk && database[guildId].afk[message.author.id]) {
			const entry = database[guildId].afk[message.author.id];
			delete database[guildId].afk[message.author.id];
			try {
				fs.writeFileSync(dbPath, JSON.stringify(database, null, 2), "utf8");
			} catch (e) {
				console.error("Failed to write database.json:", e);
			}
			const deltaMs = Date.now() - entry.since;
			const minutes = Math.floor(deltaMs / 60000);
			const timeStr = minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;
			message.reply(`Welcome back! I removed your AFK (was: ${entry.reason}, ${timeStr} ago).`);
		}

		// Notify if message mentions AFK users
		const notified = new Set();
		if (message.mentions && message.mentions.users) {
			for (const [id, user] of message.mentions.users) {
				if (database[guildId] && database[guildId].afk && database[guildId].afk[id] && id !== message.author.id) {
					const e = database[guildId].afk[id];
					const deltaMs = Date.now() - e.since;
					const minutes = Math.floor(deltaMs / 60000);
					const timeStr = minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;
					message.reply({
						flags: MessageFlags.Ephemeral,
						components: [
							{
								type: 17,
								accent_color: 16753920,
								components: [
									{ type: 10, content: `<@${id}> is currently AFK: ${e.reason} (since ${timeStr} ago)` },
								],
							},
						],
					}).catch(() => {});
					notified.add(id);
				}
			}
		}

		// If this message is a reply, check referenced message author for AFK
		if (message.reference && message.reference.messageId) {
			try {
				const ref = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
				if (ref && ref.author && ref.author.id !== message.author.id && !notified.has(ref.author.id)) {
					const id = ref.author.id;
					if (database[guildId] && database[guildId].afk && database[guildId].afk[id]) {
						const e = database[guildId].afk[id];
						const deltaMs = Date.now() - e.since;
						const minutes = Math.floor(deltaMs / 60000);
						const timeStr = minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;
						message.reply({
							flags: MessageFlags.Ephemeral,
							components: [
								{
									type: 17,
									accent_color: 16753920,
									components: [
										{ type: 10, content: `<@${id}> is currently AFK: ${e.reason} (since ${timeStr} ago)` },
									],
								},
							],
						}).catch(() => {});
					}
				}
			} catch (e) {
				// ignore fetch errors
			}
		}
	} catch (e) {
		console.error("AFK handler error:", e);
	}
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


const WELCOME_FLAG = 32768 // Replace 32768 with proper flag constant

// ============== GREETING EVENT ============== //
client.on("guildMemberAdd", async (member) => {
try {
const buffer = await createWelcomeCard(member.user, member.guild, { style: 'modern', theme: 'neon' });
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
  "flags": 32768,
  "components": [
    {
      "type": 17,
      "components": [
        {
          "type": 9,
          "components": [
            {
              "type": 10,
              "content": `<a:LETTER_W:1450778062240354324><a:LETTER_E:1450778043906789478><a:LETTER_L:1450778087368167536><a:LETTER_C:1450778047337861192><a:LETTER_O:1450778050173341850><a:LETTER_M:1450778059149152297><a:LETTER_E:1450778043906789478>\n<a:32877animatedarrowbluelite:1450777021968809986> ${member.user}`
            }
          ],
          "accessory": {
            "type": 11,
            "media": {
              "url": member.user.avatarURL({ format: "png", size: 512 })
            },
          }
        },
        {
          "type": 14,
          "spacing": 1
        },
        {
          "type": 10,
          "content": "### Getting Started:\n**<a:32877animatedarrowbluelite:1450777021968809986> Check the rules**\n**<a:32877animatedarrowbluelite:1450777021968809986> Peek into the channels **\n**<a:32877animatedarrowbluelite:1450777021968809986> Introduce yourself **\n**<a:32877animatedarrowbluelite:1450777021968809986> Grab any roles you need **\n**<a:32877animatedarrowbluelite:1450777021968809986> If you're lost, ping the mods**"
        },
        {
          "type": 14,
          "spacing": 1
        },
        {
          "type": 12,
          "items": [
            {
              "media": {
                "url": "https://i.pinimg.com/originals/e8/3c/20/e83c2059ce102fe56291fc730da5dd56.gif"
              }
            }
          ]
        }
      ]
    }
  ]
});
}
} catch (error) {
client.logger("error", `Error generating welcome card: ${error}`);
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
// ============== DISCORD LOGIN ============== //
await client.login(DISCORD_TOKEN);
client.kazagumo = await createKazagumo(client);

const debounce = (fn, delay) => {
let timer = null;
return (...args) => {
if (timer) clearTimeout(timer);
timer = setTimeout(() => fn(...args), delay);
};
};

// ============== COMMAND RELOAD ============== //
const debouncedLoadCommands = debounce(() => {
client.logger("info", "Reloading commands...");
loadCommands();
}, 500);

fs.watch(commandsPath, { recursive: true }, (eventType, filename) => {
if (filename && filename.endsWith(".js")) {
client.logger("info", `Detected change in ${filename}, scheduling reload...`);
debouncedLoadCommands();
}
});
