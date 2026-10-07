/**
 * ╔══════════════════════════════════════════════╗
 * ║              UPTIME MONITOR                 ║
 * ║              MR JUWEL CHAT BOT              ║
 * ╚══════════════════════════════════════════════╝
 */

const { createCanvas } = require("canvas");
const os = require("os");
const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");

module.exports.config = {
  name: "upt",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "3D System Status & Uptime",
  commandCategory: "system",
  usages: "",
  cooldowns: 5
};


// ═══════════════════════════════════════════════
// CACHE
// ═══════════════════════════════════════════════

module.exports.onLoad = () => {
  const cache = path.join(__dirname, "cache");

  if (!fs.existsSync(cache)) {
    fs.mkdirSync(cache, { recursive: true });
  }
};


// ═══════════════════════════════════════════════
// FORMAT BYTES
// ═══════════════════════════════════════════════

function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(
    Math.log(bytes) / Math.log(1024)
  );

  return (
    bytes / Math.pow(1024, i)
  ).toFixed(2) + " " + units[i];
}


// ═══════════════════════════════════════════════
// CPU
// ═══════════════════════════════════════════════

let previousCPU = null;

function getCPU() {

  const cpus = os.cpus();

  let idle = 0;
  let total = 0;

  for (const cpu of cpus) {

    idle += cpu.times.idle;

    for (const type in cpu.times) {
      total += cpu.times[type];
    }

  }

  const current = {
    idle,
    total
  };

  if (!previousCPU) {
    previousCPU = current;
    return 0;
  }

  const idleDiff =
    current.idle - previousCPU.idle;

  const totalDiff =
    current.total - previousCPU.total;

  previousCPU = current;

  if (!totalDiff) return 0;

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        100 -
        (idleDiff / totalDiff) * 100
      )
    )
  );
}


// ═══════════════════════════════════════════════
// DISK
// ═══════════════════════════════════════════════

function getDisk() {

  try {

    const result = execSync("df -k /")
      .toString()
      .trim()
      .split("\n")[1]
      .split(/\s+/);

    const total =
      parseInt(result[1]) * 1024;

    const used =
      parseInt(result[2]) * 1024;

    if (!total) return 0;

    return Math.min(
      100,
      Math.round(
        (used / total) * 100
      )
    );

  } catch (e) {

    return 0;

  }
}


// ═══════════════════════════════════════════════
// UPTIME
// ═══════════════════════════════════════════════

function getUptime() {

  const sec =
    Math.floor(process.uptime());

  const days =
    Math.floor(sec / 86400);

  const hours =
    Math.floor(
      (sec % 86400) / 3600
    );

  const minutes =
    Math.floor(
      (sec % 3600) / 60
    );

  const seconds =
    sec % 60;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}


// ═══════════════════════════════════════════════
// ROUNDED RECTANGLE
// ═══════════════════════════════════════════════

function roundedRect(
  ctx,
  x,
  y,
  w,
  h,
  r
) {

  ctx.beginPath();

  ctx.moveTo(
    x + r,
    y
  );

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
}


// ═══════════════════════════════════════════════
// 3D BACKGROUND
// ═══════════════════════════════════════════════

function drawBackground(
  ctx,
  W,
  H
) {

  // Main background
  const bg =
    ctx.createLinearGradient(
      0,
      0,
      W,
      H
    );

  bg.addColorStop(
    0,
    "#020817"
  );

  bg.addColorStop(
    0.5,
    "#071a2d"
  );

  bg.addColorStop(
    1,
    "#020611"
  );

  ctx.fillStyle = bg;

  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  // ═══════════════════════════════════════════
  // BACK GLOW
  // ═══════════════════════════════════════════

  const glow =
    ctx.createRadialGradient(
      W / 2,
      280,
      20,
      W / 2,
      280,
      550
    );

  glow.addColorStop(
    0,
    "rgba(0,180,255,0.18)"
  );

  glow.addColorStop(
    1,
    "rgba(0,0,0,0)"
  );

  ctx.fillStyle = glow;

  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  // ═══════════════════════════════════════════
  // SERVER RACKS
  // ═══════════════════════════════════════════

  function rack(
    x,
    y,
    w,
    h
  ) {

    const gradient =
      ctx.createLinearGradient(
        x,
        y,
        x + w,
        y + h
      );

    gradient.addColorStop(
      0,
      "#10263d"
    );

    gradient.addColorStop(
      0.5,
      "#061321"
    );

    gradient.addColorStop(
      1,
      "#02070e"
    );

    ctx.fillStyle = gradient;

    ctx.shadowColor =
      "rgba(0,150,255,0.25)";

    ctx.shadowBlur = 25;

    roundedRect(
      ctx,
      x,
      y,
      w,
      h,
      15
    );

    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.strokeStyle =
      "rgba(0,190,255,0.35)";

    ctx.lineWidth = 2;

    ctx.stroke();


    // Server slots
    for (
      let i = 0;
      i < 8;
      i++
    ) {

      const sy =
        y + 25 + i * 52;

      ctx.fillStyle =
        "rgba(0,0,0,0.5)";

      roundedRect(
        ctx,
        x + 12,
        sy,
        w - 24,
        34,
        5
      );

      ctx.fill();


      // LED
      ctx.beginPath();

      ctx.arc(
        x + w - 35,
        sy + 17,
        4,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        i % 2 === 0
          ? "#00ff88"
          : "#00aaff";

      ctx.shadowColor =
        ctx.fillStyle;

      ctx.shadowBlur = 12;

      ctx.fill();

      ctx.shadowBlur = 0;
    }
  }


  rack(
    40,
    125,
    190,
    440
  );

  rack(
    W - 230,
    125,
    190,
    440
  );


  // ═══════════════════════════════════════════
  // 3D FLOOR
  // ═══════════════════════════════════════════

  ctx.save();

  ctx.globalAlpha = 0.18;

  ctx.strokeStyle =
    "#00baff";

  ctx.lineWidth = 2;


  for (
    let i = 0;
    i < 9;
    i++
  ) {

    const y =
      590 + i * i * 3;

    ctx.beginPath();

    ctx.moveTo(
      0,
      y
    );

    ctx.lineTo(
      W,
      y
    );

    ctx.stroke();
  }


  for (
    let i = -10;
    i <= 10;
    i++
  ) {

    ctx.beginPath();

    ctx.moveTo(
      W / 2,
      550
    );

    ctx.lineTo(
      W / 2 + i * 100,
      H
    );

    ctx.stroke();
  }

  ctx.restore();


  // ═══════════════════════════════════════════
  // DARK OVERLAY
  // ═══════════════════════════════════════════

  ctx.fillStyle =
    "rgba(2,7,18,0.35)";

  ctx.fillRect(
    0,
    0,
    W,
    H
  );
}


// ═══════════════════════════════════════════════
// STATUS RING
// ═══════════════════════════════════════════════

function drawRing(
  ctx,
  x,
  y,
  value,
  color,
  label
) {

  const radius = 88;
  const thickness = 20;

  ctx.save();

  // Background
  ctx.beginPath();

  ctx.arc(
    x,
    y,
    radius,
    0,
    Math.PI * 2
  );

  ctx.lineWidth =
    thickness;

  ctx.strokeStyle =
    "rgba(255,255,255,0.10)";

  ctx.stroke();


  // Progress
  ctx.beginPath();

  ctx.arc(
    x,
    y,
    radius,
    -Math.PI / 2,
    -Math.PI / 2 +
    Math.PI * 2 *
    (value / 100)
  );

  ctx.lineWidth =
    thickness;

  ctx.strokeStyle =
    color;

  ctx.lineCap =
    "round";

  ctx.shadowColor =
    color;

  ctx.shadowBlur =
    20;

  ctx.stroke();

  ctx.shadowBlur = 0;


  // Value
  ctx.font =
    "bold 45px Arial";

  ctx.fillStyle =
    "#ffffff";

  ctx.textAlign =
    "center";

  ctx.textBaseline =
    "middle";

  ctx.fillText(
    value + "%",
    x,
    y
  );


  // Label
  ctx.font =
    "bold 23px Arial";

  ctx.fillStyle =
    color;

  ctx.fillText(
    label,
    x,
    y + 67
  );

  ctx.restore();
}


// ═══════════════════════════════════════════════
// GLASS BOX
// ═══════════════════════════════════════════════

function glassBox(
  ctx,
  x,
  y,
  w,
  h
) {

  ctx.save();

  roundedRect(
    ctx,
    x,
    y,
    w,
    h,
    25
  );

  ctx.fillStyle =
    "rgba(3,14,29,0.82)";

  ctx.fill();

  ctx.strokeStyle =
    "rgba(0,200,255,0.45)";

  ctx.lineWidth = 2;

  ctx.shadowColor =
    "rgba(0,180,255,0.25)";

  ctx.shadowBlur = 20;

  ctx.stroke();

  ctx.restore();
}


// ═══════════════════════════════════════════════
// NO PREFIX
// ═══════════════════════════════════════════════

module.exports.handleEvent =
async function ({
  api,
  event
}) {

  if (!event.body)
    return;

  const msg =
    String(event.body)
      .trim()
      .toLowerCase();

  if (msg === "upt") {

    return module.exports.run({
      api,
      event
    });

  }
};


// ═══════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════

module.exports.run =
async function ({
  api,
  event
}) {

  let file = null;

  try {

    const start =
      Date.now();


    // ═══════════════════════════════════════════
    // SYSTEM DATA
    // ═══════════════════════════════════════════

    const cpu =
      getCPU();

    const totalRam =
      os.totalmem();

    const freeRam =
      os.freemem();

    const usedRam =
      totalRam - freeRam;

    const ram =
      Math.round(
        (usedRam / totalRam) * 100
      );

    const disk =
      getDisk();

    const uptime =
      getUptime();

    const ping =
      Date.now() - start;


    // ═══════════════════════════════════════════
    // CANVAS
    // ═══════════════════════════════════════════

    const W = 1080;
    const H = 720;

    const canvas =
      createCanvas(
        W,
        H
      );

    const ctx =
      canvas.getContext("2d");


    // 3D Background
    drawBackground(
      ctx,
      W,
      H
    );


    // ═══════════════════════════════════════════
    // MAIN PANEL
    // ═══════════════════════════════════════════

    glassBox(
      ctx,
      25,
      25,
      1030,
      670
    );


    // ═══════════════════════════════════════════
    // TITLE
    // ═══════════════════════════════════════════

    ctx.save();

    ctx.textAlign =
      "center";

    ctx.font =
      "bold 60px Arial";

    ctx.fillStyle =
      "#ffffff";

    ctx.shadowColor =
      "#00bfff";

    ctx.shadowBlur = 25;

    ctx.fillText(
      "SYSTEM STATUS",
      W / 2,
      88
    );

    ctx.restore();


    // ═══════════════════════════════════════════
    // BOT NAME
    // ═══════════════════════════════════════════

    ctx.save();

    ctx.textAlign =
      "center";

    ctx.font =
      "bold 25px Arial";

    ctx.fillStyle =
      "#00eaff";

    ctx.shadowColor =
      "#00eaff";

    ctx.shadowBlur = 15;

    ctx.fillText(
      "MR JUWEL CHAT BOT",
      W / 2,
      125
    );

    ctx.restore();


    // ═══════════════════════════════════════════
    // ADMIN
    // ═══════════════════════════════════════════

    ctx.font =
      "bold 18px Arial";

    ctx.fillStyle =
      "#00ff88";

    ctx.textAlign =
      "right";

    ctx.shadowColor =
      "#00ff88";

    ctx.shadowBlur = 12;

    ctx.fillText(
      "ADMIN MR JUWEL",
      1010,
      60
    );

    ctx.shadowBlur = 0;


    // ═══════════════════════════════════════════
    // UPTIME — BIG
    // ═══════════════════════════════════════════

    ctx.textAlign =
      "center";

    ctx.font =
      "bold 30px Arial";

    ctx.fillStyle =
      "#8da5c4";

    ctx.fillText(
      "UPTIME",
      W / 2,
      165
    );


    ctx.font =
      "bold 58px Arial";

    ctx.fillStyle =
      "#00ff88";

    ctx.shadowColor =
      "#00ff88";

    ctx.shadowBlur = 25;

    ctx.fillText(
      uptime,
      W / 2,
      220
    );

    ctx.shadowBlur = 0;


    // ═══════════════════════════════════════════
    // RINGS
    // ═══════════════════════════════════════════

    drawRing(
      ctx,
      250,
      340,
      cpu,
      "#00ff88",
      "CPU"
    );

    drawRing(
      ctx,
      540,
      340,
      ram,
      "#ff3b81",
      "RAM"
    );

    drawRing(
      ctx,
      830,
      340,
      disk,
      "#00b7ff",
      "DISK"
    );


    // ═══════════════════════════════════════════
    // BOTTOM INFO
    // ═══════════════════════════════════════════

    glassBox(
      ctx,
      100,
      470,
      880,
      150
    );


    // Memory
    ctx.textAlign =
      "left";

    ctx.font =
      "bold 21px Arial";

    ctx.fillStyle =
      "#8da5c4";

    ctx.fillText(
      "MEMORY",
      135,
      515
    );

    ctx.font =
      "bold 23px Arial";

    ctx.fillStyle =
      "#ff3b81";

    ctx.fillText(
      `${formatBytes(usedRam)} / ${formatBytes(totalRam)}`,
      270,
      515
    );


    // Ping
    ctx.font =
      "bold 21px Arial";

    ctx.fillStyle =
      "#8da5c4";

    ctx.fillText(
      "PING",
      135,
      560
    );

    ctx.font =
      "bold 23px Arial";

    ctx.fillStyle =
      ping < 100
        ? "#00ff88"
        : "#ffaa00";

    ctx.fillText(
      `${ping} ms`,
      270,
      560
    );


    // Status
    ctx.font =
      "bold 21px Arial";

    ctx.fillStyle =
      "#8da5c4";

    ctx.fillText(
      "STATUS",
      600,
      515
    );

    ctx.font =
      "bold 23px Arial";

    ctx.fillStyle =
      "#00ff88";

    ctx.shadowColor =
      "#00ff88";

    ctx.shadowBlur = 12;

    ctx.fillText(
      "● ONLINE",
      735,
      515
    );

    ctx.shadowBlur = 0;


    // Disk
    ctx.font =
      "bold 21px Arial";

    ctx.fillStyle =
      "#8da5c4";

    ctx.fillText(
      "DISK",
      600,
      560
    );

    ctx.font =
      "bold 23px Arial";

    ctx.fillStyle =
      "#00b7ff";

    ctx.fillText(
      disk + "%",
      735,
      560
    );


    // ═══════════════════════════════════════════
    // FOOTER
    // ═══════════════════════════════════════════

    ctx.textAlign =
      "center";

    ctx.font =
      "bold 20px Arial";

    ctx.fillStyle =
      "#00eaff";

    ctx.shadowColor =
      "#00eaff";

    ctx.shadowBlur = 12;

    ctx.fillText(
      "MR JUWEL CHAT BOT",
      W / 2,
      655
    );

    ctx.shadowBlur = 0;


    // ═══════════════════════════════════════════
    // SAVE IMAGE
    // ═══════════════════════════════════════════

    file = path.join(
      __dirname,
      "cache",
      `upt_${Date.now()}.png`
    );

    fs.writeFileSync(
      file,
      canvas.toBuffer("image/png")
    );


    // ═══════════════════════════════════════════
    // SEND IMAGE
    // ═══════════════════════════════════════════

    api.sendMessage(
      {
        attachment:
          fs.createReadStream(file)
      },
      event.threadID,
      () => {

        try {

          if (
            file &&
            fs.existsSync(file)
          ) {

            fs.unlinkSync(file);

          }

        } catch (e) {}

      },
      event.messageID
    );


  } catch (error) {

    console.error(
      "[UPT ERROR]",
      error
    );

    api.sendMessage(
      "❌ UPT image generate error!",
      event.threadID,
      event.messageID
    );

  }
};
