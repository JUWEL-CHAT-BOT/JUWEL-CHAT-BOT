module.exports.config = {
  name: "ban",
  version: "4.2.0",
  hasPermssion: 2,
  credits: "𝐌𝐑 𝐉𝐔𝐖𝐄𝐋",
  description: "Ban + Unban + Time + Auto Unban + Beautiful Frame",
  commandCategory: "group",
  usages: `${global.config.PREFIX}ban <reply / UID> [10m / 20m / 1h / 1d] [reason]`,
  cooldowns: 5
};

// ================= SAFE INIT =================
if (!global.data) global.data = {};
if (!global.data.userBanned) global.data.userBanned = new Map();

// ================= MAIN =================
module.exports.run = async ({ event, api, args, Users }) => {
  const { threadID, messageID, senderID } = event;
  const prefix = global.config.PREFIX || "!";

  let targetID = event.messageReply?.senderID ||
                 Object.keys(event.mentions || {})[0] ||
                 args[0];

  if (!targetID) return api.sendMessage("⚠️ Reply করো, UID দাও অথবা @mention দাও!", threadID, messageID);
  if (isNaN(targetID) || targetID.length < 10) return api.sendMessage("❌ সঠিক UID দাও!", threadID, messageID);

  let name = global.data.userName.get(targetID) || await Users.getNameUser(targetID) || "Unknown User";
  let userData = (await Users.getData(targetID)).data || {};

  const body = (event.body || "").toLowerCase();
  const isBan = body.includes("ban");
  const isUnban = body.includes("unban");

  // ================= BAN =================
  if (isBan) {
    if (userData.banned) return api.sendMessage(`⚠️ ${name} আগে থেকেই ব্যান আছে!`, threadID, messageID);

    let timeStr = null;
    let reason = "No reason provided";

    for (let arg of args) {
      if (/^\d+[mhd]$/i.test(arg)) {
        timeStr = arg.toLowerCase();
        break;
      }
    }

    reason = args.slice(1)
      .filter(x => !/^\d+[mhd]$/i.test(x))
      .join(" ")
      .replace(/@\S+/g, "")
      .trim() || "No reason provided";

    let expireTime = null;
    if (timeStr) {
      const match = timeStr.match(/^(\d+)([mhd])$/i);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        let ms = unit === "m" ? value * 60000 :
                 unit === "h" ? value * 3600000 :
                 unit === "d" ? value * 86400000 : 0;
        if (ms > 0) expireTime = Date.now() + ms;
      }
    }

    try {
      userData.banned = true;
      await Users.setData(targetID, { data: userData });

      global.data.userBanned.set(targetID, {
        reason: reason,
        expire: expireTime,
        by: senderID,
        threadID: threadID,
        date: new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" }),
        name: name
      });

      const timeDisplay = timeStr ? timeStr : "Permanent";

      return api.sendMessage(
`━━━━━━━━━━━━━━━━━━━
       🔴 𝐁𝐀𝐍 𝐒𝐔𝐂𝐂𝐄𝐒𝐒
━━━━━━━━━━━━━━━━━━━

👤 নাম        : ${name}
🆔 UID         : ${targetID}
📝 কারণ       : ${reason}
⏳ সময়       : ${timeDisplay}
📅 ব্যানের সময় : ${new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })}

✅ সফলভাবে ব্যান করা হয়েছে।
━━━━━━━━━━━━━━━━━━━`, threadID, messageID);

    } catch (e) {
      console.error("Ban Error:", e);
      return api.sendMessage("❌ ব্যান করতে সমস্যা হয়েছে!", threadID, messageID);
    }
  }

  // ================= UNBAN =================
  if (isUnban) {
    if (!userData.banned) return api.sendMessage(`⚠️ ${name} ব্যান করা নেই!`, threadID, messageID);

    try {
      userData.banned = false;
      await Users.setData(targetID, { data: userData });
      global.data.userBanned.delete(targetID);

      return api.sendMessage(
`━━━━━━━━━━━━━━━━━━━
       🟢 𝐔𝐍𝐁𝐀𝐍 𝐒𝐔𝐂𝐂𝐄𝐒𝐒
━━━━━━━━━━━━━━━━━━━

👤 নাম  : ${name}
🆔 UID   : ${targetID}

✅ সফলভাবে আনব্যান করা হয়েছে।
━━━━━━━━━━━━━━━━━━━`, threadID, messageID);

    } catch (e) {
      console.error("Unban Error:", e);
      return api.sendMessage("❌ আনব্যান করতে সমস্যা হয়েছে!", threadID, messageID);
    }
  }
};

// ================= AUTO UNBAN SYSTEM =================
setInterval(async () => {
  const now = Date.now();

  for (let [uid, data] of global.data.userBanned.entries()) {
    if (data.expire && now >= data.expire) {
      try {
        let userData = (await Users.getData(uid)).data || {};
        userData.banned = false;
        await Users.setData(uid, { data: userData });

        global.data.userBanned.delete(uid);

        // Inbox Notification
        api.sendMessage(
`━━━━━━━━━━━━━━━━━━━
       🟢 𝐀𝐔𝐓𝐎 𝐔𝐍𝐁𝐀𝐍
━━━━━━━━━━━━━━━━━━━

✅ তোমাকে আনব্যান করা হয়েছে।
⏳ সময় শেষ হয়ে গেছে।
🎉 এখন আবার বট ব্যবহার করতে পারবে।
━━━━━━━━━━━━━━━━━━━`, uid).catch(() => {});

        // Group Log
        if (data.threadID) {
          api.sendMessage(
`━━━━━━━━━━━━━━━━━━━
       📢 𝐀𝐔𝐓𝐎 𝐔𝐍𝐁𝐀𝐍 𝐋𝐎𝐆
━━━━━━━━━━━━━━━━━━━

👤 নাম : ${data.name || "Unknown"}
🆔 UID  : ${uid}
🟢 সময় শেষ হয়েছে, স্বয়ংক্রিয়ভাবে আনব্যান করা হয়েছে।
━━━━━━━━━━━━━━━━━━━`, data.threadID).catch(() => {});
        }

      } catch (e) {
        console.error(`Auto Unban Error for ${uid}:`, e);
      }
    }
  }
}, 15000); // প্রতি ১৫ সেকেন্ড চেক
