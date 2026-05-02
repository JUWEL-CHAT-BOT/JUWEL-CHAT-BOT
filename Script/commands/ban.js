module.exports.config = {
  name: "ban",
  version: "3.0.0",
  hasPermssion: 2,
  credits: "𝐌𝐑 𝐉𝐔𝐖𝐄𝐋",
  description: "Pro Ban/Unban + Temporary Persistent System",
  commandCategory: "group",
  usages: `${global.config.PREFIX}ban <UID/@mention> <time(optional)> <reason(optional)>\n${global.config.PREFIX}unban <UID>`,
  cooldowns: 3
};

// =========================
// 🔴 AUTO BAN CHECK (IMPORTANT)
// =========================
module.exports.handleEvent = async ({ event, api, Users }) => {
  let { senderID } = event;

  if (!global.data.userBanned) global.data.userBanned = new Map();

  let data = global.data.userBanned.get(senderID);
  if (!data) return;

  // expire check
  if (data.expire && Date.now() > data.expire) {
    try {
      let userData = (await Users.getData(senderID)).data || {};
      userData.banned = false;
      await Users.setData(senderID, { data: userData });

      global.data.userBanned.delete(senderID);
    } catch (e) {}
    return;
  }

  // still banned → block message
  return api.sendMessage(
    `⛔ তুমি Ban করা আছো\n📝 কারণ: ${data.reason || "No reason"}`,
    event.threadID,
    event.messageID
  );
};

// =========================
// MAIN COMMAND
// =========================
module.exports.run = async ({ event, api, args, Users }) => {
  const { threadID, messageID, messageReply, mentions } = event;

  let prefix = global.config.PREFIX;
  let command = event.body.split(" ")[0].slice(prefix.length).toLowerCase();

  let targetID =
    messageReply?.senderID ||
    Object.keys(mentions || {})[0] ||
    args[0];

  if (!targetID)
    return api.sendMessage("⚠️ UID / Reply / Mention দিতে হবে!", threadID, messageID);

  if (isNaN(targetID))
    return api.sendMessage("❌ সঠিক UID দিন!", threadID, messageID);

  if (!global.data.allUserID.includes(targetID))
    return api.sendMessage("❌ ইউজার পাওয়া যায়নি!", threadID, messageID);

  let name = global.data.userName.get(targetID) || await Users.getNameUser(targetID);

  // =========================
  // 🔴 BAN
  // =========================
  if (command === "ban") {
    let time = args[1];
    let reason = args.slice(2).join(" ") || "No reason";

    let expire = null;

    if (time) {
      let match = time.match(/(\d+)([mhd])/);
      if (match) {
        let v = parseInt(match[1]);
        let t = match[2];

        let ms =
          t === "m" ? v * 60000 :
          t === "h" ? v * 3600000 :
          t === "d" ? v * 86400000 : 0;

        expire = ms ? Date.now() + ms : null;
      }
    }

    try {
      let data = (await Users.getData(targetID)).data || {};
      data.banned = true;
      await Users.setData(targetID, { data });

      if (!global.data.userBanned) global.data.userBanned = new Map();

      global.data.userBanned.set(targetID, {
        reason,
        expire,
        by: event.senderID,
        time: new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })
      });

      return api.sendMessage(
`╔══════════════╗
║ 🔴 USER BANNED ║
╚══════════════╝

👤 নাম: ${name}
🆔 UID: ${targetID}
📝 কারণ: ${reason}
⏳ সময়: ${time || "Permanent"}`,
        threadID,
        messageID
      );

    } catch (e) {
      return api.sendMessage("❌ Ban করতে সমস্যা হয়েছে!", threadID, messageID);
    }
  }

  // =========================
  // 🟢 UNBAN
  // =========================
  else if (command === "unban") {
    try {
      let data = (await Users.getData(targetID)).data || {};

      if (!data.banned)
        return api.sendMessage("⚠️ এই ইউজার Ban নেই!", threadID, messageID);

      data.banned = false;
      await Users.setData(targetID, { data });

      if (global.data.userBanned)
        global.data.userBanned.delete(targetID);

      return api.sendMessage(
`🟢 UNBAN SUCCESS

👤 ${name}
🆔 ${targetID}
✔️ সফলভাবে Unban করা হয়েছে`,
        threadID,
        messageID
      );

    } catch (e) {
      return api.sendMessage("❌ Unban করতে সমস্যা হয়েছে!", threadID, messageID);
    }
  }

  else {
    return api.sendMessage("⚠️ ব্যবহার: ban / unban <UID>", threadID, messageID);
  }
};
