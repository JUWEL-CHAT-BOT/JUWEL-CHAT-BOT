module.exports.config = {
  name: "fixspam",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "Auto-ban system with proper implementation",
  commandCategory: "noprefix",
  usages: "",
  cooldowns: 0,
  dependencies: {
    "moment-timezone": ""
  }
};

// গ্লোবাল ডেটা ইনিশিয়ালাইজ
if (!global.data) global.data = {};
if (!global.data.userBanned) global.data.userBanned = new Map();

module.exports.handleEvent = async function ({ event, api, Users }) {
  const moment = require("moment-timezone");
  const { threadID, senderID, body } = event;

  // ভ্যালিডেশন
  if (!body || typeof body !== 'string') return;
  if (senderID == api.getCurrentUserID()) return;

  // নিষিদ্ধ শব্দের তালিকা
  const bannedWords = [
    "chudi", "baler bot", "বট তোকে চুদি", "bot bokasoda", "bot tor boss re chudi",
    "বালের বট", "ভোদার বট", "ধোনের বট", "তোর বস রে চুদি", "জুয়েল কে চুদি",
    "Juwel mc", "mc Juwel", "bokachoda Juwel", "fuck you", "sex", "bot tore cdi",
    "hedar bot", "বট চুদি", "crazy bot", "bc bot", "khankir polar bot",
    "bot tor heda", "হেড়ার বট", "cdi bot ke", "con bot lòn", "cmm bot",
    "clap bot", "bot fuck", "bot oc", "pagol bot", "bot fuck you", "cc bot",
    "abal bot", "Abal bottt", "lol bot", "loz bot", "xxx", "boder bot",
    "bot lon", "xxx video de", "এটা বট ভালো না", "বট কে চুদি", "bot sudi", "bot sida",
    "bot fuck", "Pagol bot", "mc bot", "bad bot", "bot cau"
  ];

  // নিষিদ্ধ শব্দ চেক
  const foundWord = bannedWords.find(word => 
    body.toLowerCase().includes(word.toLowerCase())
  );

  if (!foundWord) return;

  // ইউজার ইতিমধ্যে ব্যান কিনা চেক
  const userData = await Users.getData(senderID);
  if (userData.banned) return;

  // ইউজারের নাম পাওয়া
  let userName = "Unknown User";
  try {
    userName = await Users.getNameUser(senderID);
  } catch (e) {
    console.log("Error getting user name:", e);
  }

  // বর্তমান সময়
  const currentTime = moment
    .tz("Asia/Dhaka")
    .format("HH:mm:ss | DD/MM/YYYY");

  try {
    // ইউজারকে ব্যান করা
    await Users.setData(senderID, { 
      banned: true, 
      reason: foundWord, 
      dateAdded: currentTime,
      userName: userName
    });

    // গ্লোবাল ডেটা আপডেট
    global.data.userBanned.set(senderID, { 
      reason: foundWord, 
      dateAdded: currentTime,
      userName: userName
    });

    // ইউজারকে নোটিফিকেশন
    const warningMessage = ` 
╔════════════════════╗
║ ⚠️ 𝗕𝗢𝗧 𝗦𝗘𝗖𝗨𝗥𝗜𝗧𝗬 ⚠️ ║
╚════════════════════╝

👤 নাম: ${userName}
🆔 UID: ${senderID}

❌ নিষিদ্ধ শব্দ শনাক্ত:
➤ ${foundWord}

🚫 আপনাকে স্বয়ংক্রিয়ভাবে
Bot System থেকে Ban করা হয়েছে।

🕒 সময়:
${currentTime}

━━━━━━━━━━━━━━━━━━
» Notice from Bot System «
━━━━━━━━━━━━━━━━━━
`;

    api.sendMessage(warningMessage, threadID);

    // অ্যাডমিনদের নোটিফিকেশন
    const admins = global.config.ADMINBOT || [];
    for (const adminID of admins) {
      try {
        api.sendMessage(
          `╔════════════════════╗
║ 🚨 𝗕𝗢𝗧 𝗔𝗟𝗘𝗥𝗧 🚨 ║
╚════════════════════╝

🆘 Sinner: ${userName}
🔰 Uid: ${senderID}
😥 Sent: ${foundWord}

⛔ User Automatically Banned

🕒 Time: ${currentTime}`,
          adminID
        );
      } catch (e) {
        console.log("Error sending to admin:", e);
      }
    }

    console.log(`[FIXSPAM] ${userName} (${senderID}) -> ${foundWord}`);

  } catch (err) {
    console.log("Error in handleEvent:", err);
    api.sendMessage("⚠️ Bot error occurred. Please try again.", threadID);
  }
};

module.exports.run = async function ({ event, api }) {
  api.sendMessage(
    `╔════════════════════╗
║ 🛡️ 𝗙𝗜𝗫𝗦𝗣𝗔𝗠 𝗦𝗬𝗦𝗧𝗘𝗠 🛡️ ║
╚════════════════════╝

✅ System Active
✅ Auto Detect Enabled
✅ Auto Ban Enabled

━━━━━━━━━━━━━━━━━━
» Type /unban [uid] to unban
» Type /checkban to check status
━━━━━━━━━━━━━━━━━━`,
    event.threadID
  );
};

// আনব্যান ফাংশন
module.exports.handleReply = async function ({ event, api, Users }) {
  const { body, senderID } = event;
  
  // শুধু অ্যাডমিনরা আনব্যান করতে পারবে
  const admins = global.config.ADMINBOT || [];
  if (!admins.includes(senderID)) {
    return api.sendMessage("❌ You don't have permission!", event.threadID);
  }

  if (body.startsWith('/unban')) {
    const uid = body.split(' ')[1];
    if (!uid) {
      return api.sendMessage("⚠️ Please provide UID: /unban [uid]", event.threadID);
    }

    try {
      await Users.setData(uid, { banned: false, reason: null, dateAdded: null });
      global.data.userBanned.delete(uid);
      api.sendMessage(`✅ User ${uid} has been unbanned!`, event.threadID);
    } catch (e) {
      api.sendMessage("❌ Error unbanning user!", event.threadID);
    }
  }
};
