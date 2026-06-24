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

// 🔥 বিস্তৃত গালি তালিকা (বাদ দেওয়া শব্দগুলো বাদ দিয়ে)
const badWords = [
  // ইংরেজি বেসিক
  "fuck","fucking","motherfucker","mother fucker","fucker","bollocks","shit","asshole",
  "bastard","dick","cock","pussy","whore","slut","bitch","cunt","fuck off","suck",
  "blow job","hand job","cum","semen","masturbate","wank","piss","pissing","turd",
  "douche","douchebag","jackass","dumbass","retard","moron","idiot","stupid",
  
  // ইংরেজি স্ল্যাং
  "chut","gand","bhosdi","benchod","madarchod","randi","kutta","harami","lodu",
  "chodu","bhak","tatti","gaand","lauda","lund","choot","chutmarani",
  
  // বাংলা মূল (বাদ: বেডি, বট, গুপ, হেড, head, টাইম নাই, ভাতারি মাগি)
  "আবাল","সাউয়া","ভোদা","মাগি","চুদি","বোকাচোদা","বোকাচুদা","মাদারচোদ","চুদা",
  "শালা","বোকা","গাধা","হরামি","খানকি","পুটকি","গুদ","রেন্ডি","হাত মার",
  "গিটার বাজাও","হাত মাড়া","চুদবো","চুদানির পোলা","মাং","মাংগের বেডি","বালের",
  "সাউয়ার বট","সাউয়ার কথা","তোর মার ভোদা","তোর সাউয়া","তোর মায়ের সাউয়া",
  "তোর বোনের সাউয়া","তোর সাউয়া মাগি","জুয়েল কে চুদি","জুয়েল চোকাচোদা",
  "এডমিন এর বাল","চোদার","তোর মতো মাগি","তোক চুদি","তুই ১২",
  "তুই হাত মাড়া মাগি","তোর মা মাগি","তোর বোন মাগি","তোর মাকে চুদি","তোর বোনকে চুদি",
  
  // বাংলা মিক্স (বাদ: বেডি, বট, গুপ, হেড, head, টাইম নাই, ভাতারি মাগি)
  "মাদারচোদ","জুয়েল এর বাল","নিছের বাল","চোকাচোদা","রেন্ডির ছেলে","রেন্ডি মেয়ে",
  "পম্পম","Pompom","আবাল নাকি","জুয়েল বোকাচোদা","তুই বোকাচোদা","তুই বুকাচুদা",
  "জাও গিটার বাজাও","হাত মারবে","হাত মারবো","হাত মারো","হাত মারতে জাবে",
  "গিটার বাজাবো","তুই ১২ ভাতারী মাগি","তুই হাত মাড়া","হাত মাড়ি",
  
  // স্পেশাল ক্যারেক্টার
  "🖕","🖕🖕","🖕🖕🖕","Toke🖕","Toke🖕🖕","toke 🖕","🖕 fuck","fuck 🖕",
  
  // আরও কিছু
  "bokacoda","xodi","xoda","cdi","chdi","MG","chup magi","Chup magi","tok chudi",
  "tok fuck","Sawya","sawya","Voda","voda","Juwel ke chudi","abal","fucker"
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
  version: "3.6.0",
  hasPermssion: 0,
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "বাংলা+ইংরেজি Anti-Gali সিস্টেম (UI সহ)",
  commandCategory: "moderation",
  usages: "[on/off/status]",
  cooldowns: 0
};

module.exports.handleEvent = async function ({ api, event, Threads }) {
  try {
    if (!event.body) return;
    const threadID = event.threadID;

    const isEnabled = settings[threadID] !== undefined ? settings[threadID] : true;
    if (!isEnabled) return;

    const message = event.body.toLowerCase();
    const userID = event.senderID;
    const botID = api.getCurrentUserID && api.getCurrentUserID();

    const matched = isBadMessage(message);
    if (matched) {
      try {
        await api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      } catch (e) {}
    } else {
      return;
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

  // UI মেনু
  if (!command) {
    const isBotAdmin = BOT_ADMINS.includes(event.senderID);
    let menu = 
`╔══════════════════════════════════════════════════╗
║                                                    ║
║        📋 অ্যান্টি-গালি কন্ট্রোল প্যানেল         ║
║                                                    ║
╠══════════════════════════════════════════════════╣
║                                                    ║
║  📌 বর্তমান স্ট্যাটাস: ${settings[threadID] !== undefined ? (settings[threadID] ? '✅ চালু' : '❌ বন্ধ') : '✅ চালু (ডিফল্ট)'}   ║
║                                                    ║
║  🔹 অপশন সমূহ:                                     ║`;
    if (isBotAdmin) {
      menu += `
║  ➡️ ${module.exports.config.name} on  → চালু      ║
║  ➡️ ${module.exports.config.name} off → বন্ধ      ║`;
    } else {
      menu += `
║  ⚠️ শুধুমাত্র বট অ্যাডমিনরা on/off করতে পারেন     ║`;
    }
    menu += `
║  ➡️ ${module.exports.config.name} status → স্ট্যাটাস ║
║                                                    ║
╠══════════════════════════════════════════════════╣
║        🛡️ অ্যান্টি-গালি সিস্টেম (৩ স্ট্রাইক)      ║
╚══════════════════════════════════════════════════╝`;
    return api.sendMessage(menu, threadID);
  }

  // on/off শুধুমাত্র বট অ্যাডমিন
  if ((command === 'on' || command === 'off') && !BOT_ADMINS.includes(event.senderID)) {
    return api.sendMessage(
`╔══════════════════════════════════════════════════╗
║                                                    ║
║            ⛔ অ্যাক্সেস অস্বীকৃত!                  ║
║                                                    ║
╠══════════════════════════════════════════════════╣
║                                                    ║
║  ⚠️ শুধুমাত্র বট অ্যাডমিনরা এই কমান্ড ব্যবহার     ║
║     করতে পারেন।                                   ║
║                                                    ║
╠══════════════════════════════════════════════════╣
║        🛡️ অ্যান্টি-গালি সিস্টেম (৩ স্ট্রাইক)      ║
╚══════════════════════════════════════════════════╝`,
      threadID
    );
  }

  if (command === 'on') {
    settings[threadID] = true;
    saveSettings();
    return api.sendMessage(
`╔══════════════════════════════════════════════════╗
║                                                    ║
║            ✅ সিস্টেম চালু হয়েছে!                 ║
║                                                    ║
╠══════════════════════════════════════════════════╣
║                                                    ║
║  📌 এই গ্রুপে এখন থেকে খারাপ কথা ব্যবহার করলে     ║
║     ব্যবস্থা নেওয়া হবে।                          ║
║                                                    ║
╠══════════════════════════════════════════════════╣
║        🛡️ অ্যান্টি-গালি সিস্টেম (৩ স্ট্রাইক)      ║
╚══════════════════════════════════════════════════╝`,
      threadID
    );
  } else if (command === 'off') {
    settings[threadID] = false;
    saveSettings();
    if (offenseTracker[threadID]) delete offenseTracker[threadID];
    return api.sendMessage(
`╔══════════════════════════════════════════════════╗
║                                                    ║
║            ❌ সিস্টেম বন্ধ করা হয়েছে!             ║
║                                                    ║
╠══════════════════════════════════════════════════╣
║                                                    ║
║  📌 এই গ্রুপে এখন থেকে কোনো খারাপ কথা চেক করা    ║
║     হবে না।                                       ║
║                                                    ║
╠══════════════════════════════════════════════════╣
║        🛡️ অ্যান্টি-গালি সিস্টেম (৩ স্ট্রাইক)      ║
╚══════════════════════════════════════════════════╝`,
      threadID
    );
  } else if (command === 'status') {
    const status = settings[threadID] !== undefined ? settings[threadID] : true;
    const statusText = status ? '✅ চালু' : '❌ বন্ধ';
    return api.sendMessage(
`╔══════════════════════════════════════════════════╗
║                                                    ║
║            📊 সিস্টেম স্ট্যাটাস                    ║
║                                                    ║
╠══════════════════════════════════════════════════╣
║                                                    ║
║  🆔 গ্রুপ আইডি : ${threadID}                       ║
║  📌 বর্তমান অবস্থা : ${statusText}                 ║
║                                                    ║
║  📋 কমান্ড সমূহ:                                   ║
║  ➡️ ${module.exports.config.name} on  → চালু      ║
║  ➡️ ${module.exports.config.name} off → বন্ধ      ║
║  ➡️ ${module.exports.config.name} status → স্ট্যাটাস ║
║                                                    ║
╠══════════════════════════════════════════════════╣
║        🛡️ অ্যান্টি-গালি সিস্টেম (৩ স্ট্রাইক)      ║
╚══════════════════════════════════════════════════╝`,
      threadID
    );
  } else {
    return api.sendMessage(
`╔══════════════════════════════════════════════════╗
║                                                    ║
║            ⚠️ ভুল কমান্ড!                          ║
║                                                    ║
╠══════════════════════════════════════════════════╣
║                                                    ║
║  📌 ব্যবহার করুন:                                  ║
║  ${module.exports.config.name} on/off/status       ║
║                                                    ║
╠══════════════════════════════════════════════════╣
║        🛡️ অ্যান্টি-গালি সিস্টেম (৩ স্ট্রাইক)      ║
╚══════════════════════════════════════════════════╝`,
      threadID
    );
  }
};
