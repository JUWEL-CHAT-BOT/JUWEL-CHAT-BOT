module.exports.config = {
  name: "album",
  version: "1.0.0",
  hasPermission: 0,
  credits: "MR JUWEL",
  description: "Send a trending TikTok video",
  commandCategory: "video",
  usages: "",
  cooldowns: 5,
};

// === Rate limit storage ===
if (!global.albumRateLimit) global.albumRateLimit = {};

module.exports.run = async function ({ event: e, api: a, args: n }) {
  if (!n[0]) {
    const menu = 
`╭───•𝐌𝐑 𝐉𝐔𝐖𝐄𝐋•───╮

━━💛𝐕𝐈𝐃𝐄𝐎🎀𝐀𝐋𝐁𝐔𝐌💛━━
!
!➤1 𝐈𝐒𝐋𝐀𝐌 𝐕𝐈𝐃𝐄𝐎◄┈╯
!
!➤2 𝐀𝐍𝐈𝐌𝐄 𝐕𝐈𝐃𝐄𝐎◄┈╯
!
!➤3 𝐒𝐇𝐀𝐈𝐑𝐈 𝐕𝐈𝐃𝐄𝐎◄┈╯
!
!➤4 𝐒𝐇𝐎𝐑𝐓 𝐕𝐈𝐃𝐄𝐎◄┈╯
!
!➤5 𝐒𝐀𝐃 𝐕𝐈𝐃𝐄𝐎◄┈╯
!
!➤6 𝐒𝐓𝐀𝐓𝐔𝐒 𝐕𝐈𝐃𝐄𝐎◄┈╯
!
!➤7 𝐅𝐎𝐎𝐓𝐁𝐀𝐋𝐋 𝐕𝐈𝐃𝐄𝐎◄┈╯
!
!➤8 𝐅𝐔𝐍𝐍𝐘 𝐕𝐈𝐃𝐄𝐎◄┈╯
!
!➤9 𝐋𝐎𝐕𝐄 𝐕𝐈𝐃𝐄𝐎◄┈╯
!
!➤10 𝐂𝐏𝐋 𝐕𝐈𝐃𝐄𝐎◄┈╯
!
!➤11 𝐁𝐀𝐁𝐘 𝐕𝐈𝐃𝐄𝐎◄┈╯
!
!➤12 𝐅𝐑𝐄𝐄 𝐅𝐈𝐑𝐄 𝐕𝐈𝐃𝐄𝐎◄┈╯
!
!➤13 𝐋𝐎𝐅𝐈 𝐕𝐈𝐃𝐄𝐎◄┈╯
!
!➤14 𝐇𝐀𝐏𝐏𝐘 𝐕𝐈𝐃𝐄𝐎◄┈╯
!
!➤15 𝐇𝐔𝐌𝐀𝐈𝐘𝐔𝐍 𝐒𝐈𝐑 𝐕𝐈𝐃𝐄𝐎◄┈╯
━━━━━━━━━━━━━━
𝐎𝐖𝐍𝐄𝐑: 𝐌𝐑 𝐉𝐔𝐖𝐄𝐋
𝐅𝐁: facebook.com/mrjuwel444
━━━━━━━━━━━━━━
𝐀 𝐏 𝐈 // 𝐉𝐔𝐖𝐄𝐋
╰──𝐌𝐑 𝐉𝐔𝐖𝐄𝐋 𝐏𝐑𝐎𝐉𝐄𝐂𝐓──╯

⚠️ 𝐍𝐨𝐭𝐞: 𝟐 𝐦𝐢𝐧𝐮𝐭𝐞𝐫 𝐦𝐨𝐝𝐝𝐡𝐞 𝐬𝐨𝐫𝐛𝐨𝐜𝐜𝐡𝐨 𝟓𝐭𝐢 𝐯𝐢𝐝𝐞𝐨 𝐧𝐢𝐭𝐞 𝐩𝐚𝐫𝐛𝐞𝐧।

𝐓𝐞𝐥𝐥 𝐦𝐞 𝐡𝐨𝐰 𝐦𝐚𝐧𝐲 𝐯𝐢𝐝𝐞𝐨 𝐧𝐮𝐦𝐛𝐞𝐫𝐬 𝐲𝐨𝐮 𝐰𝐚𝐧𝐭 𝐭𝐨 𝐬𝐞𝐞 𝐛𝐲 𝐫𝐞𝐩𝐥𝐲𝐢𝐧𝐠 𝐭𝐡𝐢𝐬 𝐦𝐞𝐬𝐬𝐚𝐠𝐞`;

    return a.sendMessage(menu, e.threadID, (err, info) => {
      if (err) return;
      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        author: e.senderID,
        type: "create"
      });
    }, e.messageID);
  }
};

module.exports.handleReply = async function ({ api: e, event: a, handleReply: t }) {
  try {
    if (t.author !== a.senderID) return;
    if (t.type !== "create") return;

    const senderID = a.senderID;
    const now = Date.now();
    const TIME_LIMIT = 2 * 60 * 1000; // ২ মিনিট (milliseconds)
    const MAX_VIDEOS = 5; // সর্বোচ্চ ৫টি ভিডিও

    // === Rate limit check ===
    if (!global.albumRateLimit[senderID]) {
      global.albumRateLimit[senderID] = { count: 0, firstTime: now };
    }

    const userData = global.albumRateLimit[senderID];

    // ২ মিনিট পার হলে reset
    if (now - userData.firstTime >= TIME_LIMIT) {
      userData.count = 0;
      userData.firstTime = now;
    }

    // ৫টির বেশি হলে ব্লক
    if (userData.count >= MAX_VIDEOS) {
      const remaining = Math.ceil((TIME_LIMIT - (now - userData.firstTime)) / 1000);
      const min = Math.floor(remaining / 60);
      const sec = remaining % 60;
      return e.sendMessage(
        `⚠️ 𝐀𝐩𝐧𝐢 𝟐 𝐦𝐢𝐧𝐮𝐭𝐞𝐫 𝐦𝐨𝐝𝐝𝐡𝐞 𝐬𝐨𝐫𝐛𝐨𝐜𝐜𝐨 𝟓𝐭𝐢 𝐯𝐢𝐝𝐞𝐨 𝐧𝐢𝐲𝐞𝐜𝐡𝐞𝐧!\n\n⏳ 𝐀𝐛𝐚𝐫 𝐜𝐡𝐞𝐬𝐭𝐚 𝐤𝐨𝐫𝐮𝐧: ${min}𝐦 ${sec}𝐬 𝐩𝐨𝐫𝐞`,
        a.threadID,
        a.messageID
      );
    }

    const choice = a.body.trim();
    const axios = require("axios");

    const apis = await axios.get('https://raw.githubusercontent.com/shaonproject/Shaon/main/api.json');
    const baseURL = apis.data.api;

    const options = {
      "1": "/video/islam",
      "2": "/video/anime",
      "3": "/video/shairi",
      "4": "/video/short",
      "5": "/video/sad",
      "6": "/video/status",
      "7": "/video/football",
      "8": "/video/funny",
      "9": "/video/love",
      "10": "/video/cpl",
      "11": "/video/baby",
      "12": "/video/kosto",
      "13": "/video/lofi",
      "14": "/video/happy",
      "15": "/video/humaiyun",
    };

    if (!options[choice]) {
      return e.sendMessage(
        "❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐧𝐮𝐦𝐛𝐞𝐫! 𝟏 𝐭𝐡𝐞𝐤𝐞 𝟏𝟓 𝐩𝐨𝐫𝐣𝐨𝐧𝐭𝐨 𝐬𝐨𝐧𝐠𝐤𝐡𝐚 𝐝𝐢𝐧।",
        a.threadID,
        a.messageID
      );
    }

    const url = `${baseURL}${options[choice]}`;

    const response = await axios.get(url);
    const videoURL = response.data.data?.url || response.data.url || response.data.video || response.data.data;
    const title = response.data.title || response.data.shaon || "𝐕𝐈𝐃𝐄𝐎";
    const count = response.data.count || "1";

    if (!videoURL) {
      return e.sendMessage(
        "❌ 𝐕𝐢𝐝𝐞𝐨 𝐩𝐚𝐰𝐚 𝐡𝐨𝐲 𝐧𝐢! 𝐀𝐛𝐚𝐫 𝐜𝐡𝐞𝐬𝐭𝐚 𝐤𝐨𝐫𝐮𝐧।",
        a.threadID,
        a.messageID
      );
    }

    // ✅ সফলভাবে ভিডিও পাঠানোর আগে count বাড়ান
    userData.count += 1;

    const videoStream = (await axios.get(videoURL, { responseType: "stream" })).data;
    const remainingCount = MAX_VIDEOS - userData.count;

    return e.sendMessage({
      body:
`🟡 ${title}
𝐓𝐎𝐓𝐀𝐋 𝐕𝐈𝐃𝐄𝐎: ${count}

📊 𝐀𝐩𝐧𝐚𝐫 𝐛𝐚𝐤𝐢 𝐥𝐢𝐦𝐢𝐭: ${remainingCount}/${MAX_VIDEOS}

𝐀 𝐏 𝐈 乛 𝐌𝐑 𝐉𝐔𝐖𝐄𝐋 ꜛ࿐`,
      attachment: videoStream
    }, a.threadID, a.messageID);

  } catch (err) {
    console.error(err);
    return e.sendMessage(`❌ 𝐄𝐫𝐫𝐨𝐫: ${err.message}`, a.threadID, a.messageID);
  }
};
