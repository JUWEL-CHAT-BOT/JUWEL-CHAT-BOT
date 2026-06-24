const fs = require('fs');
const path = __dirname + '/antigaliStatus.json';

let offenseTracker = {};
let settings = {}; // threadID -> true/false

// Load settings from file (default: enabled)
function loadSettings() {
  try {
    if (fs.existsSync(path)) {
      const data = fs.readFileSync(path, 'utf8');
      settings = JSON.parse(data);
    } else {
      settings = {};
    }
  } catch (e) {
    settings = {};
  }
}
loadSettings();

// Save settings to file
function saveSettings() {
  fs.writeFileSync(path, JSON.stringify(settings, null, 2), 'utf8');
}

const badWords = [
  "fuck","fucking","motherfucker","mother fucker","abal","fucker",
  "Sawya","sawya","Voda","voda","Juwel ke chudi","MG","chdi",
  "tok fuck","tui magi","magi","Magi","mang","tok chudi","bokacoda","xodi","Abal choda","Bokacoda",
  "toke🖕🖕🖕","🖕🖕🖕","Pompom","pompom","Toke🖕","bollocks","cdi",
  "xoda","chup magi","Tui magi","tui magi","tor heda","Tor heda","hada",
  "Chup magi","Head","Toke🖕🖕","🖕","🖕🖕","মাদারচোদ","চুদি","মাগি",
  "কার বাল","সাউয়া বেডি","নিছের বাল","চোকাচোদা","চুদবো","চুদানির পোলা",
  "মাং","মাংগের বেডি","মাংগের গুপ","সাউয়ার বট","ভোদা","তোর মার ভোদা","সাউয়ার কথা","বোকাচোদা বট","বট বোকাচোদা","সাউয়া","জুয়েল কে চুূদি","জুয়েল বোকাচোদা","তোর সাউয়া","তোর মায়ের সাউয়া","তোর বোনের সাউয়া","তোর সাউয়া মাগি","তোর সাউয়া","মাংগের বেডি","মাংগের গুপ","বালের গুপ",
  "গিটার বাজাও","বোকাচুদা","আবাল","তুই বোকাচোদা","তুই বুকাচুদা","তুই বোকাচুদা","বোকাচুদা","তুই আবাল","জাও গিটার বাজাও","হাত মারবে","হাত মারবো","হাত মারো",
  "হাত মাড়ি","হাত মারতে জাবে","গিটার বাজাবো","পুটকি","রেন্ডির ছেলে",
  "রেন্ডি মেয়ে","রেন্ডি","এডমিন এর বাল","তুই মাগি","তোর চুদি","চোদার টাইম নাই","তোর মতো মাগি কে","তোর মতো মাগি","তোক চুূদি মাগি","তুই ১২ ভাতারী মাগি"," তুই হাত মাড়া মাগি","হাত মার","হাত মারো","হাত মাড়া মাগি","হাত মাড়া মাগি তুই"," তোর মা মাগি","তোর বোন মাগি","তোর মা মাগি বোকাচোদা","তোর বোন মাগি","বোকাচোদা","তোর মাকে চুদি মাদারচোদ","তোর মাকে চুদি","তোর মাকে আমি চুদি","তোর বোনকে আমি চুদি","তোর বোনকে চুদি","সাউয়ার গুপ","মাংগের গুপ",
  "আবাল নাকি","জুয়েল চোকাচোদা","বোকাচোদা জুয়েল","জুয়েল কে চুদি"
];

const BOT_ADMINS = ["61567576882007"];

function tokenizeMessage(message) {
  const tokens = [];
  let currentToken = '';
  const lowerMsg = message.toLowerCase();
  
  for (let i = 0; i < lowerMsg.length; i++) {
    const char = lowerMsg[i];
    if (/[\u0980-\u09FF]/.test(char) || /[a-z0-9]/.test(char)) {
      currentToken += char;
    } else {
      if (currentToken) {
        tokens.push(currentToken);
        currentToken = '';
      }
      if (char.trim() && !/[\s]/.test(char)) {
        tokens.push(char);
      }
    }
  }
  if (currentToken) tokens.push(currentToken);
  return tokens;
}

function isBadMessage(message) {
  const tokens = tokenizeMessage(message);
  return badWords.some(word => {
    const lowerWord = word.toLowerCase().trim();
    if (!lowerWord) return false;
    return tokens.some(token => token === lowerWord);
  });
}

module.exports.config = {
  name: "antigali",
  version: "3.5.0",
  hasPermssion: 0,
  credits: "MR JUWEL",
  description: "বাংলা Anti-Gali সিস্টেম (অন/অফ করতে পারেন)",
  commandCategory: "moderation",
  usages: "[on/off/status]",
  cooldowns: 0
};

module.exports.handleEvent = async function ({ api, event, Threads }) {
  try {
    if (!event.body) return;
    const threadID = event.threadID;

    // Check if system is enabled for this thread (default: true)
    const isEnabled = settings[threadID] !== undefined ? settings[threadID] : true;
    if (!isEnabled) return; // System off for this thread

    const message = event.body.toLowerCase();
    const userID = event.senderID;
    const botID = api.getCurrentUserID && api.getCurrentUserID();

    // 🆕 খারাপ শব্দ পেলে ❌ রিয়েক্ট দিন
    const matched = isBadMessage(message);
    if (matched) {
      try {
        await api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      } catch (e) {}
    } else {
      return; // খারাপ শব্দ না থাকলে আর কিছু করবেন না
    }

    if (!offenseTracker[threadID]) offenseTracker[threadID] = {};
    if (!offenseTracker[threadID][userID]) {
      offenseTracker[threadID][userID] = { 
        count: 0, 
        uidSaved: userID,
        timestamp: Date.now()
      };
    }

    let userData = offenseTracker[threadID][userID];
    userData.count += 1;
    userData.timestamp = Date.now();
    const count = userData.count;

    let userInfo = {};
    try { 
      const userInfoResult = await api.getUserInfo(userID);
      if (userInfoResult) userInfo = userInfoResult;
    } catch {}
    const userName = userInfo[userID]?.name || "অজানা ব্যবহারকারী";

    let threadInfo = {};
    try {
      if (Threads && typeof Threads.getData === "function") {
        const tdata = await Threads.getData(threadID);
        threadInfo = tdata.threadInfo || {};
      } else if (typeof api.getThreadInfo === "function") {
        threadInfo = await api.getThreadInfo(threadID) || {};
      }
    } catch {}

    const isAdminInThread = (uid) => {
      try {
        if (!threadInfo || !threadInfo.adminIDs) return false;
        return threadInfo.adminIDs.some(item => {
          if (typeof item === "string") return item == String(uid);
          if (item && item.id) return String(item.id) == String(uid);
          return false;
        });
      } catch {
        return false;
      }
    };

    // 📌 ফ্রেম
    const frameBase = (n, extra = '') => (
`╔══════════════════════════════════════════════════╗
║                                                    ║
║            ⚠️ সতর্কবার্তা #${n} ⚠️                  ║
║                                                    ║
╠══════════════════════════════════════════════════╣
║                                                    ║
║  👤 ব্যবহারকারী : ${userName}                      ║
║  🆔 ইউজার আইডি  : ${userID}                       ║
║                                                    ║
║  ⚠️ আপনার মেসেজে খারাপ কথা পাওয়া গেছে!           ║
║  📌 দয়া করে আপনার মেসেজটি ডিলিট করুন!            ║
║  💢 গ্রুপের পরিবেশ নষ্ট করিও না!                  ║
║                                                    ║
║  🔁 খারাপ কথা বলেছেন : ${n} বার                   ║
║  🚫 ${3 - n} বার বাকি, এরপর কিক!                  ║
║                                                    ║
║  ${extra}                                          ║
║                                                    ║
╠══════════════════════════════════════════════════╣
║        🛡️ অ্যান্টি-গালি সিস্টেম (৩ স্ট্রাইক)      ║
╚══════════════════════════════════════════════════╝`
    );

    const groupName = threadInfo.threadName || "Unknown Group";
    const alertMsg =
`🚨 অ্যান্টি-গালি অ্যালার্ট 🚨

📌 গ্রুপ: ${groupName}
👤 ব্যবহারকারী: ${userName}
🆔 আইডি: ${userID}
⚠️ সতর্কতা: ${count}

💬 অশালীন বার্তা:
"${event.body}"`;

    if (threadInfo && threadInfo.adminIDs) {
      for (const admin of threadInfo.adminIDs) {
        const adminID = typeof admin === "string" ? admin : admin.id;
        if (!adminID) continue;
        try {
          await api.sendMessage(alertMsg, adminID);
        } catch {}
      }
    }

    for (const ownerID of BOT_ADMINS) {
      try {
        await api.sendMessage(alertMsg, ownerID);
      } catch {}
    }

    if (count === 1) {
      await api.sendMessage(
        frameBase(1, '📌 ১ম সতর্কতা! সাবধান!'),
        threadID,
        event.messageID
      );
    } else if (count === 2) {
      await api.sendMessage(
        frameBase(2, '⚠️ শেষ সতর্কতা! পরবর্তী বার কিক!'),
        threadID,
        event.messageID
      );
    }

    if (event.messageID) {
      setTimeout(() => {
        api.unsendMessage(event.messageID).catch(() => {});
      }, 60000);
    }

    if (count === 3) {
      const botIsAdmin = botID ? isAdminInThread(botID) : false;

      if (!botIsAdmin) {
        userData.count = 2;
        return api.sendMessage(
`╔══════════════════════════════════════════════════╗
║                                                    ║
║            ⚠️ অপারেশন বন্ধ!                        ║
║                                                    ║
╠══════════════════════════════════════════════════╣
║                                                    ║
║  🤖 বট গ্রুপ অ্যাডমিন নয়!                        ║
║  ❌ তাই কাউকে কিক করা সম্ভব নয়!                  ║
║                                                    ║
║  👤 ${userName}                                   ║
║  🆔 ${userID}                                    ║
║                                                    ║
╠══════════════════════════════════════════════════╣
║        🛡️ অ্যান্টি-গালি সিস্টেম (৩ স্ট্রাইক)      ║
╚══════════════════════════════════════════════════╝`,
          threadID
        );
      }

      if (isAdminInThread(userID)) {
        userData.count = 2;
        return api.sendMessage(
`╔══════════════════════════════════════════════════╗
║                                                    ║
║            ⚠️ অপারেশন বন্ধ!                        ║
║                                                    ║
╠══════════════════════════════════════════════════╣
║                                                    ║
║  👑 এই ব্যবহারকারী গ্রুপ অ্যাডমিন!                ║
║  ❌ তাই তাকে কিক করা সম্ভব নয়!                   ║
║                                                    ║
║  👤 ${userName}                                   ║
║  🆔 ${userID}                                    ║
║                                                    ║
╠══════════════════════════════════════════════════╣
║        🛡️ অ্যান্টি-গালি সিস্টেম (৩ স্ট্রাইক)      ║
╚══════════════════════════════════════════════════╝`,
          threadID
        );
      }

      try {
        await api.sendMessage(
`╔══════════════════════════════════════════════════╗
║                                                    ║
║            🚫 ইউজার কিক করা হয়েছে!               ║
║                                                    ║
╠══════════════════════════════════════════════════╣
║                                                    ║
║  👤 ${userName}                                   ║
║  🆔 ${userID}                                    ║
║                                                    ║
║  ⚠️ ৩ বার খারাপ কথা ব্যবহার করেছেন!              ║
║  💢 গ্রুপের পরিবেশ নষ্ট করার জন্য কিক!           ║
║  💀 বিদায়! 👋                                    ║
║                                                    ║
╠══════════════════════════════════════════════════╣
║        🛡️ অ্যান্টি-গালি সিস্টেম (৩ স্ট্রাইক)      ║
╚══════════════════════════════════════════════════╝`,
          threadID
        );

        await api.removeUserFromGroup(userID, threadID);
        userData.count = 0;

      } catch {
        userData.count = 2;
        return api.sendMessage(
`╔══════════════════════════════════════════════════╗
║                                                    ║
║            ❌ ব্যর্থ হয়েছে!                       ║
║                                                    ║
╠══════════════════════════════════════════════════╣
║                                                    ║
║  ⚠️ ${userName} (${userID})                       ║
║  ➡️ কিক করতে ব্যর্থ!                              ║
║                                                    ║
╠══════════════════════════════════════════════════╣
║        🛡️ অ্যান্টি-গালি সিস্টেম (৩ স্ট্রাইক)      ║
╚══════════════════════════════════════════════════╝`,
          threadID
        );
      }
    }

    setTimeout(() => {
      if (offenseTracker[threadID] && offenseTracker[threadID][userID]) {
        if (Date.now() - offenseTracker[threadID][userID].timestamp > 86400000) {
          offenseTracker[threadID][userID].count = 0;
        }
      }
    }, 3600000);

  } catch (error) {
    console.error("AntiGali error:", error);
    api.sendMessage("⚠️ অ্যান্টি-গালি সিস্টেমে ত্রুটি!", event.threadID);
  }
};

module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const command = args[0] ? args[0].toLowerCase() : null;

  // যদি কোনো কমান্ড না থাকে, তাহলে UI মেনু দেখাব
  if (!command) {
    const isBotAdmin = BOT_ADMINS.includes(event.senderID);
    let menu = 
`📋 **অ্যান্টি-গালি কন্ট্রোল প্যানেল**

বর্তমান স্ট্যাটাস: ${settings[threadID] !== undefined ? (settings[threadID] ? '✅ চালু' : '❌ বন্ধ') : '✅ চালু (ডিফল্ট)'}

🔹 **অপশন সমূহ:**
`;
    if (isBotAdmin) {
      menu += `➡️ \`${module.exports.config.name} on\` - চালু করুন\n➡️ \`${module.exports.config.name} off\` - বন্ধ করুন\n`;
    } else {
      menu += `⚠️ শুধুমাত্র বট অ্যাডমিনরা on/off করতে পারেন।\n`;
    }
    menu += `➡️ \`${module.exports.config.name} status\` - স্ট্যাটাস দেখুন`;

    return api.sendMessage(menu, threadID);
  }

  // on/off শুধুমাত্র বট অ্যাডমিনদের জন্য
  if ((command === 'on' || command === 'off') && !BOT_ADMINS.includes(event.senderID)) {
    return api.sendMessage("⚠️ শুধুমাত্র বট অ্যাডমিনরা এই সেটিং পরিবর্তন করতে পারেন।", threadID);
  }

  if (command === 'on') {
    settings[threadID] = true;
    saveSettings();
    return api.sendMessage(
`✅ অ্যান্টি-গালি সিস্টেম চালু করা হয়েছে!
📌 এই গ্রুপে এখন থেকে খারাপ কথা ব্যবহার করলে ব্যবস্থা নেওয়া হবে।`,
      threadID
    );
  } else if (command === 'off') {
    settings[threadID] = false;
    saveSettings();
    if (offenseTracker[threadID]) delete offenseTracker[threadID];
    return api.sendMessage(
`❌ অ্যান্টি-গালি সিস্টেম বন্ধ করা হয়েছে!
📌 এই গ্রুপে এখন থেকে কোনো খারাপ কথা চেক করা হবে না।`,
      threadID
    );
  } else if (command === 'status') {
    const status = settings[threadID] !== undefined ? settings[threadID] : true;
    const statusText = status ? '✅ চালু' : '❌ বন্ধ';
    return api.sendMessage(
`📊 অ্যান্টি-গালি স্ট্যাটাস:
🆔 গ্রুপ আইডি: ${threadID}
📌 বর্তমান অবস্থা: ${statusText}

📋 কমান্ড:
${module.exports.config.name} on  → চালু
${module.exports.config.name} off → বন্ধ
${module.exports.config.name} status → বর্তমান অবস্থা দেখুন`,
      threadID
    );
  } else {
    return api.sendMessage(
`⚠️ ভুল কমান্ড! ব্যবহার করুন:
${module.exports.config.name} on/off/status`,
      threadID
    );
  }
};
