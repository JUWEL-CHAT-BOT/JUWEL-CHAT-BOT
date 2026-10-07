const { createCanvas } = require('canvas');
const os = require('os');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

module.exports.config = {
  name: "upt",
  version: "3.2.0",
  hasPermssion: 0,
  credits: "MR JUWEL",
  description: "Cyberpunk 3D real-time system monitoring",
  commandCategory: "system",
  usages: "",
  cooldowns: 5
};

// ================= CACHE =================
module.exports.onLoad = () => {
  const cache = path.join(__dirname, "cache");
  if (!fs.existsSync(cache)) fs.mkdirSync(cache, { recursive: true });
};

// ================= BYTE =================
const f = (bytes) => {
  if (!bytes || bytes <= 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
};

// ================= CPU =================
let previousCPU = null;
const getCPU = () => {
  let idle = 0, total = 0;
  for (const cpu of os.cpus()) {
    for (const type in cpu.times) total += cpu.times[type];
    idle += cpu.times.idle;
  }
  const current = { idle, total };
  if (!previousCPU) {
    previousCPU = current;
    return Math.round((1 - idle / total) * 100);
  }
  const idleDiff = current.idle - previousCPU.idle;
  const totalDiff = current.total - previousCPU.total;
  previousCPU = current;
  if (!totalDiff) return 0;
  return Math.max(0, Math.min(100, Math.round(100 - (100 * idleDiff) / totalDiff)));
};

// ================= DISK =================
const getDisk = () => {
  try {
    let output;
    if (process.platform === "win32") {
      output = execSync("wmic logicaldisk get size,freespace,caption").toString();
      const lines = output.split("\n").filter(l => l.trim() && !l.includes("Caption"));
      const line = lines[0].trim().split(/\s+/);
      const free = parseInt(line[0]);
      const total = parseInt(line[1]);
      if (!total) return 0;
      return Math.min(100, Math.round(((total - free) / total) * 100));
    } else {
      output = execSync("df -k /").toString();
      const line = output.split("\n").filter(x => x.trim())[1];
      const data = line.split(/\s+/);
      const total = parseInt(data[1]) * 1024;
      const used = parseInt(data[2]) * 1024;
      if (!total) return 0;
      return Math.min(100, Math.round((used / total) * 100));
    }
  } catch (e) { return 0; }
};

// ================= ROUNDED RECT =================
const roundedRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

// ================= NEON LINE =================
const neonLine = (ctx, x1, y1, x2, y2, color, width = 3) => {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.restore();
};

// ================= 3D GRADIENT TEXT =================
const draw3DText = (ctx, text, x, y, colorTop, colorBottom, glowColor, size = 70) => {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = `italic bold ${size}px Arial`;

  for (let d = 6; d >= 1; d--) {
    ctx.shadowColor = "rgba(0,0,0,0.9)";
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillText(text, x + d, y + d);
  }

  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 40;
  ctx.fillStyle = glowColor;
  ctx.fillText(text, x, y);

  const grad = ctx.createLinearGradient(x - 200, y - size, x + 200, y);
  grad.addColorStop(0, colorTop);
  grad.addColorStop(0.5, "#ffffff");
  grad.addColorStop(1, colorBottom);

  ctx.shadowBlur = 20;
  ctx.shadowColor = glowColor;
  ctx.fillStyle = grad;
  ctx.fillText(text, x, y);

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 1;
  ctx.strokeText(text, x, y - 1);

  ctx.restore();
};

// ================= CORNER FRAME =================
const cornerFrame = (ctx, x, y, w, h, color) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 6;
  ctx.shadowColor = color;
  ctx.shadowBlur = 22;
  ctx.beginPath();
  ctx.moveTo(x + 45, y); ctx.lineTo(x + 5, y); ctx.lineTo(x, y + 5); ctx.lineTo(x, y + 45);
  ctx.moveTo(x + w - 45, y); ctx.lineTo(x + w - 5, y); ctx.lineTo(x + w, y + 5); ctx.lineTo(x + w, y + 45);
  ctx.moveTo(x + w, y + h - 45); ctx.lineTo(x + w, y + h - 5); ctx.lineTo(x + w - 5, y + h); ctx.lineTo(x + w - 45, y + h);
  ctx.moveTo(x + 45, y + h); ctx.lineTo(x + 5, y + h); ctx.lineTo(x, y + h - 5); ctx.lineTo(x, y + h - 45);
  ctx.stroke();

  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    ctx.moveTo(x + w - 130 + i * 28, y + 20);
    ctx.lineTo(x + w - 100 + i * 28, y + 20);
    ctx.lineTo(x + w - 88 + i * 28, y + 32);
    ctx.lineTo(x + w - 118 + i * 28, y + 32);
    ctx.closePath();
  }
  ctx.fillStyle = "rgba(0,255,136,0.35)";
  ctx.fill();
  ctx.strokeStyle = "#00ff88";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
};

// ================= BACKGROUND =================
const drawBackground = (ctx, W, H) => {
  const bg = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 800);
  bg.addColorStop(0, "#0a1f3d");
  bg.addColorStop(0.5, "#05122a");
  bg.addColorStop(1, "#000410");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 5; i++) {
    const sideX = i < 3 ? 30 + i * 35 : W - 130 + (i - 3) * 35;
    const sideY = 180 + (i % 3) * 30;
    ctx.save();
    ctx.globalAlpha = 0.35 + (i % 2) * 0.15;
    ctx.fillStyle = "rgba(5, 15, 35, 0.9)";
    ctx.fillRect(sideX, sideY, 90, 350);
    ctx.strokeStyle = "rgba(0,140,255,0.4)";
    ctx.lineWidth = 1;
    ctx.strokeRect(sideX, sideY, 90, 350);

    for (let j = 0; j < 20; j++) {
      const lx = sideX + 12 + (j % 3) * 22;
      const ly = sideY + 15 + Math.floor(j / 3) * 16;
      ctx.beginPath();
      ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = j % 3 === 0 ? "#00ff88" : (j % 3 === 1 ? "#00bfff" : "#ffaa00");
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 8;
      ctx.fill();
    }
    ctx.restore();
  }

  const glow = ctx.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, 550);
  glow.addColorStop(0, "rgba(0,120,255,0.15)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
};

// ================= ICONS =================
const drawCpuIcon = (ctx, cx, cy, color) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.strokeRect(cx - 16, cy - 16, 32, 32);
  ctx.strokeRect(cx - 8, cy - 8, 16, 16);
  for (let i = -8; i <= 8; i += 8) {
    ctx.beginPath(); ctx.moveTo(cx + i, cy - 20); ctx.lineTo(cx + i, cy - 16); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + i, cy + 16); ctx.lineTo(cx + i, cy + 20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 20, cy + i); ctx.lineTo(cx - 16, cy + i); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 16, cy + i); ctx.lineTo(cx + 20, cy + i); ctx.stroke();
  }
  ctx.restore();
};

const drawRamIcon = (ctx, cx, cy, color) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.strokeRect(cx - 20, cy - 12, 40, 24);
  for (let i = -12; i <= 12; i += 8) {
    ctx.beginPath(); ctx.moveTo(cx + i, cy - 6); ctx.lineTo(cx + i, cy + 6); ctx.stroke();
  }
  ctx.restore();
};

const drawDiskIcon = (ctx, cx, cy, color) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  for (let i = -10; i <= 10; i += 7) {
    ctx.beginPath();
    ctx.ellipse(cx, cy + i, 17, 5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
};

// ================= RING =================
const drawRing = (ctx, x, y, percent, color, label, iconFn) => {
  const radius = 82;
  const thickness = 22;

  ctx.save();
  ctx.fillStyle = "rgba(2, 10, 25, 0.92)";
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.shadowColor = color;
  ctx.shadowBlur = 25;

  const px = x - 145, py = y - 145, pw = 290, ph = 290, cut = 35;
  ctx.beginPath();
  ctx.moveTo(px + cut, py);
  ctx.lineTo(px + pw - cut, py);
  ctx.lineTo(px + pw, py + cut);
  ctx.lineTo(px + pw, py + ph - cut);
  ctx.lineTo(px + pw - cut, py + ph);
  ctx.lineTo(px + cut, py + ph);
  ctx.lineTo(px, py + ph - cut);
  ctx.lineTo(px, py + cut);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(px + 15, py + 45); ctx.lineTo(px + 15, py + 15); ctx.lineTo(px + 45, py + 15);
  ctx.moveTo(px + pw - 45, py + 15); ctx.lineTo(px + pw - 15, py + 15); ctx.lineTo(px + pw - 15, py + 45);
  ctx.moveTo(px + pw - 15, py + ph - 45); ctx.lineTo(px + pw - 15, py + ph - 15); ctx.lineTo(px + pw - 45, py + ph - 15);
  ctx.moveTo(px + 45, py + ph - 15); ctx.lineTo(px + 15, py + ph - 15); ctx.lineTo(px + 15, py + ph - 45);
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.shadowBlur = 20;
  ctx.stroke();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,255,255,0.1)";
  ctx.lineWidth = thickness;
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, -Math.PI / 2, (percent / 100) * Math.PI * 2 - Math.PI / 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.lineCap = "round";
  ctx.shadowColor = color;
  ctx.shadowBlur = 30;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y, radius - 6, -Math.PI / 2, (percent / 100) * Math.PI * 2 - Math.PI / 2);
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 2;
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.restore();

  iconFn(ctx, x, y - 40, color);

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "italic bold 54px Arial";
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(percent + "%", x, y + 30);
  ctx.restore();

  const lw = 150, lh = 40;
  const lx = x - lw / 2, ly = y + 105;
  ctx.save();
  roundedRect(ctx, lx, ly, lw, lh, 8);
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.stroke();

  ctx.font = "italic bold 26px Arial";
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.fillText(label, x, ly + lh / 2 + 1);
  ctx.restore();
};

// ================= INFO ROW =================
const infoRow = (ctx, label, value, y, color, iconType) => {
  ctx.save();
  const ix = 100, iy = y - 8;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;

  if (iconType === "clock") {
    ctx.beginPath(); ctx.arc(ix, iy, 12, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ix, iy); ctx.lineTo(ix, iy - 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ix, iy); ctx.lineTo(ix + 5, iy); ctx.stroke();
  } else if (iconType === "cpu") {
    drawCpuIcon(ctx, ix, iy, color);
  } else if (iconType === "disk") {
    drawDiskIcon(ctx, ix, iy, color);
  } else if (iconType === "wifi") {
    ctx.beginPath(); ctx.arc(ix, iy + 5, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(ix, iy + 5, 8, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke();
    ctx.beginPath(); ctx.arc(ix, iy + 5, 13, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke();
  }
  ctx.restore();

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = "italic bold 26px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(label, 135, y);

  ctx.font = "bold 26px Arial";
  ctx.fillStyle = "#00eaff";
  ctx.shadowColor = "#00eaff";
  ctx.shadowBlur = 12;
  ctx.fillText("→", 290, y);
  ctx.shadowBlur = 0;

  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.fillText(value, 340, y);
  ctx.shadowBlur = 0;
};

// ================= 3D SERVER =================
const draw3DServer = (ctx, cx, cy) => {
  ctx.save();
  const w = 130, h = 22, depth = 18;

  ctx.fillStyle = "rgba(0, 60, 120, 0.6)";
  ctx.beginPath();
  ctx.moveTo(cx + w / 2, cy + 5 * h + 5);
  ctx.lineTo(cx + w / 2 + depth, cy + 5 * h + 5 - depth);
  ctx.lineTo(cx + w / 2 + depth, cy + 5 - depth);
  ctx.lineTo(cx + w / 2, cy + 5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#00eaff";
  ctx.lineWidth = 1.5;
  ctx.shadowColor = "#00eaff";
  ctx.shadowBlur = 10;
  ctx.stroke();

  ctx.fillStyle = "rgba(0, 100, 180, 0.7)";
  ctx.beginPath();
  ctx.moveTo(cx + w / 2, cy + 5);
  ctx.lineTo(cx + w / 2 + depth, cy + 5 - depth);
  ctx.lineTo(cx - w / 2 + depth, cy + 5 - depth);
  ctx.lineTo(cx - w / 2, cy + 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  for (let i = 0; i < 5; i++) {
    const sy = cy + 5 + i * h;
    const grad = ctx.createLinearGradient(cx - w / 2, sy, cx + w / 2, sy + h);
    grad.addColorStop(0, "rgba(0, 40, 90, 0.95)");
    grad.addColorStop(1, "rgba(0, 70, 130, 0.95)");

    ctx.fillStyle = grad;
    ctx.fillRect(cx - w / 2, sy, w, h - 4);

    ctx.strokeStyle = "#00eaff";
    ctx.lineWidth = 1.5;
    ctx.shadowColor = "#00eaff";
    ctx.shadowBlur = 8;
    ctx.strokeRect(cx - w / 2, sy, w, h - 4);

    for (let j = 0; j < 4; j++) {
      ctx.beginPath();
      ctx.arc(cx - w / 2 + 15 + j * 14, sy + (h - 4) / 2, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = ["#00ff88", "#00bfff", "#ff267f", "#ffaa00"][j];
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 10;
      ctx.fill();
    }
  }

  ctx.beginPath();
  ctx.arc(cx + 95, cy + 70, 42, 0, Math.PI * 2);
  ctx.strokeStyle = "#00eaff";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#00eaff";
  ctx.shadowBlur = 25;
  ctx.stroke();

  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.ellipse(cx + 95, cy + 70, 42, Math.abs(42 * Math.sin(i * 0.35)), 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(0,234,255,0.4)";
    ctx.lineWidth = 1;
    ctx.shadowBlur = 5;
    ctx.stroke();
  }
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.ellipse(cx + 95, cy + 70, Math.abs(42 * Math.sin(i * 0.35)), 42, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.ellipse(cx + 95, cy + 70, 60, 15, -0.4, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0,234,255,0.5)";
  ctx.shadowBlur = 15;
  ctx.stroke();

  ctx.restore();
};

// ================= ADMIN BADGE =================
const drawAdminBadge = (ctx, W) => {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const text = "ADMIN  MR JUWEL";
  const cx = W / 2;
  const cy = 195;

  ctx.font = "italic bold 22px Arial";
  const textWidth = ctx.measureText(text).width;
  const padX = 30;
  const bw = textWidth + padX * 2;
  const bh = 38;
  const bx = cx - bw / 2;
  const by = cy - bh / 2;

  const grad = ctx.createLinearGradient(bx, by, bx + bw, by + bh);
  grad.addColorStop(0, "rgba(0, 40, 80, 0.95)");
  grad.addColorStop(0.5, "rgba(0, 80, 140, 0.95)");
  grad.addColorStop(1, "rgba(0, 40, 80, 0.95)");

  ctx.fillStyle = grad;
  ctx.strokeStyle = "#ffcc00";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#ffcc00";
  ctx.shadowBlur = 20;

  roundedRect(ctx, bx, by, bw, bh, 19);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(bx + 20, by + 2);
  ctx.lineTo(bx + bw - 20, by + 2);
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 1;
  ctx.shadowBlur = 0;
  ctx.stroke();

  ctx.shadowColor = "#ffcc00";
  ctx.shadowBlur = 12;
  ctx.fillStyle = "#ffcc00";
  ctx.font = "bold 20px Arial";
  ctx.textAlign = "left";
  ctx.fillText("★", bx + 12, cy + 1);

  ctx.textAlign = "right";
  ctx.fillText("★", bx + bw - 12, cy + 1);

  ctx.textAlign = "center";
  ctx.font = "italic bold 22px Arial";
  const txtGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
  txtGrad.addColorStop(0, "#fff5b0");
  txtGrad.addColorStop(0.5, "#ffcc00");
  txtGrad.addColorStop(1, "#b38000");

  ctx.fillStyle = txtGrad;
  ctx.shadowColor = "#ffcc00";
  ctx.shadowBlur = 15;
  ctx.fillText(text, cx, cy + 1);

  ctx.beginPath();
  ctx.moveTo(bx + 30, by + bh - 4);
  ctx.lineTo(bx + bw - 30, by + bh - 4);
  ctx.strokeStyle = "rgba(255,204,0,0.6)";
  ctx.lineWidth = 1.5;
  ctx.shadowBlur = 10;
  ctx.stroke();

  ctx.restore();
};

// ================= MR JUWEL CHAT BOT WATERMARK (NEW) =================
const drawChatBotWatermark = (ctx, W, H) => {
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const cx = W / 2;
  const cy = H - 18;

  // Glow behind
  ctx.shadowColor = "#00ffcc";
  ctx.shadowBlur = 25;

  // Top thin neon line
  ctx.beginPath();
  ctx.moveTo(cx - 220, cy - 12);
  ctx.lineTo(cx + 220, cy - 12);
  ctx.strokeStyle = "rgba(0,255,204,0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Main text
  ctx.font = "italic bold 18px Arial";
  const txtGrad = ctx.createLinearGradient(cx - 150, cy, cx + 150, cy);
  txtGrad.addColorStop(0, "#00eaff");
  txtGrad.addColorStop(0.5, "#ffffff");
  txtGrad.addColorStop(1, "#00ffcc");

  ctx.fillStyle = txtGrad;
  ctx.shadowColor = "#00ffcc";
  ctx.shadowBlur = 18;
  ctx.fillText("MR JUWEL CHAT BOT", cx, cy);

  // Small dots both sides
  ctx.fillStyle = "#00ff88";
  ctx.shadowColor = "#00ff88";
  ctx.shadowBlur = 10;
  ctx.beginPath(); ctx.arc(cx - 145, cy, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 145, cy, 3, 0, Math.PI * 2); ctx.fill();

  // Bottom thin neon line
  ctx.beginPath();
  ctx.moveTo(cx - 220, cy + 12);
  ctx.lineTo(cx + 220, cy + 12);
  ctx.strokeStyle = "rgba(0,255,204,0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
};

// ================= EVENT =================
module.exports.handleEvent = async function ({ api, event }) {
  if (!event.body) return;
  if (event.body.toLowerCase().trim() === "upt") {
    return module.exports.run({ api, event });
  }
};

// ================= MAIN =================
module.exports.run = async function ({ api, event }) {
  let file;
  try {
    const startTime = Date.now();
    const cpu = getCPU();
    const totalRam = os.totalmem();
    const usedRam = totalRam - os.freemem();
    const ram = Math.min(100, Math.round((usedRam / totalRam) * 100));
    const disk = getDisk();

    const seconds = process.uptime();
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const uptime = `${days}d ${hours}h ${minutes}m ${secs}s`;
    const ping = Date.now() - startTime;

    const W = 1080, H = 720;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    drawBackground(ctx, W, H);

    cornerFrame(ctx, 15, 15, 1050, 690, "#00ff88");
    cornerFrame(ctx, 25, 25, 1030, 670, "#00bfff");

    // ECG Line
    ctx.save();
    ctx.strokeStyle = "#00ff88";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#00ff88";
    ctx.shadowBlur = 15;
    ctx.beginPath();
    const ex = 120, ey = 75;
    ctx.moveTo(ex, ey);
    ctx.lineTo(ex + 20, ey);
    ctx.lineTo(ex + 25, ey - 18);
    ctx.lineTo(ex + 32, ey + 22);
    ctx.lineTo(ex + 40, ey - 30);
    ctx.lineTo(ex + 48, ey + 15);
    ctx.lineTo(ex + 55, ey);
    ctx.lineTo(ex + 90, ey);
    ctx.stroke();
    ctx.restore();

    // 3D Title
    draw3DText(ctx, "SYSTEM", 430, 105, "#ffffff", "#00eaff", "#00ff88", 72);
    draw3DText(ctx, "STATUS", 700, 105, "#00ff88", "#00aa55", "#00ff88", 72);

    // Subtitle
    ctx.textAlign = "center";
    ctx.font = "italic bold 26px Arial";
    ctx.fillStyle = "#00eaff";
    ctx.shadowColor = "#00eaff";
    ctx.shadowBlur = 15;
    ctx.fillText("Real-time Server Monitoring", 540, 148);
    ctx.shadowBlur = 0;

    // Admin badge
    drawAdminBadge(ctx, W);

    // Decorative lines
    neonLine(ctx, 90, 225, 360, 225, "#00ff88", 4);
    neonLine(ctx, 720, 225, 990, 225, "#00bfff", 4);

    // Rings
    drawRing(ctx, 240, 375, cpu, "#00ff88", "CPU", drawCpuIcon);
    drawRing(ctx, 540, 375, ram, "#ff267f", "RAM", drawRamIcon);
    drawRing(ctx, 840, 375, disk, "#00bfff", "DISK", drawDiskIcon);

    // Info Panel
    ctx.save();
    const panelGrad = ctx.createLinearGradient(60, 490, 1020, 665);
    panelGrad.addColorStop(0, "rgba(0, 30, 70, 0.9)");
    panelGrad.addColorStop(0.5, "rgba(0, 20, 50, 0.95)");
    panelGrad.addColorStop(1, "rgba(0, 30, 70, 0.9)");

    ctx.fillStyle = panelGrad;
    ctx.strokeStyle = "#00bfff";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#00bfff";
    ctx.shadowBlur = 20;

    const px = 60, py = 490, pw = 960, ph = 175, cut = 28;
    ctx.beginPath();
    ctx.moveTo(px + cut, py);
    ctx.lineTo(px + pw - cut, py);
    ctx.lineTo(px + pw, py + cut);
    ctx.lineTo(px + pw, py + ph - cut);
    ctx.lineTo(px + pw - cut, py + ph);
    ctx.lineTo(px + cut, py + ph);
    ctx.lineTo(px, py + ph - cut);
    ctx.lineTo(px, py + cut);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(px + cut, py + 2);
    ctx.lineTo(px + pw - cut, py + 2);
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    ctx.stroke();
    ctx.restore();

    neonLine(ctx, 720, 510, 720, 650, "#00bfff", 2);

    infoRow(ctx, "Uptime", uptime, 530, "#00ff88", "clock");
    infoRow(ctx, "RAM", ram + "%", 570, "#ff267f", "cpu");
    infoRow(ctx, "Memory", `${f(usedRam)} / ${f(totalRam)}`, 610, "#a855f7", "disk");
    infoRow(ctx, "Ping", ping + "ms", 650, "#ffaa00", "wifi");

    ctx.textAlign = "left";
    ctx.font = "italic bold 22px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("•", 500, 570);
    ctx.fillText("Disk", 525, 570);
    ctx.fillStyle = "#00bfff";
    ctx.shadowColor = "#00bfff";
    ctx.shadowBlur = 10;
    ctx.fillText(disk + "%", 590, 570);
    ctx.shadowBlur = 0;

    // 3D Server
    draw3DServer(ctx, 860, 545);

    // ★★★ REPLACED: "KEEP RUNNING" → "MR JUWEL CHAT BOT" ★★★
    ctx.textAlign = "center";
    ctx.font = "italic bold 26px Arial";
    ctx.shadowColor = "#00ffcc";
    ctx.shadowBlur = 20;

    for (let d = 3; d >= 1; d--) {
      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 0;
      ctx.fillText("MR JUWEL CHAT BOT", 855 + d, 665 + d);
    }

    const botGrad = ctx.createLinearGradient(720, 640, 990, 680);
    botGrad.addColorStop(0, "#00ff88");
    botGrad.addColorStop(0.5, "#ffffff");
    botGrad.addColorStop(1, "#00eaff");

    ctx.fillStyle = botGrad;
    ctx.shadowColor = "#00ffcc";
    ctx.shadowBlur = 20;
    ctx.fillText("MR JUWEL CHAT BOT", 855, 665);
    ctx.shadowBlur = 0;

    // ===== Footer watermark (also MR JUWEL CHAT BOT) =====
    drawChatBotWatermark(ctx, W, H);

    // Save
    file = path.join(__dirname, "cache", `upt_${Date.now()}.png`);
    fs.writeFileSync(file, canvas.toBuffer("image/png"));

    api.sendMessage(
      { attachment: fs.createReadStream(file) },
      event.threadID,
      () => { try { if (fs.existsSync(file)) fs.unlinkSync(file); } catch (e) {} },
      event.messageID
    );

  } catch (error) {
    console.error("UPT ERROR:", error);
    if (file && fs.existsSync(file)) { try { fs.unlinkSync(file); } catch (e) {} }
    api.sendMessage("❌ UPT error: " + error.message, event.threadID, event.messageID);
  }
};
