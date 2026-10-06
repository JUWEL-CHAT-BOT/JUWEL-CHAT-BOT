module.exports.config = {
  name: "joinnoti",
  eventType: ["log:subscribe"],
  version: "8.0.7",
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "Ultra Join System + VIP + Daily Report + 10 Frame Auto System + Bot Self Nickname",
  dependencies: {
    "axios": "",
    "moment-timezone": "",
    "fs-extra": ""
  }
};

const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");
const axios = require("axios");

const cooldown = {};

/* ============ Bot Self Nickname ============ */
const AUTO_NICKNAME = "⎯꯭𓆩꯭𝆺𝅥😻⃞𝐑⃞𝐈⃞𝐘⃞𝐀⃞༢࿐";

/* ============ Bot Admin from config.json ============ */
function getBotAdmins() {
  try {
    const cfgPath = path.join(__dirname, "..", "..", "config.json");
    if (fs.existsSync(cfgPath)) {
      const cfg = JSON.parse(fs.readFileSync(cfgPath, "utf-8"));
      if (Array.isArray(cfg.BOT_ADMIN)) return cfg.BOT_ADMIN.map(String);
      if (cfg.BOT_ADMIN) return [String(cfg.BOT_ADMIN)];
      if (Array.isArray(cfg.ADMINBOT)) return cfg.ADMINBOT.map(String);
      if (Array.isArray(cfg.ADMIN)) return cfg.ADMIN.map(String);
    }
  } catch (e) {}
  return ["61594400795920"];
}

const VIP_UID = getBotAdmins();

const filePath = path.join(__dirname, "cache", "dailyJoin.json");

/* ============ FILE HELPERS ============ */
function ensureFile() {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
}
function loadData() {
  ensureFile();
  try { return JSON.parse(fs.readFileSync(filePath)); }
  catch { return {}; }
}
function saveData(data) {
  ensureFile();
  try { fs.writeFileSync(filePath, JSON.stringify(data, null, 2)); } catch {}
}

/* ============ SAFE AVATAR ============ */
async function getUserAvatar(uid) {
  try {
    const res = await axios.get(
      `https://graph.facebook.com/${uid}/picture?width=500&height=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: "stream", timeout: 8000 }
    );
    return res.data;
  } catch (e) {
    return null;
  }
}

/* ============ SAFE THREAD INFO ============ */
async function safeGetThreadInfo(api, threadID) {
  try {
    const info = await api.getThreadInfo(threadID);
    const ids =
      info.participantIDs ||
      (info.userInfo && info.userInfo.map(u => u.id)) ||
      (info.members && info.members.map(m => m.userFbId)) ||
      [];
    return {
      participantIDs: ids,
      total: ids.length || (info.participantIDs ? info.participantIDs.length : 0),
      adminIDs: (info.adminIDs || []).map(a => String(a.id || a))
    };
  } catch (e) {
    return { participantIDs: [], total: 0, adminIDs: [] };
  }
}

/* ============ SAFE USER INFO ============ */
async function safeGetUserInfo(api, uid) {
  try {
    if (typeof api.getUserInfo === "function") {
      const info = await api.getUserInfo(uid);
      if (info && info[uid]) return info[uid];
    }
  } catch (e) {}
  return null;
}

/* ============ SET NICKNAME (with fallback) ============ */
async function setNickname(api, nickname, threadID, userID) {
  return new Promise((resolve) => {
    try {
      if (typeof api.setNickname === "function") {
        api.setNickname(nickname, threadID, userID, (err) => {
          if (!err) return resolve(true);
          tryNicknameFallback(api, nickname, threadID, userID, resolve);
        });
      } else {
        tryNicknameFallback(api, nickname, threadID, userID, resolve);
      }
    } catch (e) {
      resolve(false);
    }
  });
}

function tryNicknameFallback(api, nickname, threadID, userID, resolve) {
  try {
    if (typeof api.nickname === "function") {
      api.nickname(nickname, threadID, userID, (err) => {
        resolve(!err);
      });
    } else {
      resolve(false);
    }
  } catch (e) {
    resolve(false);
  }
}

/* ============ MAIN EVENT ============ */
module.exports.run = async function ({ api, event }) {
  const { threadID, author } = event;

  try {
    const now = Date.now();
    const today = moment.tz("Asia/Dhaka").format("DD-MM-YYYY");
    const prefix = global.config?.PREFIX || "/";
    const botID = String(api.getCurrentUserID());

    /* ============ Validate added participants ============ */
    const addedUsers = (event.logMessageData?.addedParticipants || []).filter(Boolean);
    if (!addedUsers.length) return;

    /* ============ Bot itself added ============ */
    const botAdded = addedUsers.some(u => String(u.userFbId) === botID);

    if (botAdded) {
      try {
        await setNickname(api, AUTO_NICKNAME, threadID, botID);
      } catch (e) {}

      const realUsers = addedUsers.filter(u => String(u.userFbId) !== botID);

      if (!realUsers.length) {
        return api.sendMessage(
`┌───🤖────🤖───┐
│ 𝐑𝐈𝐘𝐀 𝐁𝐎𝐓 𝐇𝐄𝐑𝐄 
└───🤖────🤖───┘

🎀 তোমাদের মধ্যে চলে এসেছি আমি
🎀 বিনোদন দিবো, কথা বলবো, মজা করবো

💠 𝐏𝐫𝐞𝐟𝐢𝐱 : ${prefix}
👑 𝐎𝐰𝐧𝐞𝐫 : 乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐

━━━━━━━━━━━━━━━━━━

🏷️ 𝐁𝐨𝐭 𝐍𝐢𝐜𝐤𝐧𝐚𝐦𝐞 : 𝐒𝐞𝐭 ✅

💖 𝐋𝐄𝐓'𝐒 𝐇𝐀𝐕𝐄 𝐅𝐔𝐍 𝐓𝐎𝐆𝐄𝐓𝐇𝐄𝐑 💖`,
          threadID
        );
      }
    }

    /* ============ Filter out bot ============ */
    const welcomeUsers = addedUsers.filter(u => String(u.userFbId) !== botID);
    if (!welcomeUsers.length) return;

    /* ============ Cooldown ============ */
    if (cooldown[threadID] && now - cooldown[threadID] < 15000) return;
    cooldown[threadID] = now;

    /* ============ Thread info ============ */
    const tInfo = await safeGetThreadInfo(api, threadID);
    const totalMembers = tInfo.total;
    const allMembers = tInfo.participantIDs.map(String);
    const adminIDs = tInfo.adminIDs.map(String);

    /* ============ Daily data ============ */
    let data = loadData();
    if (!data[threadID] || typeof data[threadID] !== "object") {
      data[threadID] = { date: today, count: 0 };
    }
    if (data[threadID].date !== today) {
      data[threadID].date = today;
      data[threadID].count = 0;
    }

    /* ============ Auto frame rotate ============ */
    if (!global.autoFrameIndex) global.autoFrameIndex = {};
    if (!global.autoFrameIndex[threadID]) global.autoFrameIndex[threadID] = 1;
    else {
      global.autoFrameIndex[threadID]++;
      if (global.autoFrameIndex[threadID] > 10) global.autoFrameIndex[threadID] = 1;
    }
    const frame = global.autoFrameIndex[threadID];

    /* ============ Mentions + names ============ */
    const mentions = welcomeUsers.map(u => ({
      tag: u.fullName || "Unknown",
      id: String(u.userFbId)
    }));
    const names = welcomeUsers.map(u => u.fullName || "Unknown");
    const count = welcomeUsers.length;

    /* ========================================================
       ============ ADDER / JOIN TYPE DETECTION ============
       ========================================================
       
       🔹 RULE:
       - author is a normal member (not admin) → "Added By : @name"
       - author is an admin (approve case) → "Auto Join"
       - author invalid / link join → "Group Link"
       
       ⚠️ Admin ka naam kabhi nahi dikhega!
    ======================================================== */

    let adderName = "";
    let adderID = "";
    let joinType = "link"; // "member" | "auto" | "link"

    const authorStr = author ? String(author) : "";
    const isRealAuthor =
      authorStr &&
      authorStr !== botID &&
      allMembers.includes(authorStr);

    const isAdminAuthor = isRealAuthor && adminIDs.includes(authorStr);

    if (isRealAuthor && !isAdminAuthor) {
      /* 👤 Normal member added someone → show name + mention */
      const adderInfo = await safeGetUserInfo(api, authorStr);
      adderName = adderInfo?.name || "Unknown User";
      adderID = authorStr;
      joinType = "member";
    } else if (isAdminAuthor) {
      /* 🔄 Admin approved → don't show admin name */
      joinType = "auto";
    } else {
      /* 🌐 Link join or no valid author */
      joinType = "link";
    }

    /* ============ VIP check ============ */
    const isVIP = welcomeUsers.some(u => VIP_UID.includes(String(u.userFbId)));

    /* ============ Update daily count ============ */
    data[threadID].count += count;
    saveData(data);

    /* ============ Avatar ============ */
    const firstUser = welcomeUsers[0];
    const avatarStream = await getUserAvatar(firstUser.userFbId);

    /* ============ Member list ============ */
    const memberList = welcomeUsers
      .map((u, i) => `   ${i + 1}. ${u.fullName || "Unknown"}`)
      .join("\n");

    /* ============ Join info line ============ */
    let addLine;
    let adderMention = null;

    if (joinType === "member") {
      addLine = `👤 𝐀𝐝𝐝𝐞𝐝 𝐁𝐲 : ${adderName}`;
      adderMention = { tag: adderName, id: adderID };
    } else if (joinType === "auto") {
      addLine = `🔄 𝐉𝐨𝐢𝐧𝐞𝐝 : 𝐀𝐮𝐭𝐨 𝐉𝐨𝐢𝐧 (𝐀𝐩𝐩𝐫𝐨𝐯𝐞𝐝)`;
    } else {
      addLine = `🌐 𝐉𝐨𝐢𝐧𝐞𝐝 : 𝐆𝐫𝐨𝐮𝐩 𝐋𝐢𝐧𝐤`;
    }

    /* ============ VIP FRAME ============ */
    if (isVIP) {
      const vipUser = welcomeUsers.find(u => VIP_UID.includes(String(u.userFbId)));
      const vipAvatar = await getUserAvatar(vipUser.userFbId);

      const vipMentions = [{ tag: vipUser.fullName, id: String(vipUser.userFbId) }];
      if (adderMention) vipMentions.push(adderMention);

      const msgObj = {
        body:
`╔═══════👑═══════╗
       👑 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 👑
╚═══════👑═══════╝

   🌟 𝐕𝐈𝐏 𝐌𝐄𝐌𝐁𝐄𝐑 🌟

╭──────────────────╮
   👑 ${vipUser.fullName}
╰──────────────────╯

━━━━━━━━━━━━━━━━━━━

আসসালামু ওয়ালাইকুম 
乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐ বস

এই গ্রুপে আপনাকে স্বাগতম
আপনি এই গ্রুপের বিশেষ একজন ব্যক্তি
আপনাকে এই গ্রুপে পেয়ে আমরা গর্বিত
আশা করি এই গ্রুপে আপনি অনেক সম্মান পাবেন
সবার থেকে অনেক ভালোবাসা পাবেন

━━━━━━━━━━━━━━━━━━━

📋 𝐉𝐎𝐈𝐍 𝐃𝐄𝐓𝐀𝐈𝐋𝐒
${addLine}
👥 𝐓𝐨𝐭𝐚𝐥 𝐌𝐞𝐦𝐛𝐞𝐫𝐬 : ${totalMembers}
📊 𝐓𝐨𝐝𝐚𝐲'𝐬 𝐉𝐨𝐢𝐧 : ${data[threadID].count}

━━━━━━━━━━━━━━━━━━━

    💎 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐉𝐔𝐖𝐄𝐋 𝐁𝐎𝐒𝐒 💎`,
        mentions: vipMentions
      };
      if (vipAvatar) msgObj.attachment = vipAvatar;
      return api.sendMessage(msgObj, threadID);
    }

    /* ============ BIG JOIN (≥5) ============ */
    if (count >= 5) {
      const bigMentions = [...mentions];
      if (adderMention) bigMentions.push(adderMention);

      const msgObj = {
        body:
`┌───🎊─────🎊───┐
│  🎉 𝐁𝐈𝐆 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 🎉
└───🎊─────🎊───┘

      👥 ${count} 𝐍𝐄𝐖 𝐌𝐄𝐌𝐁𝐄𝐑𝐒

╭──────────────────╮
${memberList}
╰──────────────────╯

━━━━━━━━━━━━━━━━━

🌸 সবাইকে জানাই স্বাগতম
🌸 আমাদের পরিবারে আপনাদের পেয়ে আনন্দিত

━━━━━━━━━━━━━━━━━

📋 𝐉𝐎𝐈𝐍 𝐃𝐄𝐓𝐀𝐈𝐋𝐒
${addLine}
👥 𝐓𝐨𝐭𝐚𝐥 𝐌𝐞𝐦𝐛𝐞𝐫𝐬 : ${totalMembers}
📊 𝐓𝐨𝐝𝐚𝐲'𝐬 𝐉𝐨𝐢𝐧 : ${data[threadID].count}

━━━━━━━━━━━━━━━━━

    💝 𝐇𝐀𝐏𝐏𝐘 𝐓𝐎 𝐇𝐀𝐕𝐄 𝐘𝐎𝐔 💝`,
        mentions: bigMentions
      };
      if (avatarStream) msgObj.attachment = avatarStream;
      return api.sendMessage(msgObj, threadID);
    }

    /* ============ FRAME SYSTEM (1-10) ============ */
    const frameMentions = [...mentions];
    if (adderMention) frameMentions.push(adderMention);

    /* common details block — same for all 10 frames */
    const detailsBlock =
`━━━━━━━━━━━━━━━━━━

📋 𝐉𝐎𝐈𝐍 𝐃𝐄𝐓𝐀𝐈𝐋𝐒
${addLine}
👥 𝐓𝐨𝐭𝐚𝐥 𝐌𝐞𝐦𝐛𝐞𝐫𝐬 : ${totalMembers}
📊 𝐓𝐨𝐝𝐚𝐲'𝐬 𝐉𝐨𝐢𝐧 : ${data[threadID].count}

━━━━━━━━━━━━━━━━━━`;

    const frames = {
      1: `┌───🌸───🌸───┐
│  ✨ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 ✨
└───🌸────🌸───┘

   🌸 𝐍𝐄𝐖 𝐌𝐄𝐌𝐁𝐄𝐑 🌸

╭──────────────────╮
   🌸 ${nameList}
╰──────────────────╯

━━━━━━━━━━━━━━━━━━
💗 আমাদের পরিবারের নতুন সদস্য
💗 আপনাকে পেয়ে আমরা গর্বিত

${detailsBlock}`,

      2: `┌───🦋───🦋───┐
│  ✨ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 ✨
└───🦋───🦋───┘

   🦋 𝐍𝐄𝐖 𝐌𝐄𝐌𝐁𝐄𝐑 🦋

╭──────────────────╮
   🦋 ${nameList}
╰──────────────────╯

━━━━━━━━━━━━━━━━━━
🎭 আপনার আগমন জাদুর মতো
🎭 নতুন সম্পর্কের শুরু

${detailsBlock}`,

      3: `┌───💫────💫───┐
│  ✨ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 ✨
└───💫────💫───┘

   💫 𝐍𝐄𝐖 𝐌𝐄𝐌𝐁𝐄𝐑 💫

╭──────────────────╮
   💫 ${nameList}
╰──────────────────╯

━━━━━━━━━━━━━━━━━━
🌺 স্বাগতম জানাই আপনাকে
🌺 আপনার সাথে নতুন সম্পর্ক শুরু হলো

${detailsBlock}`,

      4: `┌───🌺────🌺───┐
│  ✨ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 ✨
└───🌺─────🌺───┘

   🌺 𝐍𝐄𝐖 𝐌𝐄𝐌𝐁𝐄𝐑 🌺

╭──────────────────╮
   🌺 ${nameList}
╰──────────────────╯

━━━━━━━━━━━━━━━━━━
🌷 আপনার আগমনে আলো ছড়িয়েছে
🌷 এ গ্রুপ এখন আরও রঙিন

${detailsBlock}`,

      5: `┌───💎────💎───┐
│  ✨ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 ✨
└───💎────💎───┘

   💎 𝐍𝐄𝐖 𝐌𝐄𝐌𝐁𝐄𝐑 💎

╭──────────────────╮
   💎 ${nameList}
╰──────────────────╯

━━━━━━━━━━━━━━━━━━
🌟 নতুন শুরু, নতুন সম্পর্ক
🌟 এই গ্রুপকে আপনার দ্বিতীয় বাড়ি ভাবুন

${detailsBlock}`,

      6: `┌───🌟────🌟───┐
│  ✨ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 ✨
└───🌟────🌟───┘

   🌟 𝐍𝐄𝐖 𝐌𝐄𝐌𝐁𝐄𝐑 🌟

╭──────────────────╮
   🌟 ${nameList}
╰──────────────────╯

━━━━━━━━━━━━━━━━━━
💫 আপনাকে স্বাগতম জানাচ্ছি
💫 আশা করি এখানে ভালো লাগবে

${detailsBlock}`,

      7: `┌───💕─────💕───┐
│  ✨ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 ✨
└───💕─────💕───┘

   💕 𝐍𝐄𝐖 𝐌𝐄𝐌𝐁𝐄𝐑 💕

╭──────────────────╮
   💕 ${nameList}
╰──────────────────╯

━━━━━━━━━━━━━━━━━━
🌺 আমাদের সাথে থাকার জন্য ধন্যবাদ
🌺 এখানে সবাই আপনাকে পছন্দ করবে

${detailsBlock}`,

      8: `┌───🌷─────🌷───┐
│  ✨ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 ✨
└───🌷─────🌷───┘

   🌷 𝐍𝐄𝐖 𝐌𝐄𝐌𝐁𝐄𝐑 🌷

╭──────────────────╮
   🌷 ${nameList}
╰──────────────────╯

━━━━━━━━━━━━━━━━━━
🌹 নতুন বন্ধু পেয়ে ভালো লাগলো
🌹 আপনি এখানে উষ্ণ অভ্যর্থনা পাবেন

${detailsBlock}`,

      9: `┌───🎊─────🎊───┐
│  ✨ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 ✨
└───🎊─────🎊───┘

   🎊 𝐍𝐄𝐖 𝐌𝐄𝐌𝐁𝐄𝐑 🎊

╭──────────────────╮
   🎊 ${nameList}
╰──────────────────╯

━━━━━━━━━━━━━━━━━━
🎉 এই গ্রুপ এখন আপনার
🎉 সবাই আপনার সাথে বন্ধুত্ব করতে চায়

${detailsBlock}`,

      10: `┌───🎀─────🎀───┐
│  ✨ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 ✨
└───🎀─────🎀───┘

   🎀 𝐍𝐄𝐖 𝐌𝐄𝐌𝐁𝐄𝐑 🎀

╭──────────────────╮
   🎀 ${nameList}
╰──────────────────╯

━━━━━━━━━━━━━━━━━━
✨ আপনাকে পেয়ে আমরা সত্যিই আনন্দিত
✨ এখানে আপনার প্রতিটি মুহূর্ত সুন্দর হোক

${detailsBlock}`
    };

    const finalObj = {
      body: frames[frame] || frames[1],
      mentions: frameMentions
    };
    if (avatarStream) finalObj.attachment = avatarStream;

    return api.sendMessage(finalObj, threadID);

  } catch (e) {
    console.error("JoinNoti Error:", e);
  }
};
