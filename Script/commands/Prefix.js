module.exports.config = {
  name: "prefix",
  version: "2.0.4",
  hasPermssion: 0,
  credits: "MR JUWEL",
  description: "Display bot prefix, owner info & stats",
  commandCategory: "Information",
  usages: "",
  cooldowns: 5
};

// 🚫 Anti-spam store
const spamMap = new Map();
const SPAM_COOLDOWN = 10000; // 10 seconds

module.exports.handleEvent = async ({ event, api, Threads }) => {
  const { threadID, messageID, body, senderID } = event;
  if (!body) return;

  // 🚫 Anti-spam check
  const now = Date.now();
  if (spamMap.has(senderID)) {
    if (now - spamMap.get(senderID) < SPAM_COOLDOWN) return;
  }

  // ⚙️ Prefix info
  const dataThread = await Threads.getData(threadID);
  const data = dataThread.data || {};
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  const prefix = threadSetting.PREFIX || global.config.PREFIX;

  // 🌐 Multi-language trigger words
  const triggerWords = [
    "prefix", "mprefix", "mpre", "bot prefix", "what is the prefix", "bot name",
    "how to use bot", "bot not working", "bot is offline", "prefx", "prfix",
    "perfix", "bot not talking", "where is bot", "bot dead", "bots dead",
    "what prefix", "freefix", "what is bot", "what prefix bot",
    "how use bot", "where are the bots", "where prefix",
    "প্রিফিক্স", "বট প্রিফিক্স", "পিন", "বটের নাম", "বট কি",
    "বট কাজ করছে না", "বট অফলাইন", "প্রিফিক্স কি",
    "प्रीफिक्स", "बॉट प्रीफिक्स", "बॉट का नाम", "बॉट क्या है",
    "dấu lệnh", "daulenh", "tiền tố"
  ];

  const lowerBody = body.toLowerCase().trim();
  if (!triggerWords.includes(lowerBody)) return;

  spamMap.set(senderID, now);

  // 💖 Random reaction
  const reactions = ["💖", "✨", "🌸", "💫", "❤️", "🦋", "🌟"];
  api.setMessageReaction(
    reactions[Math.floor(Math.random() * reactions.length)],
    messageID, () => {}, true
  );

  // 📊 Uptime & Stats
  const uptimeSec = process.uptime();
  const days  = Math.floor(uptimeSec / 86400);
  const hours = Math.floor((uptimeSec % 86400) / 3600);
  const mins  = Math.floor((uptimeSec % 3600) / 60);
  const uptimeStr = `${days}d ${hours}h ${mins}m`;

  const totalUsers   = global.data.allUserID?.length   || 0;
  const totalThreads = global.data.allThreadID?.length || 0;

  // 🎯 Pull from config
  const botName   = global.config.BOTNAME     || "⎯꯭𓆩꯭𝆺𝅥😻⃞𝐑⃞𝐈⃞𝐘⃞𝐀⃞༢࿐";
  const ownerName = global.config.OWNER_NAME  || "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐";

  // 📩 Short & clean UI
  return api.sendMessage(
`╭─────────────⭓
│  ✨ 𝐏𝐑𝐄𝐅𝐈𝐗 ✨
│  ➤ 『 ${prefix} 』
├─────────────⭓
│  🤖 ${botName}
│  👑 ${ownerName}
│  ⏱️ ${uptimeStr}
│  👥 ${totalUsers}  |  💬 ${totalThreads}
╰─────────────⭓`,
    threadID,
    null
  );
};
