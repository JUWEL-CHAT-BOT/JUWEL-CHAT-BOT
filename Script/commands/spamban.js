const num = 5;
const timeWindow = 60;

module.exports.config = {
  name: "spamban",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "Restart-safe anti spam ban system",
  commandCategory: "System",
  cooldowns: 5
};

//
// ✅ LOAD BAN LIST AFTER RESTART
//
module.exports.onLoad = async function ({ Users }) {
  const allUsers = await Users.getAll();

  for (const user of allUsers) {
    if (user?.data?.banned) {
      global.data.userBanned.set(user.userID, {
        reason: user.data.reason,
        dateAdded: user.data.dateAdded
      });
    }
  }
};

//
// 📌 COMMAND INFO
//
module.exports.run = async function ({ api, event }) {
  return api.sendMessage(
`╔════════════════════╗
║ 🤖 SPAM BAN SYSTEM
╠════════════════════╣
║ ✔ command + bot detect
║ ⚠️ 4 → warning
║ 🚫 5 → ban
║ 💾 restart safe
╚════════════════════╝`,
    event.threadID,
    event.messageID
  );
};

//
// 🔥 MAIN LOGIC
//
module.exports.handleEvent = async function ({ api, event, Users }) {
  const { senderID, threadID, body } = event;

  if (!body) return;

  // ❌ already banned
  if (global.data?.userBanned?.has(senderID)) return;

  if (!global.client.spamBan) global.client.spamBan = {};

  if (!global.client.spamBan[senderID]) {
    global.client.spamBan[senderID] = {
      count: 0,
      start: Date.now()
    };
  }

  let data = global.client.spamBan[senderID];

  // reset after 1 minute
  if (Date.now() - data.start > timeWindow * 1000) {
    data.count = 0;
    data.start = Date.now();
  }

  const text = body.toLowerCase();

  const threadData = global.data.threadData.get(threadID) || {};
  const prefix = threadData.PREFIX || global.config.PREFIX;

  const isCommand = text.startsWith(prefix);
  const isBot = /\bbot\b/i.test(text); // safe bot detect

  if (!isCommand && !isBot) return;

  data.count++;
  const count = data.count;

  const userData = await Users.getData(senderID);
  const name = userData?.name || "Unknown";

  // ⚠️ WARNING
  if (count === 4) {
    return api.sendMessage(
`╔════════════════╗
║ ⚠️ WARNING
╠════════════════╣
║ 👤 ${name}
║ 📊 4/5
║ ❗ সাবধান
╚════════════════╝`,
      threadID
    );
  }

  // 🚫 BAN
  if (count >= num) {
    const moment = require("moment-timezone");
    const time = moment.tz("Asia/Dhaka").format("DD/MM/YYYY HH:mm:ss");

    let user = userData || {};
    user.data = user.data || {};

    user.data.banned = true;
    user.data.reason = "Spam command / bot detect";
    user.data.dateAdded = time;

    await Users.setData(senderID, user);

    global.data.userBanned.set(senderID, {
      reason: user.data.reason,
      dateAdded: time
    });

    global.client.spamBan[senderID] = { count: 0, start: Date.now() };

    api.sendMessage(
`╔════════════════════╗
║ 🚫 USER BANNED
╠════════════════════╣
║ 👤 ${name}
║ 🆔 ${senderID}
║ 📌 Spam detected
║ ⏰ ${time}
╚════════════════════╝`,
      threadID
    );

    // admin notify
    const admins = global.config.ADMINBOT || [];
    for (const id of admins) {
      api.sendMessage(
`🚨 AUTO BAN
👤 ${name}
🆔 ${senderID}
📌 spam/bot abuse
⏰ ${time}`,
        id
      );
    }
  }
};
