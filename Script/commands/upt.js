/**
 * ╔══════════════════════════════════════════════╗
 * ║              MR JUWEL CHAT BOT              ║
 * ║              SYSTEM STATUS UPT              ║
 * ╚══════════════════════════════════════════════╝
 */

const { createCanvas } = require("canvas");
const os = require("os");
const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");

module.exports.config = {
  name: "upt",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "Simple System Status with 3D background",
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
    fs.mkdirSync(cache, {
      recursive: true
    });
  }
};


// ═══════════════════════════════════════════════
// BYTE FORMAT
// ═══════════════════════════════════════════════

function formatBytes(bytes) {

  if (!bytes || bytes <= 0) {
    return "0 B";
  }

  const units = [
    "B",
    "KB",
    "MB",
    "GB",
    "TB"
  ];

  const i = Math.floor(
    Math.log(bytes) /
    Math.log(1024)
  );

  return (
    bytes /
    Math.pow(1024, i)
  ).toFixed(2) +
  " " +
  units[i];
}


// ═══════════════════════════════════════════════
// CPU USAGE
// ═══════════════════════════════════════════════

let oldCPU = null;

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

  if (!oldCPU) {
    oldCPU = current;
    return 0;
  }

  const idleDiff =
    current.idle -
    oldCPU.idle;

  const totalDiff =
    current.total -
    oldCPU.total;

  oldCPU = current;

  if (!totalDiff) {
    return 0;
  }

  let usage =
    100 -
    (idleDiff / totalDiff) * 100;

  usage = Math.round(usage);

  return Math.max(
    0,
    Math.min(100, usage)
  );
}


// ═══════════════════════════════════════════════
// DISK USAGE
// ═══════════════════════════════════════════════

function getDisk() {

  try {

    const output = execSync(
      "df -k /"
    )
      .toString()
      .trim()
      .split("\n");

    if (!output[1]) {
      return 0;
    }

    const data =
      output[1]
        .split(/\s+/);

    const total =
      parseInt(data[1]) * 1024;

    const used =
      parseInt(data[2]) * 1024;

    if (!total) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (used / total) * 100
      )
    );

  } catch (error) {

    return 0;

  }
}


// ═══════════════════════════════════════════════
// BOT UPTIME
// ═══════════════════════════════════════════════

function getUptime() {

  const seconds =
    Math.floor(
      process.uptime()
    );

  const days =
    Math.floor(
      seconds / 86400
    );

  const hours =
    Math.floor(
      (seconds % 86400) / 3600
    );

  const minutes =
    Math.floor(
      (seconds % 3600) / 60
    );

  const secs =
    seconds % 60;

  return (
    days +
    "d " +
    hours +
    "h " +
    minutes +
    "m " +
    secs +
    "s"
  );
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
// BACKGROUND
// ═══════════════════════════════════════════════

function drawBackground(
  ctx,
  W,
  H
) {

  // Main dark background
  const bg =
    ctx.createLinearGradient(
      0,
      0,
      0,
      H
    );

  bg.addColorStop(
    0,
    "#020914"
  );

  bg.addColorStop(
    0.5,
    "#031322"
  );

  bg.addColorStop(
    1,
    "#020711"
  );

  ctx.fillStyle = bg;

  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  // Center blue glow
  const glow =
    ctx.createRadialGradient(
      W / 2,
      350,
      20,
      W / 2,
      350,
      600
    );

  glow.addColorStop(
    0,
    "rgba(0,170,255,0.12)"
  );

  glow.addColorStop(
    0.5,
    "rgba(0,100,180,0.05)"
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
  // LEFT SERVER RACK
  // ═══════════════════════════════════════════

  function serverRack(
    x,
    y,
    w,
    h
  ) {

    const rack =
      ctx.createLinearGradient(
        x,
        y,
        x + w,
        y
      );

    rack.addColorStop(
      0,
      "#071827"
    );

    rack.addColorStop(
      0.5,
      "#0a1d2e"
    );

    rack.addColorStop(
      1,
      "#020914"
    );

    ctx.fillStyle = rack;

    ctx.shadowColor =
      "rgba(0,170,255,0.18)";

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
      "rgba(0,170,255,0.20)";

    ctx.lineWidth = 2;

    ctx.stroke();


    // Server slots
    for (
      let i = 0;
      i < 7;
      i++
    ) {

      const sy =
        y +
        25 +
        i * 58;

      roundedRect(
        ctx,
        x + 15,
        sy,
        w - 30,
        38,
        5
      );

      ctx.fillStyle =
        "rgba(0,0,0,0.35)";

      ctx.fill();


      // tiny lights
      for (
        let j = 0;
        j < 3;
        j++
      ) {

        ctx.beginPath();

        ctx.arc(
          x + 30 +
          j * 13,
          sy + 19,
          3,
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          j === 0
            ? "#00ff88"
            : "#008cff";

        ctx.shadowColor =
          ctx.fillStyle;

        ctx.shadowBlur = 10;

        ctx.fill();

        ctx.shadowBlur = 0;
      }
    }
  }


  serverRack(
    45,
    150,
    175,
    410
  );

  serverRack(
    W - 220,
    150,
    175,
    410
  );


  // ═══════════════════════════════════════════
  // CENTER BACK SERVER
  // ═══════════════════════════════════════════

  const centerX =
    W / 2;

  const centerY =
    450;

  ctx.save();

  ctx.shadowColor =
    "rgba(0,170,255,0.25)";

  ctx.shadowBlur = 30;

  roundedRect(
    ctx,
    centerX - 110,
    centerY - 80,
    220,
    150,
    15
  );

  ctx.fillStyle =
    "rgba(5,24,40,0.7)";

  ctx.fill();

  ctx.strokeStyle =
    "rgba(0,180,255,0.25)";

  ctx.stroke();

  ctx.restore();


  // ═══════════════════════════════════════════
  // FLOOR GRID
  // ═══════════════════════════════════════════

  ctx.save();

  ctx.globalAlpha =
    0.15;

  ctx.strokeStyle =
    "#008cff";

  ctx.lineWidth = 1;


  for (
    let i = 0;
    i < 9;
    i++
  ) {

    const y =
      620 +
      i * i * 2.5;

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
      575
    );

    ctx.lineTo(
      W / 2 + i * 100,
      H
    );

    ctx.stroke();
  }

  ctx.restore();


  // Dark overlay
  ctx.fillStyle =
    "rgba(1,7,16,0.25)";

  ctx.fillRect(
    0,
    0,
    W,
    H
  );
}


// ═══════════════════════════════════════════════
// GLASS PANEL
// ═══════════════════════════════════════════════

function drawPanel(
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
    28
  );

  ctx.fillStyle =
    "rgba(2,12,25,0.84)";

  ctx.fill();

  ctx.strokeStyle =
    "rgba(0,190,255,0.35)";

  ctx.lineWidth = 2;

  ctx.stroke();

  ctx.restore();
}


// ═══════════════════════════════════════════════
// RING
// ═══════════════════════════════════════════════

function drawRing(
  ctx,
  x,
  y,
  value,
  color,
  label
) {

  const radius = 92;
  const width = 22;

  ctx.save();


  // Background circle
  ctx.beginPath();

  ctx.arc(
    x,
    y,
    radius,
    0,
    Math.PI * 2
  );

  ctx.lineWidth =
    width;

  ctx.strokeStyle =
    "rgba(80,100,115,0.28)";

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
    width;

  ctx.lineCap =
    "round";

  ctx.strokeStyle =
    color;

  ctx.shadowColor =
    color;

  ctx.shadowBlur =
    22;

  ctx.stroke();

  ctx.shadowBlur = 0;


  // Percentage
  ctx.font =
    "bold 45px Arial";

  ctx.textAlign =
    "center";

  ctx.textBaseline =
    "middle";

  ctx.fillStyle =
    "#ffffff";

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
    y + 70
  );

  ctx.restore();
}


// ═══════════════════════════════════════════════
// NO PREFIX HANDLER
// ═══════════════════════════════════════════════

module.exports.handleEvent =
async function ({
  api,
  event
}) {

  if (!event.body) {
    return;
  }

  const message =
    String(event.body)
      .trim()
      .toLowerCase();

  if (
    message === "upt"
  ) {

    return module.exports.run({
      api,
      event
    });

  }
};


// ═══════════════════════════════════════════════
// MAIN COMMAND
// ═══════════════════════════════════════════════

module.exports.run =
async function ({
  api,
  event
}) {

  let imageFile = null;

  try {

    const start =
      Date.now();


    // ═══════════════════════════════════════════
    // LIVE DATA
    // ═══════════════════════════════════════════

    const cpu =
      getCPU();

    const totalRAM =
      os.totalmem();

    const freeRAM =
      os.freemem();

    const usedRAM =
      totalRAM -
      freeRAM;

    const ram =
      Math.max(
        0,
        Math.min(
          100,
          Math.round(
            (usedRAM /
              totalRAM) *
            100
          )
        )
      );

    const disk =
      getDisk();

    const uptime =
      getUptime();

    const ping =
      Date.now() -
      start;


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
      canvas.getContext(
        "2d"
      );


    // Background
    drawBackground(
      ctx,
      W,
      H
    );


    // Main border panel
    drawPanel(
      ctx,
      25,
      25,
      1030,
      670
    );


    // ═══════════════════════════════════════════
    // SYSTEM STATUS
    // ═══════════════════════════════════════════

    ctx.save();

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";

    ctx.font =
      "bold 62px Arial";

    ctx.fillStyle =
      "#ffffff";

    ctx.shadowColor =
      "#00bfff";

    ctx.shadowBlur =
      18;

    ctx.fillText(
      "SYSTEM STATUS",
      W / 2,
      85
    );

    ctx.restore();


    // ═══════════════════════════════════════════
    // MR JUWEL CHAT BOT
    // ═══════════════════════════════════════════

    ctx.save();

    ctx.textAlign =
      "center";

    ctx.font =
      "bold 27px Arial";

    ctx.fillStyle =
      "#00eaff";

    ctx.shadowColor =
      "#00eaff";

    ctx.shadowBlur =
      15;

    ctx.fillText(
      "MR JUWEL CHAT BOT",
      W / 2,
      135
    );

    ctx.restore();


    // ═══════════════════════════════════════════
    // ADMIN MR JUWEL
    // ═══════════════════════════════════════════

    ctx.save();

    ctx.textAlign =
      "right";

    ctx.font =
      "bold 21px Arial";

    ctx.fillStyle =
      "#00ff88";

    ctx.shadowColor =
      "#00ff88";

    ctx.shadowBlur =
      12;

    ctx.fillText(
      "ADMIN MR JUWEL",
      1015,
      65
    );

    ctx.restore();


    // ═══════════════════════════════════════════
    // UPTIME
    // ═══════════════════════════════════════════

    ctx.save();

    ctx.textAlign =
      "center";

    ctx.font =
      "bold 30px Arial";

    ctx.fillStyle =
      "#a7b5c5";

    ctx.fillText(
      "UPTIME",
      W / 2,
      180
    );


    // BIG UPTIME
    ctx.font =
      "bold 58px Arial";

    ctx.fillStyle =
      "#00ff88";

    ctx.shadowColor =
      "#00ff88";

    ctx.shadowBlur =
      25;

    ctx.fillText(
      uptime,
      W / 2,
      235
    );

    ctx.restore();


    // ═══════════════════════════════════════════
    // CPU
    // ═══════════════════════════════════════════

    drawRing(
      ctx,
      250,
      365,
      cpu,
      "#00ff88",
      "CPU"
    );


    // RAM
    drawRing(
      ctx,
      540,
      365,
      ram,
      "#ff2f82",
      "RAM"
    );


    // DISK
    drawRing(
      ctx,
      830,
      365,
      disk,
      "#00aaff",
      "DISK"
    );


    // ═══════════════════════════════════════════
    // INFORMATION BOX
    // ═══════════════════════════════════════════

    drawPanel(
      ctx,
      105,
      505,
      870,
      125
    );


    // MEMORY LABEL
    ctx.textAlign =
      "left";

    ctx.font =
      "bold 22px Arial";

    ctx.fillStyle =
      "#91a6bb";

    ctx.fillText(
      "MEMORY",
      140,
      545
    );


    // MEMORY VALUE
    ctx.font =
      "bold 24px Arial";

    ctx.fillStyle =
      "#ff2f82";

    ctx.fillText(
      `${formatBytes(usedRAM)} / ${formatBytes(totalRAM)}`,
      290,
      545
    );


    // STATUS
    ctx.font =
      "bold 22px Arial";

    ctx.fillStyle =
      "#91a6bb";

    ctx.fillText(
      "STATUS",
      650,
      545
    );


    // ONLINE
    ctx.font =
      "bold 24px Arial";

    ctx.fillStyle =
      "#00ff88";

    ctx.shadowColor =
      "#00ff88";

    ctx.shadowBlur =
      15;

    ctx.fillText(
      "● ONLINE",
      775,
      545
    );

    ctx.shadowBlur = 0;


    // PING
    ctx.font =
      "bold 22px Arial";

    ctx.fillStyle =
      "#91a6bb";

    ctx.fillText(
      "PING",
      140,
      590
    );


    ctx.font =
      "bold 24px Arial";

    ctx.fillStyle =
      ping < 100
        ? "#00ff88"
        : "#ffaa00";

    ctx.fillText(
      ping + " ms",
      290,
      590
    );


    // DISK
    ctx.font =
      "bold 22px Arial";

    ctx.fillStyle =
      "#91a6bb";

    ctx.fillText(
      "DISK",
      650,
      590
    );


    ctx.font =
      "bold 24px Arial";

    ctx.fillStyle =
      "#00aaff";

    ctx.fillText(
      disk + "%",
      775,
      590
    );


    // ═══════════════════════════════════════════
    // FOOTER
    // ═══════════════════════════════════════════

    ctx.save();

    ctx.textAlign =
      "center";

    ctx.font =
      "bold 23px Arial";

    ctx.fillStyle =
      "#00d9ff";

    ctx.shadowColor =
      "#00d9ff";

    ctx.shadowBlur =
      15;

    ctx.fillText(
      "MR JUWEL CHAT BOT",
      W / 2,
      665
    );

    ctx.restore();


    // ═══════════════════════════════════════════
    // SAVE
    // ═══════════════════════════════════════════

    imageFile =
      path.join(
        __dirname,
        "cache",
        `upt_${Date.now()}.png`
      );

    fs.writeFileSync(
      imageFile,
      canvas.toBuffer(
        "image/png"
      )
    );


    // ═══════════════════════════════════════════
    // SEND
    // ═══════════════════════════════════════════

    api.sendMessage(
      {
        attachment:
          fs.createReadStream(
            imageFile
          )
      },
      event.threadID,
      () => {

        try {

          if (
            imageFile &&
            fs.existsSync(
              imageFile
            )
          ) {

            fs.unlinkSync(
              imageFile
            );

          }

        } catch (e) {

          console.log(
            "UPT cache delete error:",
            e
          );

        }

      },
      event.messageID
    );


  } catch (error) {

    console.error(
      "========== UPT ERROR =========="
    );

    console.error(
      error
    );

    console.error(
      "================================"
    );

    api.sendMessage(
      "❌ UPT image generate error!",
      event.threadID,
      event.messageID
    );

  }
};
