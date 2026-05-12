module.exports.config = {
  name: "joinnoti",
  eventType: ["log:subscribe"],
  version: "7.1.0",
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "Ultra Join System + VIP + Daily Report + 10 Frame Auto System",
  dependencies: {
    "axios": "",
    "moment-timezone": "",
    "fs-extra": ""
  }
};

const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");

const cooldown = {};
const VIP_UID = ["100071528325738"];

const filePath = path.join(__dirname, "cache", "dailyJoin.json");
const frameFile = path.join(__dirname, "cache", "frame.json");

/* ================= FRAME SYSTEM ================= */
function loadFrame() {
  if (!fs.existsSync(frameFile)) return {};
  return JSON.parse(fs.readFileSync(frameFile));
}

function saveFrame(data) {
  fs.writeFileSync(frameFile, JSON.stringify(data, null, 2));
}

/* ================= ENSURE FILE ================= */
function ensureFile() {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
}

/* ================= LOAD DATA ================= */
function loadData() {
  ensureFile();
  return JSON.parse(fs.readFileSync(filePath));
}

/* ================= SAVE DATA ================= */
function saveData(data) {
  ensureFile();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/* ================= MAIN EVENT ================= */
module.exports.run = async function ({ api, event, Users }) {
  try {
    const { threadID, author } = event;

    const now = Date.now();
    const today = moment.tz("Asia/Dhaka").format("DD-MM-YYYY");
    const time = moment.tz("Asia/Dhaka").format("hh:mm A");
    const date = moment.tz("Asia/Dhaka").format("DD/MM/YYYY");

    const prefix = global.config.PREFIX || "/";

    const threadInfo = await api.getThreadInfo(threadID);
    const threadName = threadInfo.threadName;

    let data = loadData();
    let frameDB = loadFrame();

    if (!data[threadID]) data[threadID] = { date: today, count: 0 };
    if (!frameDB[threadID]) frameDB[threadID] = 1;

    if (data[threadID].date !== today) {
      data[threadID].date = today;
      data[threadID].count = 0;
    }

    /* ================= AUTO FRAME ROTATE ================= */
    if (!global.autoFrameIndex) global.autoFrameIndex = {};
    if (!global.autoFrameIndex[threadID]) {
      global.autoFrameIndex[threadID] = 1;
    } else {
      global.autoFrameIndex[threadID]++;
      if (global.autoFrameIndex[threadID] > 10) {
        global.autoFrameIndex[threadID] = 1;
      }
    }

    const frame = global.autoFrameIndex[threadID];

    /* ================= BOT JOIN ================= */
    if (
      event.logMessageData.addedParticipants.some(
        u => u.userFbId == api.getCurrentUserID()
      )
    ) {
      return api.sendMessage(
`🤖 BOT ACTIVATED 🤖

🔹 Prefix : ${prefix}
🕒 ${time}
📅 ${date}
👑 Owner : MR JUWEL`,
        threadID
      );
    }

    /* ================= COOLDOWN ================= */
    if (cooldown[threadID] && now - cooldown[threadID] < 30000) return;
    cooldown[threadID] = now;

    const addedUsers = event.logMessageData.addedParticipants;

    const mentions = addedUsers.map(u => ({
      tag: u.fullName,
      id: u.userFbId
    }));

    const names = addedUsers.map(u => u.fullName);
    const count = addedUsers.length;

    const adderName = await Users.getNameUser(author);

    const isVIP = addedUsers.some(u => VIP_UID.includes(u.userFbId));

    /* ================= DAILY COUNT ================= */
    data[threadID].count += count;
    saveData(data);

    /* ================= VIP FRAME ================= */
    if (isVIP) {
      return api.sendMessage({
        body:
`👑 VIP ACCESS 👑

✨ WELCOME JUWEL BOSS ✨

👤 Name : ${names.join(", ")}
🏡 Group : ${threadName}

📊 Today Join : ${data[threadID].count}

🕒 ${time}
📅 ${date}`,
        mentions
      }, threadID);
    }

    /* ================= BIG JOIN ================= */
    if (count >= 5) {
      return api.sendMessage({
        body:
`⚡ GROUP UPDATE ⚡

👥 ${count} Members Joined
➕ Added By : ${adderName}
🏡 Group : ${threadName}
📊 Today Total : ${data[threadID].count}

🕒 ${time}
📅 ${date}`,
        mentions
      }, threadID);
    }

    /* ================= FRAME SYSTEM ================= */

    let msg = "";

    if (frame === 1) {
      msg = `╔═══💖WELCOME💖═══╗
👤 Name : ${names.join(", ")}
👥 Joined : ${count}
➕ Added By : ${adderName}
🏡 Group : ${threadName}
🕒 ${time}
📅 ${date}
╚═════════════════╝`;
    }

    if (frame === 2) {
      msg = `╭━━━〔💖WELCOME💖〕━━━╮
┃ 👤 ${names.join(", ")}
┃ 👥 Joined: ${count}
┃ ➕ By: ${adderName}
┃ 🏡 ${threadName}
┃ 🕒 ${time}
┃ 📅 ${date}
╰━━━━━━━━━━━━━━━━━╯`;
    }

    if (frame === 3) {
      msg = `┏━━━❖━━━━━━━━━❖━━━┓
⚡ WELCOME SYSTEM ⚡
┗━━━❖━━━━━━━━━❖━━━┛

👤 Name : ${names.join(", ")}
👥 Joined : ${count}
➕ Added By : ${adderName}
🏡 Group : ${threadName}

🕒 ${time}
📅 ${date}`;
    }

    if (frame === 4) {
      msg = `♡━━━━━━━━━━━━━♡
🌸 Welcome 🌸
♡━━━━━━━━━━━━━♡

👤 ${names.join(", ")}
👥 +${count} joined
➕ by ${adderName}
🏡 ${threadName}

🕒 ${time}
📅 ${date}
♡━━━━━━━━━━━━━♡`;
    }

    if (frame === 5) {
      msg = `╔══════✨══════╗
   🌸 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 🌸
╚══════✨══════╝

👤 ${names.join(", ")}
👥 Joined: ${count}
➕ By: ${adderName}
🏡 ${threadName}

🕒 ${time}
📅 ${date}`;
    }

    if (frame === 6) {
      msg = `╭─❖💎VIP STYLE💎❖─╮
┃ 👤 ${names.join(", ")}
┃ 👥 +${count} joined
┃ ➕ ${adderName}
┃ 🏡 ${threadName}
┃ 🕒 ${time}
┃ 📅 ${date}
╰────────────────╯`;
    }

    if (frame === 7) {
      msg = `┏━━━━━━━━━━━━━┓
   🎉 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 🎉
┗━━━━━━━━━━━━━┛

👤 ${names.join(", ")}
👥 Members: ${count}
➕ Added By: ${adderName}
🏡 ${threadName}

🕒 ${time}
📅 ${date}`;
    }

    if (frame === 8) {
      msg = `♡━━━━━━━━━━━━♡
   🌷 HELLO NEW USER 🌷
♡━━━━━━━━━━━━♡

👤 ${names.join(", ")}
👥 Joined: ${count}
➕ ${adderName}
🏡 ${threadName}

🕒 ${time}
📅 ${date}
♡━━━━━━━━━━━━♡`;
    }

    if (frame === 9) {
      msg = `┌───〔JOIN ALERT───┐
👤 ${names.join(", ")}
👥 +${count} new
➕ By: ${adderName}
🏡 ${threadName}
🕒 ${time}
📅 ${date}
└────────────────┘`;
    }

    if (frame === 10) {
      msg = `╔═━✦❘༻༺❘✦━═╗
      🚀 WELCOME 🚀
╚═━━✦❘༻༺❘✦━━═╝

👤 ${names.join(", ")}
👥 Joined: ${count}
➕ ${adderName}
🏡 ${threadName}

🕒 ${time}
📅 ${date}`;
    }

    return api.sendMessage({
      body: msg,
      mentions
    }, threadID);

  } catch (e) {
    console.log("JoinNoti Error:", e);
  }
};
