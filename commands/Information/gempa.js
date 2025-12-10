import { createCanvas, loadImage } from "canvas";
import axios from "axios";
import moment from "moment-timezone";

export default {
  name: "gempa",
  description: "Monitor gempa bumi dari BMKG",
  lastEarthquakeId: null,

  async execute(message) {
    try {
      const earthquakeData = await this.fetchEarthquakeData();
      const canvas = await this.createEarthquakeCard(earthquakeData);
      const magnitude = parseFloat(earthquakeData.Magnitude);

      let alertText = "🌏 **Data Gempa Terbaru dari BMKG**";
      if (magnitude >= 7.0) {
        alertText = "🔴 **GEMPA BESAR! WASPADA!**";
      } else if (magnitude >= 5.0) {
        alertText = "🟡 **GEMPA SEDANG**";
      }

      return message.channel.sendMessage([
        { type: "text", content: `# ${alertText}` },
        {
          type: "section",
          texts: [
            `**Lokasi:** ${earthquakeData.Wilayah}`,
            `**Magnitude:** ${earthquakeData.Magnitude} SR`,
            `**Kedalaman:** ${earthquakeData.Kedalaman}\n**Waktu:** ${earthquakeData.Tanggal} • ${earthquakeData.Jam} WIB`,
          ],
          thumbnail: {
            url: `https://static.bmkg.go.id/${earthquakeData.Shakemap}`,
          },
        },
        {
          type: "image",
          url: "attachment://gempa_info.png",
          buffer: canvas.toBuffer(),
        },
      ]);
    } catch (error) {
      console.error("Error fetching earthquake data:", error);
      return message.channel.sendMessage([
        { type: "text", content: "❌ Gagal mengambil data gempa dari BMKG." },
      ]);
    }
  },

  // Fetch data dari BMKG API
  async fetchEarthquakeData() {
    const response = await axios.get(
      "https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json"
    );
    return response.data.Infogempa.gempa;
  },

  // Auto-check setiap 2 menit
  startMonitoring(client, channelId) {
    setInterval(async () => {
      try {
        const earthquakeData = await this.fetchEarthquakeData();
        const currentId = `${earthquakeData.Tanggal}-${earthquakeData.Jam}`;

        // Cek jika ada gempa baru
        if (this.lastEarthquakeId !== currentId) {
          this.lastEarthquakeId = currentId;

          const channel = client.channels.cache.get(channelId);
          if (!channel) return;

          const canvas = await this.createEarthquakeCard(earthquakeData);
          const magnitude = parseFloat(earthquakeData.Magnitude);

          let alertText = "🟢 **INFO GEMPA**";
          if (magnitude >= 7.0) alertText = "🔴 **GEMPA BESAR! WASPADA!**";
          else if (magnitude >= 5.0) alertText = "🟡 **GEMPA SEDANG**";

          await channel.sendMessage([
            {
              type: "text",
              content: `# ${alertText}`,
            },
            {
              type: "section",
              texts: [
                `**Lokasi:** ${earthquakeData.Wilayah}`,
                `**Magnitude:** ${earthquakeData.Magnitude} SR`,
                `**Kedalaman:** ${earthquakeData.Kedalaman}`,
                `**Waktu:** ${earthquakeData.Tanggal} • ${earthquakeData.Jam} WIB`,
              ],
              thumbnail: {
                url: `https://static.bmkg.go.id/${earthquakeData.Shakemap}`,
              },
            },
            {
              type: "image",
              url: "attachment://gempa_alert.png",
              buffer: canvas.toBuffer(),
            },
          ]);
        }
      } catch (error) {
        console.error("Error monitoring earthquake:", error);
      }
    }, 120000);
  },

  // Load icons (taruh path icon dari flaticon di sini)
  async loadIcons() {
    try {
      return {
        location: await loadImage(
          "https://cdn-icons-png.flaticon.com/512/17857/17857197.png"
        ),
        depth: await loadImage(
          "https://cdn-icons-png.flaticon.com/512/17857/17857209.png"
        ),
        coordinate: await loadImage(
          "https://cdn-icons-png.flaticon.com/512/15361/15361685.png"
        ),
        clock: await loadImage(
          "https://cdn-icons-png.flaticon.com/512/16654/16654956.png"
        ),
        calendar: await loadImage(
          "https://cdn-icons-png.flaticon.com/512/13126/13126284.png"
        ),
        wave: await loadImage(
          "https://cdn-icons-png.flaticon.com/512/13126/13126101.png"
        ),
        map: await loadImage(
          "https://cdn-icons-png.flaticon.com/512/15886/15886224.png"
        ),
        warning: await loadImage(
          "https://cdn-icons-png.flaticon.com/512/17857/17857293.png"
        ),
      };
    } catch (err) {
      console.log("Icons not loaded, using text labels");
      return null;
    }
  },

  // Create visual card
  async createEarthquakeCard(data) {
    const width = 1000;
    const height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Load icons
    const icons = await this.loadIcons();

    const magnitude = parseFloat(data.Magnitude);
    const depth = data.Kedalaman;
    const location = data.Wilayah;
    const coordinates = data.Coordinates;
    const dateTime = `${data.Tanggal} • ${data.Jam}`;
    const potential = data.Potensi;

    // Helper function
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

    // Determine alert color based on magnitude
    let alertColor, bgColor, accentColor;
    if (magnitude >= 7.0) {
      alertColor = "#ff0000";
      bgColor = "#1a0000";
      accentColor = "#ff3333";
    } else if (magnitude >= 5.0) {
      alertColor = "#ff9900";
      bgColor = "#1a1000";
      accentColor = "#ffaa33";
    } else {
      alertColor = "#00ff00";
      bgColor = "#001a00";
      accentColor = "#33ff33";
    }

    // Background gradient
    const bgGradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      width / 1.5
    );
    bgGradient.addColorStop(0, bgColor);
    bgGradient.addColorStop(1, "#000000");

    roundedRect(ctx, 0, 0, width, height, 30);
    ctx.fillStyle = bgGradient;
    ctx.fill();

    // Grid pattern
    ctx.strokeStyle = `${alertColor}15`;
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Top alert bar
    const topBarGradient = ctx.createLinearGradient(0, 0, width, 0);
    topBarGradient.addColorStop(0, "transparent");
    topBarGradient.addColorStop(0.5, alertColor);
    topBarGradient.addColorStop(1, "transparent");

    ctx.fillStyle = topBarGradient;
    ctx.shadowColor = alertColor;
    ctx.shadowBlur = 20;
    roundedRect(ctx, 0, 0, width, 80, 30);
    ctx.fill();
    ctx.shadowBlur = 0;

    // BMKG Logo text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "left";
    ctx.fillText("BMKG", 40, 50);

    // ctx.fillStyle = '#aaaaaa';
    // ctx.font = '16px Arial';
    // ctx.fillText('Badan Meteorologi Klimatologi dan Geofisika', 120, 50);

    // Alert status
    let statusText = "INFO GEMPA";
    if (magnitude >= 7.0) statusText = "⚠️ GEMPA BESAR";
    else if (magnitude >= 5.0) statusText = "⚠️ GEMPA SEDANG";

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "right";
    ctx.fillText(statusText, width - 50, 50);

    // Main magnitude circle
    const centerX = 190;
    const centerY = 320;
    const circleRadius = 115;

    // Pulse rings
    for (let i = 3; i > 0; i--) {
      ctx.strokeStyle = `${alertColor}${Math.floor(30 / i).toString(16)}`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, circleRadius + i * 20, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Main circle with glow
    ctx.shadowColor = alertColor;
    ctx.shadowBlur = 40;
    ctx.fillStyle = `${alertColor}33`;
    ctx.beginPath();
    ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = alertColor;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Magnitude text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 72px Arial";
    ctx.textAlign = "center";
    ctx.shadowColor = alertColor;
    ctx.shadowBlur = 30;
    ctx.fillText(data.Magnitude, centerX, centerY + 15);
    ctx.shadowBlur = 0;

    ctx.fillStyle = accentColor;
    ctx.font = "bold 24px Arial";
    ctx.fillText("SR", centerX, centerY + 45);

    // Info panels
    const panelX = 380;
    const panelY = 140;
    const panelWidth = 580;

    // Location panel
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    roundedRect(ctx, panelX, panelY, panelWidth, 80, 15);
    ctx.fill();
    ctx.strokeStyle = `${alertColor}66`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw location icon
    if (icons?.location) {
      ctx.drawImage(icons.location, panelX + 20, panelY + 15, 24, 24);
      ctx.fillStyle = alertColor;
      ctx.font = "bold 18px Arial";
      ctx.textAlign = "left";
      ctx.fillText("LOKASI", panelX + 52, panelY + 33);
    } else {
      ctx.fillStyle = alertColor;
      ctx.font = "bold 18px Arial";
      ctx.textAlign = "left";
      ctx.fillText("LOKASI", panelX + 20, panelY + 30);
    }

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px Arial";
    ctx.fillText(location, panelX + 20, panelY + 60);

    // Details grid
    const detailY = panelY + 100;
    const drawDetail = (x, y, icon, iconImg, label, value) => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      roundedRect(ctx, x, y, 180, 75, 12);
      ctx.fill();
      ctx.strokeStyle = `${alertColor}44`;
      ctx.lineWidth = 2;
      ctx.stroke();

      if (iconImg) {
        ctx.drawImage(iconImg, x + 15, y + 10, 20, 20);
        ctx.fillStyle = alertColor;
        //ctx.textAlign = 'center';
        ctx.font = "bold 16px Arial";
        ctx.fillText(label, x + 42, y + 26);
      } else {
        ctx.fillStyle = alertColor;
        ctx.font = "bold 16px Arial";
        ctx.fillText(`${icon} ${label}`, x + 15, y + 25);
      }

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px monospace";
      ctx.fillText(value, x + 15, y + 55);
    };

    drawDetail(panelX, detailY, "", icons?.depth, "KEDALAMAN", `  ${depth}`);
    drawDetail(
      panelX + 200,
      detailY,
      "",
      icons?.coordinate,
      "KOORDINAT",
      coordinates
    );
    drawDetail(panelX + 400, detailY, "", icons?.clock, "WAKTU", data.Jam);

    // Date panel
    const dateY = detailY + 95;
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    roundedRect(ctx, panelX, dateY, panelWidth, 60, 12);
    ctx.fill();
    ctx.strokeStyle = `${alertColor}44`;
    ctx.lineWidth = 2;
    ctx.stroke();

    if (icons?.calendar) {
      ctx.drawImage(icons.calendar, panelX + 20, dateY + 10, 20, 20);
      ctx.fillStyle = "#00ff00";
      ctx.font = "bold 20px monospace";
      ctx.fillText("TANGGAL", panelX + 48, dateY + 26);
    } else {
      ctx.fillStyle = "#00ff00";
      ctx.font = "bold 20px monospace";
      ctx.fillText("TANGGAL", panelX + 20, dateY + 25);
    }

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px Arial";
    ctx.fillText(data.Tanggal, panelX + 20, dateY + 48);

    // Potential/Tsunami warning
    const potentialY = dateY + 80;
    ctx.fillStyle = potential.includes("tidak")
      ? "rgba(0, 255, 0, 0.1)"
      : "rgba(255, 0, 0, 0.15)";
    roundedRect(ctx, panelX, potentialY, panelWidth, 70, 12);
    ctx.fill();
    ctx.strokeStyle = potential.includes("tidak") ? "#00ff00" : "#ff0000";
    ctx.lineWidth = 3;
    ctx.stroke();

    if (icons?.wave) {
      ctx.drawImage(icons.wave, panelX + 20, potentialY + 15, 24, 24);
      ctx.fillStyle = potential.includes("tidak") ? "#00ff00" : "#ff0000";
      ctx.font = "bold 18px Arial";
      ctx.fillText("POTENSI", panelX + 52, potentialY + 33);
    } else {
      ctx.fillStyle = potential.includes("tidak") ? "#00ff00" : "#ff0000";
      ctx.font = "bold 18px Arial";
      ctx.fillText("POTENSI", panelX + 20, potentialY + 30);
    }

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px Arial";
    ctx.fillText(potential.toUpperCase(), panelX + 20, potentialY + 55);

    // Bottom info bar
    const bottomY = height - 50;
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    ctx.fillRect(0, bottomY, width, 50);

    ctx.fillStyle = "#aca9a9ff";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      `Data Real-Time • Update: ${moment()
        .tz("Asia/Jakarta")
        .format("DD MMM YYYY, HH:mm:ss")} WIB`,
      width / 2,
      bottomY + 30
    );

    // Bottom accent line
    const bottomGlow = ctx.createLinearGradient(
      0,
      height - 5,
      width,
      height - 5
    );
    bottomGlow.addColorStop(0, "transparent");
    bottomGlow.addColorStop(0.5, alertColor);
    bottomGlow.addColorStop(1, "transparent");

    ctx.fillStyle = bottomGlow;
    ctx.shadowColor = alertColor;
    ctx.shadowBlur = 15;
    ctx.fillRect(0, height - 5, width, 5);
    ctx.shadowBlur = 0;

    return canvas;
  },
};
