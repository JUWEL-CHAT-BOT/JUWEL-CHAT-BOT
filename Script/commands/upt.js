const { createCanvas } = require('canvas');
const os = require('os');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

module.exports.config = {
  name: "upt",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "MR JUWEL",
  description: "Cyberpunk real-time system monitoring",
  commandCategory: "system",
  usages: "",
  cooldowns: 5
};

// =====================================================
// CACHE
// =====================================================
module.exports.onLoad = () => {
  const cache = path.join(__dirname, "cache");

  if (!fs.existsSync(cache)) {
    fs.mkdirSync(cache, { recursive: true });
  }
};

// =====================================================
// BYTE FORMAT
// =====================================================
const f = (bytes) => {
  if (!bytes || bytes <= 0) return "0 B";

  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return (
    bytes / Math.pow(1024, i)
  ).toFixed(2) + " " + sizes[i];
};

// =====================================================
// CPU USAGE
// =====================================================
let previousCPU = null;

const getCPU = () => {
  let idle = 0;
  let total = 0;

  for (const cpu of os.cpus()) {
    for (const type in cpu.times) {
      total += cpu.times[type];
    }

    idle += cpu.times.idle;
  }

  const current = {
    idle,
    total
  };

  if (!previousCPU) {
    previousCPU = current;
    return 0;
  }

  const idleDiff = current.idle - previousCPU.idle;
  const totalDiff = current.total - previousCPU.total;

  previousCPU = current;

  if (!totalDiff) return 0;

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(100 - (100 * idleDiff) / totalDiff)
    )
  );
};

// =====================================================
// DISK USAGE
// =====================================================
const getDisk = () => {
  try {
    const output = execSync("df -k /").toString();

    const line = output
      .split("\n")
      .filter(x => x.trim())[1];

    const data = line.split(/\s+/);

    const total = parseInt(data[1]) * 1024;
    const used = parseInt(data[2]) * 1024;

    if (!total) return 0;

    return Math.min(
      100,
      Math.round((used / total) * 100)
    );
  } catch (e) {
    return 0;
  }
};

// =====================================================
// ROUNDED RECTANGLE
// =====================================================
const roundedRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();

  ctx.moveTo(x + r, y);

  ctx.arcTo(
    x + w,
    y,
    x + w,
    y + h,
    r
  );

  ctx.arcTo(
    x + w,
    y + h,
    x,
    y + h,
    r
  );

  ctx.arcTo(
    x,
    y + h,
    x,
    y,
    r
  );

  ctx.arcTo(
    x,
    y,
    x + w,
    y,
    r
  );

  ctx.closePath();
};

// =====================================================
// NEON LINE
// =====================================================
const neonLine = (
  ctx,
  x1,
  y1,
  x2,
  y2,
  color,
  width = 3
) => {
  ctx.save();

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);

  ctx.shadowColor = color;
  ctx.shadowBlur = 15;

  ctx.strokeStyle = color;
  ctx.lineWidth = width;

  ctx.stroke();

  ctx.restore();
};

// =====================================================
// CORNER FRAME
// =====================================================
const cornerFrame = (
  ctx,
  x,
  y,
  w,
  h,
  color
) => {
  ctx.save();

  ctx.strokeStyle = color;
  ctx.lineWidth = 6;

  ctx.shadowColor = color;
  ctx.shadowBlur = 18;

  ctx.beginPath();

  // Top left
  ctx.moveTo(x + 45, y);
  ctx.lineTo(x + 5, y);
  ctx.lineTo(x, y + 5);
  ctx.lineTo(x, y + 45);

  // Top right
  ctx.moveTo(x + w - 45, y);
  ctx.lineTo(x + w - 5, y);
  ctx.lineTo(x + w, y + 5);
  ctx.lineTo(x + w, y + 45);

  // Bottom right
  ctx.moveTo(x + w, y + h - 45);
  ctx.lineTo(x + w, y + h - 5);
  ctx.lineTo(x + w - 5, y + h);
  ctx.lineTo(x + w - 45, y + h);

  // Bottom left
  ctx.moveTo(x + 45, y + h);
  ctx.lineTo(x + 5, y + h);
  ctx.lineTo(x, y + h - 5);
  ctx.lineTo(x, y + h - 45);

  ctx.stroke();

  ctx.restore();
};

// =====================================================
// SERVER BACKGROUND
// =====================================================
const drawServerBackground = (ctx, width, height) => {

  // Main dark background
  const bg = ctx.createLinearGradient(
    0,
    0,
    width,
    height
  );

  bg.addColorStop(0, "#020617");
  bg.addColorStop(0.5, "#06152b");
  bg.addColorStop(1, "#020617");

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Grid
  ctx.save();

  ctx.strokeStyle = "rgba(0, 180, 255, 0.08)";
  ctx.lineWidth = 1;

  for (let x = 0; x < width; x += 45) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y < height; y += 45) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.restore();

  // Server rack decorations
  for (let i = 0; i < 7; i++) {

    const x = 35 + i * 155;
    const y = 250 + (i % 2) * 20;

    ctx.fillStyle = "rgba(2, 10, 25, 0.65)";
    ctx.strokeStyle = "rgba(0, 140, 255, 0.18)";
    ctx.lineWidth = 2;

    ctx.fillRect(
      x,
      y,
      115,
      260
    );

    ctx.strokeRect(
      x,
      y,
      115,
      260
    );

    for (let j = 0; j < 6; j++) {

      const ledX = x + 15 + j * 15;

      ctx.beginPath();
      ctx.arc(
        ledX,
        y + 25,
        3,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        j % 2 === 0
          ? "#00ff88"
          : "#00bfff";

      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 10;

      ctx.fill();
    }

    for (let j = 0; j < 8; j++) {

      ctx.fillStyle =
        j % 2 === 0
          ? "rgba(0,255,150,0.15)"
          : "rgba(0,140,255,0.15)";

      ctx.fillRect(
        x + 12,
        y + 55 + j * 23,
        90,
        8
      );
    }
  }

  // Blue glow
  const glow = ctx.createRadialGradient(
    width / 2,
    350,
    20,
    width / 2,
    350,
    600
  );

  glow.addColorStop(
    0,
    "rgba(0,180,255,0.12)"
  );

  glow.addColorStop(
    1,
    "rgba(0,0,0,0)"
  );

  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
};

// =====================================================
// PROGRESS RING
// =====================================================
const drawRing = (
  ctx,
  x,
  y,
  percent,
  color,
  label
) => {

  const radius = 92;
  const thickness = 20;

  // Panel
  ctx.save();

  ctx.fillStyle = "rgba(2, 10, 25, 0.88)";
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;

  ctx.shadowColor = color;
  ctx.shadowBlur = 18;

  roundedRect(
    ctx,
    x - 145,
    y - 145,
    290,
    290,
    25
  );

  ctx.fill();
  ctx.stroke();

  ctx.restore();

  // Background ring
  ctx.beginPath();

  ctx.arc(
    x,
    y,
    radius,
    0,
    Math.PI * 2
  );

  ctx.strokeStyle =
    "rgba(255,255,255,0.12)";

  ctx.lineWidth = thickness;

  ctx.stroke();

  // Progress
  ctx.beginPath();

  ctx.arc(
    x,
    y,
    radius,
    -Math.PI / 2,
    (percent / 100) *
      Math.PI *
      2 -
      Math.PI / 2
  );

  ctx.strokeStyle = color;
  ctx.lineWidth = thickness;
  ctx.lineCap = "round";

  ctx.shadowColor = color;
  ctx.shadowBlur = 18;

  ctx.stroke();

  // Percentage
  ctx.shadowBlur = 0;

  ctx.font = "bold 58px Arial";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(
    percent + "%",
    x,
    y
  );

  // Label
  ctx.font = "bold 30px Arial";
  ctx.fillStyle = color;

  ctx.fillText(
    label,
    x,
    y + 120
  );
};

// =====================================================
// INFO ROW
// =====================================================
const infoRow = (
  ctx,
  label,
  value,
  y,
  color = "#00eaff"
) => {

  ctx.textAlign = "left";

  ctx.font = "bold 27px Arial";
  ctx.fillStyle = "#ffffff";

  ctx.fillText(
    label,
    95,
    y
  );

  ctx.font = "bold 27px Arial";
  ctx.fillStyle = color;

  ctx.fillText(
    value,
    320,
    y
  );
};

// =====================================================
// NO PREFIX HANDLER
// =====================================================
module.exports.handleEvent = async function ({
  api,
  event
}) {

  if (!event.body) return;

  const msg = event.body
    .toLowerCase()
    .trim();

  if (msg === "upt") {

    return module.exports.run({
      api,
      event
    });
  }
};

// =====================================================
// MAIN
// =====================================================
module.exports.run = async function ({
  api,
  event
}) {

  try {

    const startTime = Date.now();

    // -------------------------------
    // SYSTEM DATA
    // -------------------------------
    const cpu = getCPU();

    const totalRam =
      os.totalmem();

    const freeRam =
      os.freemem();

    const usedRam =
      totalRam - freeRam;

    const ram = Math.min(
      100,
      Math.round(
        (usedRam / totalRam) * 100
      )
    );

    const disk = getDisk();

    // -------------------------------
    // UPTIME
    // -------------------------------
    const seconds =
      process.uptime();

    const days =
      Math.floor(seconds / 86400);

    const hours =
      Math.floor(
        (seconds % 86400) / 3600
      );

    const minutes =
      Math.floor(
        (seconds % 3600) / 60
      );

    const secs =
      Math.floor(seconds % 60);

    const uptime =
      `${days}d ${hours}h ${minutes}m ${secs}s`;

    // -------------------------------
    // PING
    // -------------------------------
    const ping =
      Date.now() - startTime;

    // =================================================
    // CANVAS
    // =================================================
    const WIDTH = 1080;
    const HEIGHT = 720;

    const canvas =
      createCanvas(
        WIDTH,
        HEIGHT
      );

    const ctx =
      canvas.getContext("2d");

    // =================================================
    // BACKGROUND
    // =================================================
    drawServerBackground(
      ctx,
      WIDTH,
      HEIGHT
    );

    // =================================================
    // OUTER FRAME
    // =================================================
    cornerFrame(
      ctx,
      20,
      20,
      1040,
      680,
      "#00ff88"
    );

    cornerFrame(
      ctx,
      32,
      32,
      1016,
      656,
      "#00bfff"
    );

    // =================================================
    // TOP TITLE
    // =================================================
    ctx.textAlign = "center";

    ctx.shadowColor =
      "#00ff88";

    ctx.shadowBlur = 25;

    ctx.font =
      "bold 70px Arial";

    ctx.fillStyle =
      "#ffffff";

    ctx.fillText(
      "SYSTEM STATUS",
      540,
      105
    );

    ctx.shadowBlur = 0;

    ctx.font =
      "bold 28px Arial";

    ctx.fillStyle =
      "#00eaff";

    ctx.fillText(
      "REAL-TIME SERVER MONITORING",
      540,
      145
    );

    // Decorative lines
    neonLine(
      ctx,
      100,
      165,
      390,
      165,
      "#00ff88",
      4
    );

    neonLine(
      ctx,
      690,
      165,
      980,
      165,
      "#00bfff",
      4
    );

    // =================================================
    // SYSTEM RINGS
    // =================================================
    drawRing(
      ctx,
      240,
      320,
      cpu,
      "#00ff88",
      "CPU"
    );

    drawRing(
      ctx,
      540,
      320,
      ram,
      "#ff267f",
      "RAM"
    );

    drawRing(
      ctx,
      840,
      320,
      disk,
      "#00bfff",
      "DISK"
    );

    // =================================================
    // LOWER INFORMATION PANEL
    // =================================================
    ctx.save();

    ctx.fillStyle =
      "rgba(1, 8, 22, 0.94)";

    ctx.strokeStyle =
      "#00bfff";

    ctx.lineWidth = 3;

    ctx.shadowColor =
      "#00bfff";

    ctx.shadowBlur = 15;

    roundedRect(
      ctx,
      60,
      485,
      960,
      175,
      25
    );

    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // Divider
    neonLine(
      ctx,
      700,
      505,
      700,
      640,
      "#00bfff",
      2
    );

    // =================================================
    // INFORMATION
    // =================================================
    infoRow(
      ctx,
      "UPTIME",
      uptime,
      525,
      "#00ff88"
    );

    infoRow(
      ctx,
      "RAM",
      ram + "%",
      560,
      "#ff267f"
    );

    infoRow(
      ctx,
      "DISK",
      disk + "%",
      595,
      "#00bfff"
    );

    infoRow(
      ctx,
      "MEMORY",
      `${f(usedRam)} / ${f(totalRam)}`,
      630,
      "#a855f7"
    );

    // =================================================
    // PING
    // =================================================
    let pingColor;

    if (ping < 80) {
      pingColor = "#00ff88";
    } else if (ping < 150) {
      pingColor = "#ffaa00";
    } else {
      pingColor = "#ff3366";
    }

    ctx.font =
      "bold 25px Arial";

    ctx.textAlign =
      "center";

    ctx.fillStyle =
      pingColor;

    ctx.shadowColor =
      pingColor;

    ctx.shadowBlur = 15;

    ctx.fillText(
      `PING  →  ${ping}ms`,
      860,
      545
    );

    // =================================================
    // SERVER ICON
    // =================================================
    ctx.shadowBlur = 15;

    ctx.strokeStyle =
      "#00eaff";

    ctx.lineWidth = 4;

    // Server body
    roundedRect(
      ctx,
      785,
      570,
      150,
      55,
      10
    );

    ctx.stroke();

    roundedRect(
      ctx,
      785,
      630,
      150,
      20,
      8
    );

    ctx.stroke();

    // Server lights
    const lights = [
      "#00ff88",
      "#00bfff",
      "#ff267f"
    ];

    lights.forEach(
      (color, index) => {

        ctx.beginPath();

        ctx.arc(
          810 + index * 25,
          597,
          5,
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          color;

        ctx.shadowColor =
          color;

        ctx.shadowBlur = 12;

        ctx.fill();
      }
    );

    // =================================================
    // STATUS TEXT
    // =================================================
    ctx.shadowBlur = 0;

    ctx.font =
      "bold 25px Arial";

    ctx.fillStyle =
      "#00ffcc";

    ctx.fillText(
      "● SERVER ONLINE",
      860,
      680
    );

    // =================================================
    // SAVE IMAGE
    // =================================================
    const file =
      path.join(
        __dirname,
        "cache",
        "upt.png"
      );

    fs.writeFileSync(
      file,
      canvas.toBuffer("image/png")
    );

    // =================================================
    // SEND IMAGE
    // =================================================
    api.sendMessage(
      {
        attachment:
          fs.createReadStream(file)
      },
      event.threadID,
      () => {

        try {
          if (fs.existsSync(file)) {
            fs.unlinkSync(file);
          }
        } catch (err) {}

      },
      event.messageID
    );

  } catch (error) {

    console.error(
      "UPT ERROR:",
      error
    );

    api.sendMessage(
      "❌ UPT image generate error",
      event.threadID,
      event.messageID
    );
  }
};

এটা সরাসরি আগের "upt.js" ফাইলের জায়গায় বসাতে পারো। এতে আলাদা background image ফাইল লাগবে না—background, neon frame, server-room effect, rings এবং information panel সব Canvas দিয়েই তৈরি হবে।
