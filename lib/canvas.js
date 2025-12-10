import Canvas from 'canvas';
import path from 'path';
import fs from 'fs';
import moment from 'moment-timezone';
import chalk from 'chalk';





Canvas.registerFont('./lib/fonts/Blacklisted.ttf', { family: 'Blacklisted', weight: 'normal', style: 'normal' });




function roundedImage(ctx, x, y, width, height, radius) {
ctx.beginPath();
ctx.moveTo(x + radius, y);
ctx.lineTo(x + width - radius, y);
ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
ctx.lineTo(x + width, y + height - radius);
ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
ctx.lineTo(x + radius, y + height);
ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
ctx.lineTo(x, y + radius);
ctx.quadraticCurveTo(x, y, x + radius, y);
ctx.closePath();
}





// ========================= MOD CARD ========================= //
export async function createModCard(action, user, moderator, reason) {
const width = 900;
const height = 300;
const canvas = Canvas.createCanvas(width, height);
const ctx = canvas.getContext('2d');

const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, '#121212');
gradient.addColorStop(1, '#1e1e1e');

roundedImage(ctx, 0, 0, width, height, 20);
ctx.fillStyle = gradient;
ctx.fill();
ctx.clip();

const colors = {
BAN: '#ff4757',
KICK: '#ffa502',
MUTE: '#1e90ff',
WARN: '#eccc68',
UNBAN: '#2ed573',
TIMEOUT: '#00a8ff'
};

const accentColor = colors[action.toUpperCase()] || '#ffffff';

ctx.fillStyle = accentColor;
ctx.fillRect(0, 0, 15, height);

const glow = ctx.createLinearGradient(0, 0, 300, 0);
glow.addColorStop(0, accentColor + '40');
glow.addColorStop(1, 'transparent');
ctx.fillStyle = glow;
ctx.fillRect(15, 0, 300, height);

ctx.fillStyle = '#ffffff';
ctx.font = 'bold 50px Sans';
ctx.fillText(`${action.toUpperCase()}`, 50, 70);

ctx.font = 'bold 30px Sans';
ctx.fillStyle = '#f1f2f6';
ctx.fillText(`${user.tag}`, 50, 130);

ctx.font = '22px Sans';
ctx.fillStyle = '#a4b0be';
ctx.fillText(`ID: ${user.id}`, 50, 165);

ctx.fillStyle = '#2f3542';
roundedImage(ctx, 40, 200, 600, 70, 15);
ctx.fill();

ctx.fillStyle = '#dfe4ea';
ctx.font = '20px Sans';
ctx.fillText(`Reason: ${reason}`, 60, 242);

ctx.textAlign = 'right';
ctx.font = 'italic 18px Sans';
ctx.fillStyle = '#747d8c';
ctx.fillText(`Moderator: ${moderator.tag}`, width - 30, height - 20);

try {
const avatarURL = user.displayAvatarURL({ extension: 'png', size: 256 });
const avatar = await Canvas.loadImage(avatarURL);

const avatarSize = 180;
const avatarX = width - 230;
const avatarY = 60;

ctx.save();
ctx.beginPath();
ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
ctx.closePath();
ctx.clip();
ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
ctx.restore();

ctx.beginPath();
ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
ctx.lineWidth = 6;
ctx.strokeStyle = accentColor;
ctx.stroke();
} catch (err) {
console.error("Failed to load avatar", err);
}

return canvas.toBuffer();
}





// ========================= MOD CARD V2 ========================= //
export async function createModCardV2(action, channel, moderator, reason) {
const width = 900;
const height = 300;
const canvas = Canvas.createCanvas(width, height);
const ctx = canvas.getContext('2d');

const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, '#121212');
gradient.addColorStop(1, '#1e1e1e');

roundedImage(ctx, 0, 0, width, height, 20);
ctx.fillStyle = gradient;
ctx.fill();
ctx.clip();

const colors = {
LOCK: '#6200D2',
UNLOCK: '#6200D2',
};

const accentColor = colors[action.toUpperCase()] || '#ffffff';

ctx.fillStyle = accentColor;
ctx.fillRect(0, 0, 15, height);

const glow = ctx.createLinearGradient(0, 0, 300, 0);
glow.addColorStop(0, accentColor + '40');
glow.addColorStop(1, 'transparent');
ctx.fillStyle = glow;
ctx.fillRect(15, 0, 300, height);

ctx.fillStyle = '#ffffff';
ctx.font = 'bold 50px Sans';
ctx.fillText(`${channel.name.toUpperCase()} ${action == "LOCK" ? 'LOCKED' : 'UNLOCKED'}`, 50, 70);

ctx.font = '22px Sans';
ctx.fillStyle = '#a4b0be';
ctx.fillText(`CHANNEL: ${channel.name.toUpperCase()}`, 50, 135);

ctx.font = '22px Sans';
ctx.fillStyle = '#a4b0be';
ctx.fillText(`ID: ${channel.id}`, 50, 165);

ctx.font = '22px Sans';
ctx.fillStyle = '#a4b0be';
ctx.fillText(`DATE: ${moment.tz('Asia/Jakarta').format('MMM Do YYYY hA')}`, 50, 195);

ctx.fillStyle = '#2f3542';
roundedImage(ctx, 40, 225, 600, 70, 15);
ctx.fill();

ctx.fillStyle = '#dfe4ea';
ctx.font = '20px Sans';
ctx.fillText(`Reason: ${reason}`, 60, 265);

ctx.textAlign = 'right';
ctx.font = '18px Sans';
ctx.fillStyle = '#747d8c';
ctx.fillText(`${action == "LOCK" ? 'Locked' : 'Unlocked'} by: ${moderator.tag}`, width - 30, height - 20);

try {
const avatarURL = action == 'LOCK' ? 'https://cdn-icons-png.flaticon.com/512/16762/16762987.png' : 'https://cdn-icons-png.flaticon.com/512/16925/16925028.png'
const avatar = await Canvas.loadImage(avatarURL);

const avatarSize = 180;
const avatarX = width - 230;
const avatarY = 60;

ctx.save();
ctx.beginPath();
ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
ctx.closePath();
ctx.clip();
ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
ctx.restore();

ctx.beginPath();
ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
ctx.lineWidth = 6;
ctx.strokeStyle = accentColor;
ctx.stroke();
} catch (err) {
console.error("Failed to load avatar", err);
}

return canvas.toBuffer();
}





// ========================= WELCOME CARD ========================= //
export async function createWelcomeCard(user, guild) {
const width = 1000;
const height = 400;
const canvas = Canvas.createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Background - Cyberpunk Dark
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, '#000000');
gradient.addColorStop(0.5, '#0a0a0a');
gradient.addColorStop(1, '#1a1a1a');

roundedImage(ctx, 0, 0, width, height, 30);
ctx.fillStyle = gradient;
ctx.fill();
ctx.clip();

// Neon Grid Pattern
ctx.strokeStyle = 'rgba(0, 255, 204, 0.05)';
ctx.lineWidth = 1;
for (let i = 0; i < width; i += 50) {
ctx.beginPath();
ctx.moveTo(i, 0);
ctx.lineTo(i, height);
ctx.stroke();
}
for (let i = 0; i < height; i += 50) {
ctx.beginPath();
ctx.moveTo(0, i);
ctx.lineTo(width, i);
ctx.stroke();
}

// Decorative Glow Lines
const glowGradient = ctx.createLinearGradient(0, 0, width, 0);
glowGradient.addColorStop(0, 'transparent');
glowGradient.addColorStop(0.5, 'rgba(0, 255, 204, 0.1)');
glowGradient.addColorStop(1, 'transparent');

ctx.fillStyle = glowGradient;
ctx.fillRect(0, 100, width, 3);
ctx.fillRect(0, 300, width, 3);

// User Avatar
try {
const avatarURL = user.displayAvatarURL({ extension: 'png', size: 512 });
const avatar = await Canvas.loadImage(avatarURL);

const avatarSize = 200;
const avatarX = 80;
const avatarY = 100;

// Avatar Glow Background
ctx.shadowColor = '#00ffcc';
ctx.shadowBlur = 40;
ctx.fillStyle = 'rgba(0, 255, 204, 0.2)';
ctx.beginPath();
ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 15, 0, Math.PI * 2);
ctx.fill();
ctx.shadowBlur = 0;

// Draw Avatar
ctx.save();
ctx.beginPath();
ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
ctx.closePath();
ctx.clip();
ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
ctx.restore();

// Neon Border
ctx.shadowColor = '#00ffcc';
ctx.shadowBlur = 20;
ctx.lineWidth = 5;
ctx.strokeStyle = '#00ffcc';
ctx.beginPath();
ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 8, 0, Math.PI * 2, true);
ctx.stroke();
ctx.shadowBlur = 0;

} catch (err) {
console.error("Failed to load user avatar", err);
}

// Welcome Text
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 55px Sans';
ctx.fillText('WELCOME!', 350, 130);

// Username with Glow
ctx.shadowColor = '#00ffcc';
ctx.shadowBlur = 15;
ctx.fillStyle = '#00ffcc';
ctx.font = 'bold 48px Sans';
ctx.fillText(user.username, 350, 190);
ctx.shadowBlur = 0;

// Discriminator/Tag
ctx.fillStyle = '#888888';
ctx.font = '28px Sans';
ctx.fillText(`#${user.discriminator === '0' ? user.tag.split('#')[1] || '0000' : user.discriminator}`, 350, 230);

// Server Name
ctx.fillStyle = '#aaaaaa';
ctx.font = 'italic 24px Sans';
ctx.fillText(`${guild.name}`, 350, 265);

// Info Container
ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
roundedImage(ctx, 350, 290, 580, 80, 15);
ctx.fill();
ctx.strokeStyle = 'rgba(0, 255, 204, 0.2)';
ctx.lineWidth = 2;
ctx.stroke();

// Member Count Info
const drawInfo = (icon, label, value, x) => {
ctx.textAlign = 'center';

// Icon/Bullet
ctx.fillStyle = '#00ffcc';
ctx.beginPath();
ctx.arc(x, 320, 5, 0, Math.PI * 2);
ctx.fill();

// Label
ctx.fillStyle = '#00ffcc';
ctx.font = 'bold 18px sans';
ctx.fillText(label, x + 60, 325);

// Value
ctx.fillStyle = '#ffffff';
ctx.font = '18px Sans';
ctx.fillText(value, x + 60, 355);
};
drawInfo('•', 'MEMBER', `#${guild.memberCount}`, 380);
ctx.textAlign = 'center';
ctx.fillStyle = '#00ffcc';
ctx.beginPath();
ctx.arc(680, 320, 5, 0, Math.PI * 2);
ctx.fill();
ctx.fillStyle = '#00ffcc';
ctx.font = 'bold 18px sans';
ctx.fillText('DATE JOINED', 680 + 80, 325);
ctx.fillStyle = '#ffffff';
ctx.font = '18px Sans';
ctx.fillText(moment.tz('Asia/Jakarta').format('MMM Do YYYY hA'), 680 + 90, 355);
//drawInfo('•', 'DATE JOINED', moment.tz('Asia/Jakarta').format('MMM Do YYYY hA'), 680);

// Bottom decorative line
const bottomGlow = ctx.createLinearGradient(0, height - 10, width, height - 10);
bottomGlow.addColorStop(0, 'transparent');
bottomGlow.addColorStop(0.5, '#00ffcc');
bottomGlow.addColorStop(1, 'transparent');
return canvas.toBuffer();
}





// ========================= BOT STATUS CARD ========================= //
export async function createBotCard(client) {
const width = 900;
const height = 450;
const canvas = Canvas.createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Background - Cyberpunk Dark
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, '#000000');
gradient.addColorStop(1, '#1a1a1a');

roundedImage(ctx, 0, 0, width, height, 30);
ctx.fillStyle = gradient;
ctx.fill();
ctx.clip();

// Neon Grid
ctx.strokeStyle = 'rgba(0, 255, 204, 0.05)';
ctx.lineWidth = 1;
for (let i = 0; i < width; i += 50) {
ctx.beginPath();
ctx.moveTo(i, 0);
ctx.lineTo(i, height);
ctx.stroke();
}
for (let i = 0; i < height; i += 50) {
ctx.beginPath();
ctx.moveTo(0, i);
ctx.lineTo(width, i);
ctx.stroke();
}

// Bot Avatar
try {
const avatarURL = client.user.displayAvatarURL({ extension: 'png', size: 256 });
const avatar = await Canvas.loadImage(avatarURL);

const avatarSize = 160;
const avatarX = 60;
const avatarY = 60;

ctx.save();
ctx.beginPath();
ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
ctx.closePath();
ctx.clip();
ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
ctx.restore();

// Neon Glow
ctx.shadowColor = '#00ffcc';
ctx.shadowBlur = 20;
ctx.lineWidth = 4;
ctx.strokeStyle = '#00ffcc';
ctx.beginPath();
ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 5, 0, Math.PI * 2, true);
ctx.stroke();
ctx.shadowBlur = 0;

} catch (err) {
console.error("Failed to load bot avatar", err);
}

// Header
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 45px Sans';
ctx.fillText(client.user.username, 260, 100);

ctx.fillStyle = '#00ffcc';
ctx.font = '22px Sans';
ctx.fillText('• SYSTEM OPERATIONAL', 260, 140);

// Stats Container
ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
roundedImage(ctx, 60, 260, width - 120, 140, 20);
ctx.fill();
ctx.strokeStyle = 'rgba(0, 255, 204, 0.2)';
ctx.lineWidth = 2;
ctx.stroke();

// Stats
const drawStat = (label, value, x) => {
ctx.textAlign = 'center';
ctx.fillStyle = '#888888';
ctx.font = '20px Sans';
ctx.fillText(label, x, 310);

ctx.fillStyle = '#ffffff';
ctx.font = 'bold 30px Sans';
ctx.fillText(value, x, 360);
};

const uptime = process.uptime();
const days = Math.floor(uptime / 86400);
const hours = Math.floor(uptime / 3600) % 24;
const timeStr = `${days}d ${hours}h`;

drawStat('UPTIME', timeStr, 200);
drawStat('SERVERS', client.guilds.cache.size, 450);
drawStat('PING', `${Math.round(client.ws.ping)}ms`, 700);

return canvas.toBuffer();
}





// ========================= PROFILE CARD ========================= //
export async function createProfileCard(user, member) {
const width = 900;
const height = 500;
const canvas = Canvas.createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Background - Modern Deep Blurple Gradient
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, '#2c3e50');
gradient.addColorStop(1, '#000000');

roundedImage(ctx, 0, 0, width, height, 30);
ctx.fillStyle = gradient;
ctx.fill();
ctx.clip();

// Glassmorphism Overlay
ctx.save();
roundedImage(ctx, 40, 40, width - 80, height - 80, 20);
ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
ctx.fill();
ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
ctx.lineWidth = 1;
ctx.stroke();
ctx.restore();

// Avatar
try {
const avatarURL = user.displayAvatarURL({ extension: 'png', size: 512 });
const avatar = await Canvas.loadImage(avatarURL);

const avatarSize = 180;
const avatarX = 80;
const avatarY = 80;

// Avatar Shadow
ctx.shadowColor = 'rgba(0,0,0,0.5)';
ctx.shadowBlur = 20;

ctx.save();
ctx.beginPath();
ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
ctx.closePath();
ctx.clip();
ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
ctx.restore();
ctx.shadowBlur = 0; // Reset

// Status Ring (Static)
ctx.beginPath();
ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 10, 0, Math.PI * 2, true);
ctx.lineWidth = 4;
ctx.strokeStyle = '#a29bfe';
ctx.stroke();

} catch (err) {
console.error("Failed to load avatar", err);
}

// User Details
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 45px Sans';
ctx.fillText(user.username, 300, 130);

ctx.fillStyle = '#b2bec3';
ctx.font = '28px Sans';
ctx.fillText(`#${user.discriminator === '0' ? '0000' : user.discriminator}`, 300, 170);

// Info Boxes
const drawInfoBox = (label, value, x, y) => {
ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
roundedImage(ctx, x, y, 240, 100, 15);
ctx.fill();

ctx.fillStyle = '#dfe6e9';
ctx.font = 'bold 20px Sans';
ctx.fillText(label, x + 20, y + 35);

ctx.fillStyle = '#74b9ff';
ctx.font = 'bold 15px Sans';
ctx.fillText(value, x + 20, y + 75);
};

const joinedAt = member.joinedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const createdAt = user.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const roles = member.roles.cache.size - 1;

drawInfoBox('Joined Server', joinedAt, 300, 220);
drawInfoBox('Created Account', createdAt, 560, 220);
drawInfoBox('Roles', `${roles} Roles`, 300, 340);
drawInfoBox('User ID', user.id, 560, 340);

return canvas.toBuffer();
}





// ========================= SERVER CARD ========================= //
export async function createServerCard(guild) {
const width = 900;
const height = 500;
const canvas = Canvas.createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Background - Elegant Emerald Gradient
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, '#0f2027');
gradient.addColorStop(0.5, '#203a43');
gradient.addColorStop(1, '#2c5364');

roundedImage(ctx, 0, 0, width, height, 30);
ctx.fillStyle = gradient;
ctx.fill();
ctx.clip();

// Decorative Circles
ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
ctx.beginPath();
ctx.arc(width, 0, 400, 0, Math.PI * 2, true);
ctx.fill();

// Server Icon
try {
const iconURL = guild.iconURL({ extension: 'png', size: 512 });
if (iconURL) {
const icon = await Canvas.loadImage(iconURL);

const iconSize = 200;
const iconX = 60;
const iconY = 150;

// Shadow
ctx.shadowColor = 'rgba(0,0,0,0.4)';
ctx.shadowBlur = 25;

ctx.save();
ctx.beginPath();
ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2, 0, Math.PI * 2, true);
ctx.closePath();
ctx.clip();
ctx.drawImage(icon, iconX, iconY, iconSize, iconSize);
ctx.restore();
ctx.shadowBlur = 0;

// Border
ctx.beginPath();
ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2, 0, Math.PI * 2, true);
ctx.lineWidth = 8;
ctx.strokeStyle = 'rgba(255,255,255,0.1)';
ctx.stroke();
}
} catch (err) {
console.error("Failed to load guild icon", err);
}

// Server Name
ctx.textAlign = 'center';
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 50px Sans';
ctx.fillText(guild.name, width / 2 + 100, 100);

// Stats Grid
const startX = 320;
const startY = 180;
const boxW = 160;
const boxH = 120;
const gap = 20;

const drawStat = (label, value, x, y) => {
ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
roundedImage(ctx, x, y, boxW, boxH, 15);
ctx.fill();

ctx.textAlign = 'center';
ctx.fillStyle = '#bdc3c7';
ctx.font = '20px Sans';
ctx.fillText(label, x + boxW / 2, y + 40);

ctx.fillStyle = '#ffffff';
ctx.font = 'bold 32px Sans';
ctx.fillText(value, x + boxW / 2, y + 90);
};

drawStat('Members', guild.memberCount, startX, startY);
drawStat('Channels', guild.channels.cache.size, startX + boxW + gap, startY);
drawStat('Roles', guild.roles.cache.size, startX + (boxW + gap) * 2, startY);

// Footer Info
ctx.textAlign = 'left';
ctx.fillStyle = '#95a5a6';
ctx.font = 'italic 20px Sans';
const owner = await guild.fetchOwner();
ctx.fillText(`Owner: ${owner.user.tag}`, 320, 420);

ctx.textAlign = 'right';
const createdAt = guild.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
ctx.fillText(`Established: ${createdAt}`, width - 60, 420);

return canvas.toBuffer();
}






