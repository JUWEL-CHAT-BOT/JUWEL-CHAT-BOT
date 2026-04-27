const num = 6; // 6th command = BAN
const timeWindow = 60; // 1 minute

module.exports.config = {
  name: "spamban",
  version: "3.1.0",
  hasPermssion: 0,
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "৬ বার কমান্ড করলে অটো ব্যান সিস্টেম",
  commandCategory: "System",
  usages: "on/off info",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  return api.sendMessage(
`╔════════════════════╗
║ 🤖 স্প্যাম ব্যান সিস্টেম
╠════════════════════╣
║ 📌 ১-৩ → কিছু না
║ ⚠️ ৪-৫ → ওয়ার্নিং
║ 🚫 ৬ → অটো ব্যান
╚════════════════════╝`,
    event.threadID,
    event.messageID
  );
};

module.exports.handleEvent = async function ({ api, event, Users }) {
  const { senderID, threadID, body } = event;

  if (!body) return;

  // banned check
  if (global.data?.userBanned?.has(senderID)) return;

  if (!global.client.spamBan) global.client.spamBan = {};

  if (!global.client.spamBan[senderID]) {
    global.client.spamBan[senderID] = {
      count: 0,
      start: Date.now()
    };
  }

  let data = global.client.spamBan[senderID];

  // reset after time window
  if (Date.now() - data.start > timeWindow * 1000) {
    data.count = 0;
    data.start = Date.now();
  }

  const threadData = global.data.threadData.get(threadID) || {};
  const prefix = threadData.PREFIX || global.config.PREFIX;

  if (body.indexOf(prefix) !== 0) return;

  data.count++;

  const count = data.count;
  const userData = await Users.getData(senderID);
  const name = userData?.name || "Unknown";

  // 4-5 warning
  if (count === 4 || count === 5) {
    return api.sendMessage(
`╔════════════════╗
║ ⚠️ সতর্কবার্তা
╠════════════════╣
║ 👤 ইউজার: ${name}
║ 📊 স্ট্যাটাস: ${count}/6
║ ❗ সাবধান থাকুন
╚════════════════╝`,
      threadID
    );
  }

  // BAN
  if (count >= num) {
    const moment = require("moment-timezone");
    const time = moment.tz("Asia/Dhaka").format("DD/MM/YYYY HH:mm:ss");

    let user = userData || {};
    user.data = user.data || {};
    user.data.banned = true;
    user.data.reason = "৬ বার কমান্ড স্প্যাম";
    user.data.dateAdded = time;

    await Users.setData(senderID, user);

    global.data.userBanned.set(senderID, {
      reason: user.data.reason,
      dateAdded: time
    });

    global.client.spamBan[senderID] = { count: 0, start: Date.now() };

    api.sendMessage(
`╔════════════════════╗
║ 🚫 ইউজার ব্যান
╠════════════════════╣
║ 👤 নাম: ${name}
║ 🆔: ${senderID}
║ 📌 কারণ: স্প্যাম
║ ⏰ সময়: ${time}
╚════════════════════╝`,
      threadID
    );

    // admin notify
    const admins = global.config.ADMINBOT || [];
    for (const id of admins) {
      api.sendMessage(
`🚨 AUTO BAN REPORT
👤 ${name}
🆔 ${senderID}
📌 Spam Limit Reached
⏰ ${time}`,
        id
      );
    }
  }
};
