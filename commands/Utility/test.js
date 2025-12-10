import { createCanvas, loadImage } from "canvas";
import moment from "moment-timezone";

export default {
  name: "testcanvas",
  description: "Enhanced Cyberpunk Welcome Banner with Advanced Effects",

  async execute(message) {
    const user = message.author;
    const guild = message.guild;

    const width = 1200;
    const height = 450;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // --- Helper Functions ---
    function roundedRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    function drawHexagon(ctx, x, y, size) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const hx = x + size * Math.cos(angle);
        const hy = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
    }

    // --- Dynamic Background with Multiple Gradients ---
    const bgGradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      width
    );
    bgGradient.addColorStop(0, "#0a0015");
    bgGradient.addColorStop(0.5, "#000510");
    bgGradient.addColorStop(1, "#000000");

    roundedRect(ctx, 0, 0, width, height, 35);
    ctx.fillStyle = bgGradient;
    ctx.fill();

    // --- Animated Circuit Pattern ---
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = "#00ffcc";
    ctx.lineWidth = 1.5;

    // Horizontal lines with varying opacity
    for (let i = 0; i < height; i += 40) {
      ctx.globalAlpha = 0.03 + Math.random() * 0.05;
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();

      // Random circuit nodes
      for (let j = 0; j < width; j += 120) {
        if (Math.random() > 0.7) {
          ctx.fillStyle = "#00ffcc";
          ctx.beginPath();
          ctx.arc(j + Math.random() * 40, i, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Vertical lines
    for (let i = 0; i < width; i += 60) {
      ctx.globalAlpha = 0.03 + Math.random() * 0.05;
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    ctx.restore();

    // --- Hexagonal Pattern Overlay ---
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.strokeStyle = "#ff00ff";
    ctx.lineWidth = 1;
    const hexSize = 30;
    for (let y = 0; y < height + hexSize; y += hexSize * 1.5) {
      for (let x = 0; x < width + hexSize; x += hexSize * 1.732) {
        const offsetX = (y / (hexSize * 1.5)) % 2 === 0 ? 0 : hexSize * 0.866;
        drawHexagon(ctx, x + offsetX, y, hexSize / 2);
        ctx.stroke();
      }
    }
    ctx.restore();

    // --- User Avatar with Enhanced Effects ---
    try {
      const avatarURL = user.displayAvatarURL({ extension: "png", size: 512 });
      const avatar = await loadImage(avatarURL);
      const avatarSize = 240;
      const avatarX = width - 300;
      const avatarY = 105;

      // Multi-layer glow effect
      for (let i = 3; i > 0; i--) {
        ctx.shadowColor = i % 2 === 0 ? "#00ffcc" : "#ff00ff";
        ctx.shadowBlur = 50 - i * 10;
        ctx.fillStyle = `rgba(${i % 2 === 0 ? "0, 255, 204" : "255, 0, 255"}, ${
          0.1 + i * 0.05
        })`;
        ctx.beginPath();
        ctx.arc(
          avatarX + avatarSize / 2,
          avatarY + avatarSize / 2,
          avatarSize / 2 + 25 + i * 5,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      // Draw avatar with clip
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
      );
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();

      // Triple neon border
      const borders = [
        { offset: 12, color: "#00ffcc", width: 4 },
        { offset: 8, color: "#ff00ff", width: 3 },
        { offset: 4, color: "#00ffcc", width: 2 },
      ];

      borders.forEach((border) => {
        ctx.shadowColor = border.color;
        ctx.shadowBlur = 25;
        ctx.lineWidth = border.width;
        ctx.strokeStyle = border.color;
        ctx.beginPath();
        ctx.arc(
          avatarX + avatarSize / 2,
          avatarY + avatarSize / 2,
          avatarSize / 2 + border.offset,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      });
      ctx.shadowBlur = 0;

      // Scanline effect over avatar
      ctx.save();
      ctx.beginPath();
      ctx.arc(
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
      );
      ctx.clip();
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = "#00ffcc";
      ctx.lineWidth = 2;
      for (let i = 0; i < avatarSize; i += 4) {
        ctx.beginPath();
        ctx.moveTo(avatarX, avatarY + i);
        ctx.lineTo(avatarX + avatarSize, avatarY + i);
        ctx.stroke();
      }
      ctx.restore();
    } catch (err) {
      console.error("Failed to load avatar", err);
    }

    // --- Main Text Section with Enhanced Typography ---
    const textX = 60;

    // "WELCOME" with chromatic aberration effect
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#ff00ff";
    ctx.font = "bold 70px Arial, sans-serif";
    ctx.fillText("WELCOME", textX + 2, 140);

    ctx.fillStyle = "#00ffcc";
    ctx.fillText("WELCOME", textX - 2, 142);
    ctx.globalAlpha = 1;

    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 25;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 68px Arial, sans-serif";
    ctx.fillText("WELCOME", textX, 141);
    ctx.shadowBlur = 0;

    // Glitch line under WELCOME
    ctx.strokeStyle = "#00ffcc";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#00ffcc";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(60, 155);
    ctx.lineTo(60 + 400, 155);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Username with intense glow
    ctx.shadowColor = "#00ffcc";
    ctx.shadowBlur = 30;
    ctx.fillStyle = "#00ffcc";
    ctx.font = "bold 60px Arial, sans-serif";
    ctx.fillText(user.username, textX, 230);
    ctx.shadowBlur = 0;

    // User tag/discriminator
    const discriminator =
      user.discriminator === "0"
        ? user.tag.split("#")[1] || "0000"
        : user.discriminator;
    ctx.fillStyle = "#999999";
    ctx.font = "bold 32px monospace";
    ctx.fillText(`${guild.name}`, textX, 270);

    // Server name with style
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "italic 28px Arial, sans-serif";
    ctx.fillText(`We glad You Here!`, textX, 310);

    // Decorative element next to server name
    ctx.fillStyle = "#ff00ff";
    ctx.shadowColor = "#ff00ff";
    ctx.shadowBlur = 15;
    ctx.fillRect(textX - 15, 290, 8, 25);
    ctx.shadowBlur = 0;

    // --- Enhanced Info Panel ---
    const panelY = 340;
    const panelHeight = 90;

    // Panel background with gradient
    const panelGradient = ctx.createLinearGradient(
      0,
      panelY,
      0,
      panelY + panelHeight
    );
    panelGradient.addColorStop(0, "rgba(0, 255, 204, 0.08)");
    panelGradient.addColorStop(1, "rgba(255, 0, 255, 0.08)");

    ctx.fillStyle = panelGradient;
    roundedRect(ctx, textX, panelY, 780, panelHeight, 20);
    ctx.fill();

    // Panel borders
    ctx.strokeStyle = "#00ffcc";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#00ffcc";
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Info items with modern styling
    const drawInfoItem = (x, icon, label, value, color) => {
      // Icon circle
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(x, panelY + 45, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Connecting line
      ctx.strokeStyle = `${color}88`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 8, panelY + 45);
      ctx.lineTo(x + 25, panelY + 45);
      ctx.stroke();

      // Label
      ctx.fillStyle = color;
      ctx.font = "bold 16px Arial, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(label, x + 30, panelY + 35);

      // Value
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px monospace";
      ctx.fillText(value, x + 30, panelY + 60);
    };

    const memberCount = guild.memberCount;
    const joinDate = moment.tz("Asia/Jakarta").format("DD MMM YYYY");
    const joinTime = moment.tz("Asia/Jakarta").format("HH:mm");

    drawInfoItem(
      textX + 40,
      "👥",
      "MEMBER COUNT",
      `#${memberCount}`,
      "#00ffcc"
    );
    drawInfoItem(textX + 290, "📅", "JOINED ON", joinDate, "#ff00ff");
    drawInfoItem(textX + 540, "⏰", "TIME", joinTime, "#00ffcc");

    return message.channel.send({
      files: [
        {
          attachment: canvas.toBuffer(),
          name: "cyberpunk_welcome.png",
        },
      ],
    });
  },
};
