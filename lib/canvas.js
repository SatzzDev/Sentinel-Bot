import Canvas from 'canvas';
import path from 'path';
import fs from 'fs';
import moment from 'moment-timezone';
import chalk from 'chalk';





Canvas.registerFont('./lib/fonts/Blacklisted.ttf', { family: 'Blacklisted', weight: 'normal', style: 'normal' });


// Helper function for rounded rectangles
function roundRect(ctx, x, y, width, height, radius) {
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









// ========================= WELCOME CARD - MULTIPLE STYLES & THEMES ========================= //

// Main function with style and theme options
export async function createWelcomeCard(user, guild, options = {}) {
    const style = options.style || 'modern'; // 'modern', 'minimal', 'card'
    const theme = options.theme || 'dark'; // 'dark', 'neon', 'ocean', 'light'
    
    if (style === 'modern') {
        return await createModernStyle(user, guild, theme);
    } else if (style === 'minimal') {
        return await createMinimalStyle(user, guild, theme);
    } else if (style === 'card') {
        return await createCardStyle(user, guild, theme);
    }
    
    return await createModernStyle(user, guild, theme);
}

// ========================= STYLE 1: MODERN (Full Width) ========================= //
async function createModernStyle(user, guild, theme) {
    const scale = 2;
    const baseWidth = 1000;
    const baseHeight = 400;
    const canvas = Canvas.createCanvas(baseWidth * scale, baseHeight * scale);
    const ctx = canvas.getContext('2d');
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.scale(scale, scale);

    const width = baseWidth;
    const height = baseHeight;
    const colors = getThemeColors(theme);

    // Background
    applyBackground(ctx, width, height, theme, colors);

    // Decorative elements
    applyDecorations(ctx, width, height, theme, colors);

    // Avatar
    await drawAvatar(ctx, user, 80, height / 2 - 90, 180, colors);

    // Text content - Modern layout
    const textStartX = 320;
    
    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('WELCOME', textStartX, 100);
    
    const lineGradient = ctx.createLinearGradient(textStartX, 110, textStartX + 150, 110);
    lineGradient.addColorStop(0, colors.accent);
    lineGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = lineGradient;
    ctx.fillRect(textStartX, 110, 150, 2);

    ctx.shadowColor = colors.glow;
    ctx.shadowBlur = 15;
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText(user.globalName, textStartX, 155);
    ctx.shadowBlur = 0;

    ctx.fillStyle = colors.subtext;
    ctx.font = '22px sans-serif';
    const discriminator = user.discriminator === '0' ? user.tag.split('#')[1] || '0000' : user.discriminator;
    ctx.fillText(`#${discriminator}`, textStartX, 185);

    // Info panel
    await drawInfoPanel(ctx, guild, textStartX, 220, width - textStartX - 60, 120, colors);

    return canvas.toBuffer();
}

// ========================= STYLE 2: MINIMAL (Centered, Clean) ========================= //
async function createMinimalStyle(user, guild, theme) {
    const scale = 2;
    const baseWidth = 1000;
    const baseHeight = 400;
    const canvas = Canvas.createCanvas(baseWidth * scale, baseHeight * scale);
    const ctx = canvas.getContext('2d');
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.scale(scale, scale);

    const width = baseWidth;
    const height = baseHeight;
    const colors = getThemeColors(theme);

    // Clean background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, colors.bgStart);
    bgGradient.addColorStop(1, colors.bgEnd);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Minimal accent line
    ctx.fillStyle = colors.accent;
    ctx.fillRect(0, 0, width, 3);

    // Centered avatar
    const avatarSize = 140;
    const centerX = width / 2;
    await drawAvatar(ctx, user, centerX - avatarSize / 2, 60, avatarSize, colors);

    // Centered text
    ctx.textAlign = 'center';
    
    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('WELCOME TO THE SERVER', centerX, 240);

    ctx.shadowColor = colors.glow;
    ctx.shadowBlur = 10;
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText(user.globalName, centerX, 285);
    ctx.shadowBlur = 0;

    ctx.fillStyle = colors.subtext;
    ctx.font = '18px sans-serif';
    const discriminator = user.discriminator === '0' ? user.tag.split('#')[1] || '0000' : user.discriminator;
    ctx.fillText(`#${discriminator}`, centerX, 310);

    // Bottom info bar
    ctx.fillStyle = colors.panelBg;
    ctx.fillRect(0, height - 60, width, 60);
    
    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`${guild.name}`, width / 3, height - 30);
    ctx.fillText(`Member #${guild.memberCount}`, width * 2 / 3, height - 30);
    
    ctx.fillStyle = colors.subtext;
    ctx.font = '12px sans-serif';
    ctx.fillText(moment.tz('Asia/Jakarta').format('MMM DD, YYYY'), centerX, height - 15);

    ctx.textAlign = 'left';
    return canvas.toBuffer();
}

// ========================= STYLE 3: CARD (Floating Card Design) ========================= //
async function createCardStyle(user, guild, theme) {
    const scale = 2;
    const baseWidth = 1000;
    const baseHeight = 400;
    const canvas = Canvas.createCanvas(baseWidth * scale, baseHeight * scale);
    const ctx = canvas.getContext('2d');
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.scale(scale, scale);

    const width = baseWidth;
    const height = baseHeight;
    const colors = getThemeColors(theme);

    // Outer background
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, colors.bgStart);
    bgGradient.addColorStop(1, colors.bgEnd);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Add subtle pattern for outer bg
    if (theme !== 'light') {
        ctx.fillStyle = colors.accent + '10';
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            ctx.fillRect(x, y, 2, 2);
        }
    }

    // Floating card
    const cardMargin = 60;
    const cardX = cardMargin;
    const cardY = cardMargin;
    const cardWidth = width - cardMargin * 2;
    const cardHeight = height - cardMargin * 2;

    // Card shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 10;
    
    ctx.fillStyle = colors.cardBg;
    roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 20);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Card border
    ctx.strokeStyle = colors.accent + '40';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Accent bar on card
    const accentGradient = ctx.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY);
    accentGradient.addColorStop(0, colors.accent);
    accentGradient.addColorStop(1, colors.secondary);
    ctx.fillStyle = accentGradient;
    roundRect(ctx, cardX, cardY, cardWidth, 6, 20);
    ctx.fill();

    // Avatar on card
    const avatarSize = 120;
    const avatarX = cardX + 50;
    const avatarY = cardY + cardHeight / 2 - avatarSize / 2;
    await drawAvatar(ctx, user, avatarX, avatarY, avatarSize, colors);

    // Text on card
    const textX = avatarX + avatarSize + 40;
    
    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('NEW MEMBER', textX, cardY + 60);

    ctx.fillStyle = colors.text;
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText(user.globalName, textX, cardY + 105);

    ctx.fillStyle = colors.subtext;
    ctx.font = '18px sans-serif';
    const discriminator = user.discriminator === '0' ? user.tag.split('#')[1] || '0000' : user.discriminator;
    ctx.fillText(`#${discriminator}`, textX, cardY + 135);

    // Info section on card
    const infoY = cardY + 170;
    ctx.fillStyle = colors.accent + '30';
    roundRect(ctx, textX, infoY, cardWidth - textX - 50 + cardX, 80, 10);
    ctx.fill();

    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('SERVER', textX + 15, infoY + 25);
    ctx.fillText('MEMBER COUNT', textX + 15, infoY + 60);

    ctx.fillStyle = colors.text;
    ctx.font = '16px sans-serif';
    ctx.fillText(guild.name, textX + 150, infoY + 25);
    ctx.fillText(`#${guild.memberCount}`, textX + 150, infoY + 60);

    return canvas.toBuffer();
}

// ========================= THEME COLOR SCHEMES ========================= //
function getThemeColors(theme) {
    const themes = {
        dark: {
            bgStart: '#0a0a0f',
            bgMid: '#12111d',
            bgEnd: '#0f0a15',
            accent: 'rgba(138, 113, 255, 0.8)',
            secondary: 'rgba(199, 103, 255, 0.8)',
            text: '#ffffff',
            subtext: 'rgba(255, 255, 255, 0.5)',
            glow: 'rgba(199, 103, 255, 0.8)',
            avatarPrimary: 'rgba(138, 113, 255, 0.5)',
            avatarSecondary: 'rgba(199, 103, 255, 0.6)',
            panelBg: 'rgba(255, 255, 255, 0.03)',
            cardBg: 'rgba(20, 18, 30, 0.95)',
            border: 'rgba(138, 113, 255, 0.2)'
        },
        neon: {
            bgStart: '#000000',
            bgMid: '#0d0208',
            bgEnd: '#1a0a14',
            accent: '#ff0066',
            secondary: '#00ffff',
            text: '#ffffff',
            subtext: 'rgba(0, 255, 255, 0.6)',
            glow: '#00ffff',
            avatarPrimary: 'rgba(255, 0, 102, 0.7)',
            avatarSecondary: 'rgba(0, 255, 255, 0.7)',
            panelBg: 'rgba(255, 0, 102, 0.05)',
            cardBg: 'rgba(10, 5, 10, 0.95)',
            border: 'rgba(255, 0, 102, 0.4)'
        },
        ocean: {
            bgStart: '#001f3f',
            bgMid: '#003d5c',
            bgEnd: '#00243d',
            accent: 'rgba(72, 202, 228, 0.9)',
            secondary: 'rgba(0, 180, 216, 0.9)',
            text: '#ffffff',
            subtext: 'rgba(72, 202, 228, 0.7)',
            glow: 'rgba(72, 202, 228, 0.8)',
            avatarPrimary: 'rgba(0, 180, 216, 0.6)',
            avatarSecondary: 'rgba(72, 202, 228, 0.6)',
            panelBg: 'rgba(255, 255, 255, 0.04)',
            cardBg: 'rgba(0, 40, 70, 0.95)',
            border: 'rgba(0, 180, 216, 0.3)'
        },
        light: {
            bgStart: '#f5f5f7',
            bgMid: '#e8e8ed',
            bgEnd: '#ffffff',
            accent: '#5856d6',
            secondary: '#007aff',
            text: '#1d1d1f',
            subtext: 'rgba(29, 29, 31, 0.6)',
            glow: 'rgba(88, 86, 214, 0.3)',
            avatarPrimary: 'rgba(88, 86, 214, 0.4)',
            avatarSecondary: 'rgba(0, 122, 255, 0.4)',
            panelBg: 'rgba(0, 0, 0, 0.03)',
            cardBg: 'rgba(255, 255, 255, 0.95)',
            border: 'rgba(88, 86, 214, 0.2)'
        }
    };
    
    return themes[theme] || themes.dark;
}

// ========================= BACKGROUND EFFECTS ========================= //
function applyBackground(ctx, width, height, theme, colors) {
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, colors.bgStart);
    bgGradient.addColorStop(0.5, colors.bgMid);
    bgGradient.addColorStop(1, colors.bgEnd);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    if (theme === 'light') {
        // Subtle light pattern
        ctx.fillStyle = colors.accent + '08';
        for (let i = 0; i < 40; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            ctx.beginPath();
            ctx.arc(x, y, Math.random() * 3, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (theme === 'neon') {
        // Grid pattern
        ctx.strokeStyle = colors.accent + '15';
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
        }
        ctx.strokeStyle = colors.secondary + '15';
        for (let i = 0; i < height; i += 40) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
            ctx.stroke();
        }
    } else if (theme === 'ocean') {
        // Waves
        ctx.strokeStyle = colors.accent + '20';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            const yOffset = height * 0.3 + i * 60;
            for (let x = 0; x <= width; x += 20) {
                const y = yOffset + Math.sin((x + i * 100) * 0.02) * 15;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    } else {
        // Dark theme particles
        ctx.fillStyle = colors.accent + '25';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            ctx.beginPath();
            ctx.arc(x, y, Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Glow orbs
    const orb1 = ctx.createRadialGradient(150, 200, 0, 150, 200, 300);
    orb1.addColorStop(0, colors.avatarPrimary + '20');
    orb1.addColorStop(1, 'transparent');
    ctx.fillStyle = orb1;
    ctx.fillRect(0, 0, width, height);

    const orb2 = ctx.createRadialGradient(width - 200, height - 100, 0, width - 200, height - 100, 350);
    orb2.addColorStop(0, colors.avatarSecondary + '15');
    orb2.addColorStop(1, 'transparent');
    ctx.fillStyle = orb2;
    ctx.fillRect(0, 0, width, height);
}

function applyDecorations(ctx, width, height, theme, colors) {
    // Top/bottom lines
    const lineGradient = ctx.createLinearGradient(0, 0, width, 0);
    lineGradient.addColorStop(0, 'transparent');
    lineGradient.addColorStop(0.3, colors.accent);
    lineGradient.addColorStop(0.7, colors.secondary);
    lineGradient.addColorStop(1, 'transparent');
    
    if (theme === 'neon') {
        ctx.shadowColor = colors.accent;
        ctx.shadowBlur = 10;
    }
    ctx.fillStyle = lineGradient;
    ctx.fillRect(0, 0, width, 3);
    ctx.fillRect(0, height - 3, width, 3);
    ctx.shadowBlur = 0;

    // Corner decorations
    if (theme === 'ocean') {
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(50, 50, 30, Math.PI, Math.PI * 1.5);
        ctx.arc(width - 50, 50, 30, Math.PI * 1.5, Math.PI * 2);
        ctx.arc(50, height - 50, 30, Math.PI * 0.5, Math.PI);
        ctx.arc(width - 50, height - 50, 30, 0, Math.PI * 0.5);
        ctx.stroke();
    } else if (theme !== 'light') {
        ctx.strokeStyle = colors.border;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(40, 40);
        ctx.lineTo(40, 80);
        ctx.moveTo(40, 40);
        ctx.lineTo(80, 40);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(width - 40, height - 40);
        ctx.lineTo(width - 40, height - 80);
        ctx.moveTo(width - 40, height - 40);
        ctx.lineTo(width - 80, height - 40);
        ctx.stroke();
    }
}

// ========================= SHARED COMPONENTS ========================= //
async function drawAvatar(ctx, user, x, y, size, colors) {
    try {
        const avatarURL = user.displayAvatarURL({ extension: 'png', size: 512 });
        const avatar = await Canvas.loadImage(avatarURL);

        ctx.shadowColor = colors.avatarPrimary;
        ctx.shadowBlur = 30;
        ctx.strokeStyle = colors.avatarPrimary;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2 + 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.shadowColor = colors.avatarSecondary;
        ctx.shadowBlur = 20;
        ctx.strokeStyle = colors.avatarSecondary;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2 + 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, x, y, size, size);
        ctx.restore();
    } catch (err) {
        console.error("Failed to load avatar", err);
    }
}

async function drawInfoPanel(ctx, guild, x, y, width, height, colors) {
    const panelGradient = ctx.createLinearGradient(x, y, x, y + height);
    panelGradient.addColorStop(0, colors.panelBg);
    panelGradient.addColorStop(1, colors.panelBg.replace('0.03', '0.01'));
    
    ctx.fillStyle = panelGradient;
    roundRect(ctx, x, y, width, height, 12);
    ctx.fill();

    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = colors.text + 'b3';
    ctx.font = '20px sans-serif';
    ctx.fillText(guild.name, x + 20, y + 35);

    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 20, y + 55);
    ctx.lineTo(x + width - 20, y + 55);
    ctx.stroke();

    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('MEMBER', x + 20, y + 80);
    
    ctx.fillStyle = colors.text;
    ctx.font = '18px sans-serif';
    ctx.fillText(`#${guild.memberCount}`, x + 20, y + 105);

    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('JOINED', x + width / 2, y + 80);
    
    ctx.fillStyle = colors.text;
    ctx.font = '18px sans-serif';
    ctx.fillText(moment.tz('Asia/Jakarta').format('MMM DD, YYYY'), x + width / 2, y + 105);
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
ctx.fillText(client.user.globalName, 260, 100);

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
ctx.fillText(user.globalName, 300, 130);

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







// ========================= NEW FUNCTION: CREATE NOW PLAYING CARD - MULTIPLE STYLES & THEMES ========================= //

// Main export function with multiple styles & themes
export async function createNowPlaying(track, options = {}) {
    const style = options.style || 'modern'; // 'modern', 'minimal', 'card'
    const theme = options.theme || 'dark'; // 'dark', 'neon', 'ocean'

    if (style === 'modern') {
        return await createNowPlayingModern(track, theme);
    } else if (style === 'minimal') {
        return await createNowPlayingMinimal(track, theme);
    } else if (style === 'card') {
        return await createNowPlayingCard(track, theme);
    }

    return await createNowPlayingModern(track, theme);
}

// ========================= STYLE 1: MODERN (Full Width) ========================= //
async function createNowPlayingModern(track, theme) {
    const scale = 2;
    const baseWidth = 1000;
    const baseHeight = 400;
    const canvas = Canvas.createCanvas(baseWidth * scale, baseHeight * scale);
    const ctx = canvas.getContext('2d');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.scale(scale, scale);

    const width = baseWidth;
    const height = baseHeight;
    const colors = getThemeColors(theme);

    // Background
    applyBackground(ctx, width, height, theme, colors);

    // Decorative elements (Reusing applyDecorations)
    applyDecorations(ctx, width, height, theme, colors);

    // Track thumbnail as avatar
    if (track.thumbnail) {
        try {
            const thumbnail = await Canvas.loadImage(track.thumbnail);
            const avatarX = 80;
            const avatarY = height / 2 - 90;
            const avatarSize = 180;

            ctx.shadowColor = colors.avatarPrimary;
            ctx.shadowBlur = 30;
            ctx.strokeStyle = colors.avatarPrimary;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 12, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.shadowColor = colors.avatarSecondary;
            ctx.shadowBlur = 20;
            ctx.strokeStyle = colors.avatarSecondary;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 6, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.save();
            ctx.beginPath();
            ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(thumbnail, avatarX, avatarY, avatarSize, avatarSize);
            ctx.restore();
        } catch (err) {
            console.error("Failed to load track thumbnail", err);
        }
    }

    // Text content - Modern layout
    const textStartX = 320;

    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('NOW PLAYING', textStartX, 100);

    const lineGradient = ctx.createLinearGradient(textStartX, 110, textStartX + 180, 110);
    lineGradient.addColorStop(0, colors.accent);
    lineGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = lineGradient;
    ctx.fillRect(textStartX, 110, 180, 2);

    ctx.shadowColor = colors.glow;
    ctx.shadowBlur = 15;
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText(track.title.length > 21 ? track.title.slice(0, 21) : track.title, textStartX, 155);
    ctx.shadowBlur = 0;

    ctx.fillStyle = colors.subtext;
    ctx.font = '22px sans-serif';
    ctx.fillText(track.author.length > 21 ? track.author.slice(0, 21) : track.author, textStartX, 185);

    // // Info panel-like area for album and duration (reuse drawInfoPanel styling)
    // ctx.fillStyle = colors.panelBg;
    // roundRect(ctx, textStartX, 220, 600, 120, 12);
    // ctx.fill();

    // ctx.strokeStyle = colors.border;
    // ctx.lineWidth = 1.5;
    // ctx.strokeRect(textStartX, 220, 600, 120);

    // ctx.fillStyle = colors.accent;
    // ctx.font = 'bold 20px sans-serif';
    // ctx.fillText('ALBUM:', textStartX + 20, 260);

    // ctx.fillStyle = colors.text;
    // ctx.font = '20px sans-serif';
    // ctx.fillText(track.album || 'Unknown Album', textStartX + 120, 260);

    // ctx.fillStyle = colors.accent;
    // ctx.font = 'bold 20px sans-serif';
    // ctx.fillText('DURATION:', textStartX + 20, 310);

    // ctx.fillStyle = colors.text;
    // ctx.font = '20px sans-serif';
    // ctx.fillText(track.duration || '00:00', textStartX + 180, 310);

    return canvas.toBuffer();
}

// ========================= STYLE 2: MINIMAL (Centered, Clean) ========================= //
async function createNowPlayingMinimal(track, theme) {
    const scale = 2;
    const baseWidth = 1000;
    const baseHeight = 400;
    const canvas = Canvas.createCanvas(baseWidth * scale, baseHeight * scale);
    const ctx = canvas.getContext('2d');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.scale(scale, scale);

    const width = baseWidth;
    const height = baseHeight;
    const colors = getThemeColors(theme);

    // Clean background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, colors.bgStart);
    bgGradient.addColorStop(1, colors.bgEnd);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Minimal accent line
    ctx.fillStyle = colors.accent;
    ctx.fillRect(0, 0, width, 4);

    // Centered track thumbnail
    if (track.thumbnail) {
        try {
            const thumbnail = await Canvas.loadImage(track.thumbnail);
            const avatarSize = 160;
            const centerX = width / 2;
            const avatarX = centerX - avatarSize / 2;
            const avatarY = 60;

            ctx.shadowColor = colors.avatarPrimary;
            ctx.shadowBlur = 30;
            ctx.strokeStyle = colors.avatarPrimary;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(centerX, avatarY + avatarSize / 2, avatarSize / 2 + 10, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.shadowColor = colors.avatarSecondary;
            ctx.shadowBlur = 20;
            ctx.strokeStyle = colors.avatarSecondary;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(centerX, avatarY + avatarSize / 2, avatarSize / 2 + 6, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(thumbnail, avatarX, avatarY, avatarSize, avatarSize);
            ctx.restore();
        } catch (err) {
            console.error("Failed to load track thumbnail", err);
        }
    }

    // Centered text content
    ctx.textAlign = 'center';

    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('NOW PLAYING', width / 2, 240);

    ctx.shadowColor = colors.glow;
    ctx.shadowBlur = 10;
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText(track.title.length > 21 ? track.title.slice(0, 21) : track.title, width / 2, 285);
    ctx.shadowBlur = 0;

    ctx.fillStyle = colors.subtext;
    ctx.font = '18px sans-serif';
    ctx.fillText(track.artist || track.author || 'Unknown Artist', width / 2, 315);

    // // Bottom info bar
    // ctx.fillStyle = colors.panelBg;
    // ctx.fillRect(0, height - 60, width, 60);

    // ctx.fillStyle = colors.accent;
    // ctx.font = 'bold 14px sans-serif';
    // ctx.fillText(track.album || 'Unknown Album', width / 3, height - 30);
    // ctx.fillText(track.duration || '00:00', width * 2 / 3, height - 30);

    // ctx.fillStyle = colors.subtext;
    // ctx.font = '12px sans-serif';
    // ctx.fillText(moment.tz('Asia/Jakarta').format('MMM DD, YYYY'), width / 2, height - 15);

    // ctx.textAlign = 'left';

    return canvas.toBuffer();
}

// ========================= STYLE 3: CARD (Floating Card Design) ========================= //
async function createNowPlayingCard(track, theme) {
    const scale = 2;
    const baseWidth = 1000;
    const baseHeight = 400;
    const canvas = Canvas.createCanvas(baseWidth * scale, baseHeight * scale);
    const ctx = canvas.getContext('2d');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.scale(scale, scale);

    const width = baseWidth;
    const height = baseHeight;
    const colors = getThemeColors(theme);

    // Outer background
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, colors.bgStart);
    bgGradient.addColorStop(1, colors.bgEnd);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Add subtle pattern for outer bg
    if (theme !== 'light') {
        ctx.fillStyle = colors.accent + '10';
        for (let i = 0; i < 30; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            ctx.fillRect(x, y, 2, 2);
        }
    }

    // Floating card
    const cardMargin = 60;
    const cardX = cardMargin;
    const cardY = cardMargin;
    const cardWidth = width - cardMargin * 2;
    const cardHeight = height - cardMargin * 2;

    // Card shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 10;

    ctx.fillStyle = colors.cardBg;
    roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 20);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Card border
    ctx.strokeStyle = colors.accent + '40';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Accent bar on card
    const accentGradient = ctx.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY);
    accentGradient.addColorStop(0, colors.accent);
    accentGradient.addColorStop(1, colors.secondary);
    ctx.fillStyle = accentGradient;
    roundRect(ctx, cardX, cardY, cardWidth, 6, 20);
    ctx.fill();

    // Track thumbnail on card
    if (track.thumbnail) {
        try {
            const thumbnail = await Canvas.loadImage(track.thumbnail);
            const avatarSize = 120;
            const avatarX = cardX + 50;
            const avatarY = cardY + cardHeight / 2 - avatarSize / 2;

            ctx.shadowColor = colors.avatarPrimary;
            ctx.shadowBlur = 30;
            ctx.strokeStyle = colors.avatarPrimary;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 12, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.shadowColor = colors.avatarSecondary;
            ctx.shadowBlur = 20;
            ctx.strokeStyle = colors.avatarSecondary;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 6, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.save();
            ctx.beginPath();
            ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(thumbnail, avatarX, avatarY, avatarSize, avatarSize);
            ctx.restore();
        } catch (err) {
            console.error("Failed to load track thumbnail", err);
        }
    }

    // Text on card
    const textX = cardX + 200;
    const textY = cardY + cardHeight / 2 - 60;

    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('NOW PLAYING', textX, textY);

    ctx.fillStyle = colors.text;
    ctx.font = 'bold 40px sans-serif';
    ctx.fillText(track.title || 'Unknown Title', textX, textY + 50);

    ctx.fillStyle = colors.subtext;
    ctx.font = '18px sans-serif';
    ctx.fillText(track.artist || 'Unknown Artist', textX, textY + 85);

    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('ALBUM:', textX, textY + 130);

    ctx.fillStyle = colors.text;
    ctx.font = '20px sans-serif';
    ctx.fillText(track.album || 'Unknown Album', textX + 100, textY + 130);

    ctx.fillStyle = colors.accent;
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('DURATION:', textX, textY + 170);

    ctx.fillStyle = colors.text;
    ctx.font = '20px sans-serif';
    ctx.fillText(track.duration || '00:00', textX + 130, textY + 170);

    return canvas.toBuffer();
}
