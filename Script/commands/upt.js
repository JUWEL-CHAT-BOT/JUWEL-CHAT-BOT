const { createCanvas } = require('canvas');
const os = require('os');
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

module.exports.config = {
  name: "upt",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "MR JUWEL",
  description: "Ultra System Monitor Dashboard",
  commandCategory: "system",
  usages: "",
  cooldowns: 5
};

module.exports.onLoad = () => {
  const cache = path.join(__dirname, "cache");
  if (!fs.existsSync(cache)) fs.mkdirSync(cache, { recursive: true });
};

/* ---------- CPU ---------- */
let prev = null;
const getCPU = () => {
  let idle = 0, total = 0;
  for (const c of os.cpus()) {
    for (const t in c.times) total += c.times[t];
    idle += c.times.idle;
  }
  const cur = { idle, total };
  if (!prev) { prev = cur; return 0; }
  const di = cur.idle - prev.idle;
  const dt = cur.total - prev.total;
  prev = cur;
  return dt ? Math.round(100 - (100 * di / dt)) : 0;
};

/* ---------- Disk ---------- */
const getDiskInfo = () => {
  try {
    const out = execSync('df -h').toString().split('\n').slice(1, 4);
    return out.map(l => {
      const p = l.split(/\s+/);
      return { mount: p[5], used: p[2], total: p[1], percent: p[4] };
    });
  } catch {
    return [];
  }
};

/* ---------- Ping ---------- */
const getPing = () => {
  try {
    const res = execSync('ping -c 1 8.8.8.8').toString();
    const match = res.match(/time=(\d+\.?\d*)/);
    return match ? Math.round(Number(match[1])) : 0;
  } catch {
    return 0;
  }
};

/* ---------- Process ---------- */
const getTopProcess = () => {
  try {
    const res = execSync('ps -eo pid,comm,%cpu,%mem --sort=-%cpu | head -6')
      .toString()
      .split('\n')
      .slice(1, 6);

    return res.map(l => l.trim()).filter(Boolean);
  } catch {
    return [];
  }
};

/* ---------- Health ---------- */
const healthScore = (cpu, ram, disk, ping) => {
  let score = 100;
  score -= cpu * 0.4;
  score -= ram * 0.3;
  score -= disk * 0.2;
  score -= ping * 0.1;
  return Math.max(0, Math.round(score));
};

module.exports.handleEvent = async ({ api, event }) => {
  if (!event.body) return;
  if (event.body.trim().toLowerCase() === "upt") {
    return module.exports.run({ api, event });
  }
};

module.exports.run = async ({ api, event }) => {
  try {

    getCPU();
    await new Promise(r => setTimeout(r, 400));
    const cpu = getCPU();

    const totalRam = os.totalmem();
    const usedRam = totalRam - os.freemem();
    const ram = Math.round((usedRam / totalRam) * 100);

    const diskRaw = getDiskInfo();
    const disk = diskRaw.length ? parseInt(diskRaw[0].percent) : 0;

    const ping = getPing();
    const health = healthScore(cpu, ram, disk, ping);

    const uptimeSec = process.uptime();
    const uptime = `${Math.floor(uptimeSec/3600)}h ${Math.floor(uptimeSec%3600/60)}m ${Math.floor(uptimeSec%60)}s`;

    const processes = getTopProcess();

    const canvas = createCanvas(1080, 780);
    const c = canvas.getContext('2d');

    /* =======================================================
       🎨 ONLY COLOR + FRAME CHANGED
    ======================================================= */

    /* ---------- Background ---------- */
    const bg = c.createLinearGradient(0, 0, 1080, 780);
    bg.addColorStop(0, '#000000');
    bg.addColorStop(1, '#111111');
    c.fillStyle = bg;
    c.fillRect(0, 0, 1080, 780);

    /* ---------- Outer Frame (RED) ---------- */
    c.strokeStyle = '#ff0000';
    c.lineWidth = 7;
    c.shadowColor = '#ff0000';
    c.shadowBlur = 25;
    c.beginPath();
    c.roundRect(20, 20, 1040, 740, 50);
    c.stroke();

    /* ---------- Main Panel ---------- */
    c.shadowBlur = 0;
    c.fillStyle = 'rgba(0, 0, 0, 0.85)';
    c.beginPath();
    c.roundRect(45, 45, 990, 690, 40);
    c.fill();

    /* ---------- Inner Border (GREEN) ---------- */
    c.strokeStyle = '#00ff00';
    c.lineWidth = 2;
    c.beginPath();
    c.roundRect(60, 60, 960, 660, 35);
    c.stroke();

    /* ======================================================= */

    /* ---------- Avatar ---------- */
    c.beginPath();
    c.arc(540,110,50,0,Math.PI*2);
    c.fillStyle = '#ffff00';
    c.fill();
    c.fillStyle = '#000';
    c.font = 'bold 20px Arial';
    c.fillText("UP",525,118);

    /* ---------- Title ---------- */
    c.fillStyle = '#ffff00';
    c.font = 'bold 60px Arial';
    c.textAlign = 'center';
    c.fillText("ULTRA SYSTEM DASHBOARD",540,210);

    /* ---------- Stats ---------- */
    c.textAlign = 'left';
    c.font = '28px Arial';

    c.fillStyle = '#00ff00';
    c.fillText(`CPU: ${cpu}%   RAM: ${ram}%   DISK: ${disk}%`,80,280);
    c.fillText(`Health Score: ${health}%`,80,320);

    c.fillStyle = '#ffffff';
    c.fillText(`Uptime: ${uptime}`,80,360);
    c.fillText(`Ping: ${ping} ms`,80,400);

    /* ---------- Disk ---------- */
    let y = 460;
    c.fillStyle = '#ff0000';
    c.fillText("DISK PARTITIONS:",80,y);

    diskRaw.slice(0,3).forEach(d => {
      y += 35;
      c.fillStyle = '#00ff00';
      c.fillText(`${d.mount} -> ${d.used}/${d.total} (${d.percent})`,100,y);
    });

    /* ---------- Processes ---------- */
    y += 60;
    c.fillStyle = '#ffff00';
    c.fillText("TOP PROCESSES:",80,y);

    processes.forEach(p => {
      y += 30;
      c.fillStyle = '#cccccc';
      c.fillText(p,100,y);
    });

    /* ---------- Owner ---------- */
    c.fillStyle = '#00ff00';
    c.fillText("Owner: MR JUWEL",700,280);
    c.fillText(`OS: ${os.platform()}`,700,320);
    c.fillText(`CPU Cores: ${os.cpus().length}`,700,360);

    const file = path.join(__dirname,'cache','upt.png');
    fs.writeFileSync(file, canvas.toBuffer());

    return api.sendMessage(
      { attachment: fs.createReadStream(file) },
      event.threadID,
      () => fs.unlinkSync(file),
      event.messageID
    );

  } catch (e) {
    return api.sendMessage("❌ Dashboard error", event.threadID, event.messageID);
  }
};
