import fetch from 'node-fetch';
import axios from 'axios';

export default {
name: 'removebg',
description: 'Remove background from an image',
category: 'Utility',

async execute(message, args) {
if (args.length === 0 && !message.attachments.size) {
return message.reply({
flags: 32768,
components: [
{
type: 17,
components: [
{ type: 10, content: 'Please provide an image URL or attach an image.' }
]
}
]
});
}

const imageUrl = args[0] || message.attachments.first()?.url;
if (!imageUrl) {
return message.reply({
flags: 32768,
components: [
{
type: 17,
components: [
{ type: 10, content: 'Invalid image URL or attachment.' }
]
}
]
});
}

await message.channel.sendTyping();

const result = await removebg(imageUrl);
if (!result.success) {
return message.reply({
flags: 32768,
components: [
{
type: 17,
components: [
{ type: 10, content: 'Failed to remove background from the image.' }
]
}
]
});
}

await message.reply({
flags: 32768,
files: [{attachment: await getBuffer(result.resultUrl), name: 'removedbg.png'}],
components: [
{
type: 17,
components: [
{
type: 10,
content: 'Here is your image with the background removed:'
},
{
type: 12,
items: [{ media: { url: "attachment://removedbg.png" } }],
},
]
}
],
});
}
};


async function getBuffer(url, options) { 
try { 
options ? options : {} 
const res = await axios({ method: "get", url, headers: { 'DNT': 1, 'Upgrade-Insecure-Request': 1 }, ...options, responseType: 'arraybuffer' }) 
return res.data 
} catch (err) { 
return err 
}
}
async function removebg(imageUrl) {
const encoded = encodeURIComponent(imageUrl);
const urls = [
`https://api.nekolabs.web.id/tools/remove-bg/v1?imageUrl=${encoded}`,
`https://api.nekolabs.web.id/tools/remove-bg/v2?imageUrl=${encoded}`,
`https://api.nekolabs.web.id/tools/remove-bg/v3?imageUrl=${encoded}`,
`https://api.nekolabs.web.id/tools/remove-bg/v4?imageUrl=${encoded}`,
`https://api.ootaizumi.web.id/tools/removebg?imageUrl=${encoded}`,
`https://api.elrayyxml.web.id/api/tools/removebg?url=${encoded}`,
];

for (const url of urls) {
const res = await fetch(url).catch(() => null);
if (!res || !res.ok) continue;

const type = res.headers.get("content-type") || "";

if (type.includes("application/json")) {
try {
const json = await res.json();
const result =
json?.result ||
json?.data?.result ||
json?.output ||
null;

const ok = json?.success === true || json?.status === true;

if (ok && result) {
return {
success: true,
resultUrl: result,
};
}
} catch {
continue;
}
}

if (/image\/(png|jpe?g|webp)/i.test(type)) {
try {
const buffer = Buffer.from(await res.arrayBuffer());
if (buffer.byteLength) {
return {
success: true,
resultBuffer: buffer,
};
}
} catch {
continue;
}
}
}

return { success: false, error: "All background removal attempts failed" };
}
