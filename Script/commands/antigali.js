const fs = require('fs');
const path = require('path');

// ==================== পাথ সেটআপ ====================
const configPath = path.join(__dirname, '..', '..', 'config.json'); // bot root/config.json
const statusPath = path.join(__dirname, 'antigaliStatus.json');

// ==================== ডাটা লোড ====================
let offenseTracker = {};
let settings = {};
let botConfig = { botAdmins: [] };

// বট অ্যাডমিন config.json থেকে লোড
function loadBotConfig() {
  try {
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, 'utf8');
      botConfig = JSON.parse(raw);
      if (!Array.isArray(botConfig.botAdmins)) botConfig.botAdmins = [];
    } else {
      botConfig = { botAdmins: [] };
    }
  } catch (e) {
    console.error("❌ config.json লোড ব্যর্থ:", e.message);
    botConfig = { botAdmins: [] };
  }
}

// গ্রুপ সেটিংস লোড
function loadSettings() {
  try {
    if (fs.existsSync(statusPath)) {
      const data = fs.readFileSync(statusPath, 'utf8');
      settings = JSON.parse(data);
    } else {
      settings = {};
    }
  } catch (e) {
    settings = {};
  }
}

function saveSettings() {
  try {
    fs.writeFileSync(statusPath, JSON.stringify(settings, null, 2), 'utf8');
  } catch (e) {
    console.error("❌ সেটিংস সেভ ব্যর্থ:", e.message);
  }
}

loadBotConfig();
loadSettings();

// ==================== গালি তালিকা ====================
const badWordsEnglish = [
  "fuck", "fucking", "motherfucker", "mother fucker", "fucker", "bollocks", "Sawya", "sawya",
  "tui magi", "stupid juwel",
  "bot fuck you", "🖕", "🖕🖕", "🖕🖕🖕", "toke🖕", "toke🖕🖕", "toke 🖕", "🖕 fuck", "fuck 🖕",
  "chut", "gand", "bhosdi", "benchod", "madarchod", "randi", "kutta bacsa", "magi", "Magi", "MC Bot", "MC bot", "Mc Bot", "Vodar Bot", "Sawyar Bot", "sawyar bot", "Vodar bot", " bot tor booske chudi", "Bot tor boos ke chudi",
  "xodi", "Xodi", "cdi", "Cdi", "tor mar Voda", "tor mare cdi", "Tor mare chodi", "Tor mar voda", "Tor mar Voda", "Tor Bon ar Voda", "Pompom", "chutmarani", " juwek ke cudi", "Juwel ke cdi", "tor boos Juwel ke Chudi",
  "bokacoda", "xodi", "xoda", "cdi", "72 Lack", "chdi", "chup magi", "Chup magi", "tok chudi", "Tor mar Sawya", " Tor bon ar sawya", "Tor Bon ar Sawya", " Sawya dey",
  "tok fuck", "Voda", "voda", "Juwel ke chudi", "abal", "vodar group", "Vodar group", "Sawyar group", "nunu", "Nunu", "Tuntuni", "tuntuni", "tor boos ke cudi", "Tor boos ke cudi", "Tor boss ke chudi"
];

const badWordsBengali = [
  "আবাল", "সাউয়া", "ভোদা", "মাগি", "চুদি", "বোকাচোদা", "বোকাচুদা", "মাদারচোদ", "চুদা",
  "চুদতে", "সেক্স করতে", "ভোদার গুপ", "সাউয়ার", "খানকি", "পুটকি", "গুদ", "রেন্ডি", "হাত মার",
  "গিটার বাজাও", "হাত মাড়া", "চুদবো", "চুদানির পোলা", "মাং", "মাংগের বেডি", "বালের বট", " তোর বোন এর ভোদা", "তোর বোন এর সাউয়া", "তোর বোন কে চুদি",
  "সাউয়ার বট", "সাউয়ার কথা", "তোর মার ভোদা", "তোর সাউয়া", "তোর মায়ের সাউয়া", "তোর মার সাউয়া", "তোর মার ভোদা",
  "তোর বোনের সাউয়া", "তোর সাউয়া মাগি", "জুয়েল কে চুদি", "জুয়েল চোকাচোদা",
  "এডমিন এর বাল", "চোদার", "তোর মতো মাগি", "তোক চুদি", "তুই ১২ মাগি", "জুয়েল এর মারে চুদি", "জুয়েল এর মাকে চুদি", "জুয়েল এর মার ভোদা", "জুয়েল এর মার সাউয়া",
  "তুই হাত মাড়া মাগি", "তোর মা মাগি", "তোর বোন মাগি", "তোর মাকে চুদি", "তোর বোনকে চুদি", "জুয়েল এর বোন কে চুদি", "জুয়েল এর বোন এর সাউয়া", "জয়েল এর বোন এর ভোদা",
  "মাদারচোদ", "কার বাল", "নিছের বাল", "চোকাচোদা", "রেন্ডির ছেলে", "রেন্ডি মেয়ে",
  "পম্পম", "Pompom", "আবাল নাকি", "জুয়েল বোকাচোদা", "তুই বোকাচোদা", "তুই বুকাচুদা",
  "জাও গিটার বাজাও", "হাত মারবে", "হাত মারবো", "হাত মারো", "হাত মারতে জাবে", "বট এর বসকে চুদি", "বট তোর বসকে চুদি", "বট তোর বস জুয়েল কে চুদি",
  "গিটার বাজাবো", "তুই ১২ ভাতারী মাগি", "তুই হাত মাড়া", "হাত মাড়ি", "জান চুদতে দিবে", "বট কে চুদি", "বট চুদি", "ভোদার বট", "মাংগের বট", "বট তোর বস কে চুদি", "বট তোকে চুদি", "বট তোরে চুদি", "সাউয়ার বট চুদি", "ভোদার বট চুদি"
];

// ==================== গালি চেক ====================
function checkBadMessage(message) {
  const lower = message.toLowerCase().trim();

  for (let word of badWordsBengali) {
    if (lower.includes(word.toLowerCase())) {
      return { hasBad: true, type: 'বাংলা', word: word };
    }
  }

  for (let word of badWordsEnglish) {
    if (lower.includes(word.toLowerCase())) {
      return { hasBad: true, type: 'ইংরেজি', word: word };
    }
  }

  return { hasBad: false };
}

// ==================== কনফিগ ====================
module.exports.config = {
  name: "antigali",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "MR JUWEL",
  description: "বাংলা+ইংরেজি Anti-Gali (config.json থেকে বট অ্যাডমিন)",
  commandCategory: "moderation",
  usages: "[on/off/status]",
  cooldowns: 0
};

// ==================== ইভেন্ট হ্যান্ডলার ====================
module.exports.handleEvent = async function ({ api, event }) {
  try {
    if (!event.body) return;
    const threadID = event.threadID;
    const userID = event.senderID;
    if (!userID) return;

    // গ্রুপ অন/অফ চেক
    const isEnabled = settings[threadID] !== undefined ? settings[threadID] : true;
    if (!isEnabled) return;

    // গালি চেক
    const { hasBad, type, word } = checkBadMessage(event.body);
    if (!hasBad) return;

    // ❌ রিঅ্যাকশন
    if (event.messageID) {
      try { await api.setMessageReaction("❌", event.messageID); } catch (_) {}
    }

    // ========== অফেন্স ট্র্যাকিং ==========
    if (!offenseTracker[threadID]) offenseTracker[threadID] = {};
    if (!offenseTracker[threadID][userID]) {
      offenseTracker[threadID][userID] = { enCount: 0, bnCount: 0, total: 0, lastUpdated: Date.now() };
    }
    const userData = offenseTracker[threadID][userID];
    if (type === 'ইংরেজি') userData.enCount += 1;
    else if (type === 'বাংলা') userData.bnCount += 1;
    userData.total += 1;
    userData.lastUpdated = Date.now();

    const totalCount = userData.total;
    const enCount = userData.enCount;
    const bnCount = userData.bnCount;

    // ========== ইউজার ও গ্রুপ ইনফো ==========
    let userName = "অজানা";
    let groupName = "Unknown";
    let adminIDs = [];
    try {
      const [uInfo, tInfo] = await Promise.all([
        api.getUserInfo(userID).catch(() => ({})),
        api.getThreadInfo(threadID).catch(() => ({}))
      ]);
      userName = uInfo[userID]?.name || "অজানা";
      groupName = tInfo.threadName || "Unknown";
      adminIDs = Array.isArray(tInfo.adminIDs) ? tInfo.adminIDs : [];
    } catch (e) {
      console.error("Info fetch error:", e.message);
    }

    // ========== অ্যাডমিন চেক হেল্পার ==========
    const isAdminInThread = (uid) => {
      if (!uid) return false;
      if (!Array.isArray(adminIDs) || adminIDs.length === 0) return false;
      return adminIDs.some(item => {
        const id = typeof item === "string" ? item : item.id;
        return String(id) === String(uid);
      });
    };

    // ========== বটের নিজের ID ==========
    let botID = null;
    try {
      if (typeof api.getCurrentUserID === 'function') {
        botID = await api.getCurrentUserID();
      }
    } catch (_) {}
    if (!botID && global?.data?.botID) botID = global.data.botID;
    if (!botID && global?.client?.botID) botID = global.client.botID;

    // ========== ফ্রেম মেসেজ ==========
    const frameBase = (n, extra = '') =>
`╔════════════════════╗
║                                                    
║ ⚠️ সতর্কবার্তা #${n} ⚠️                 
║                                                    
╠═════════════════════╣
║                                                    
║  👤 ব্যবহারকারী : ${userName}                      
║  🆔 ইউজার আইডি  : ${userID}                       
║  🌐 এই বার্তায় ভাষা : ${type}                      
║  📝 শনাক্তকৃত শব্দ : "${word}"                     
║                                                    
║  📊 মোট গালি       : ${totalCount} বার             
║  🇬🇧 ইংরেজি        : ${enCount} বার                
║  🇧🇩 বাংলা         : ${bnCount} বার                
║                                                    
║  ⚠️ আপনার মেসেজে খারাপ কথা পাওয়া গেছে!           
║  📌 দয়া করে আপনার মেসেজটি ডিলিট করুন!            
║  💢 গ্রুপের পরিবেশ নষ্ট করিও না!                  
║                                                    
║  🔁 খারাপ কথা বলেছেন : ${n} বার (এই সেশন)         
║  🚫 ${3 - n} বার বাকি, এরপর কিক!                  
║                                                    
║  ${extra}                                          
║                                                    
╠═══════════════════════╣
║🛡️ অ্যান্টি-গালি সিস্টেম (৩ স্ট্রাইক)      
╚═══════════════════════╝`;

    // ========== ইনবক্স নোটিশ (অ্যাডমিনদের জন্য) ==========
    const inboxNotice =
`🚨 অ্যান্টি-গালি অ্যালার্ট 🚨
━━━━━━━━━━━━━━━━━━━━━
📌 গ্রুপ       : ${groupName}
🆔 গ্রুপ আইডি  : ${threadID}
👤 ব্যবহারকারী : ${userName}
🆔 ইউজার আইডি  : ${userID}
🌐 ভাষা        : ${type}
📝 শব্দ        : "${word}"
💬 পূর্ণ মেসেজ : "${event.body}"
━━━━━━━━━━━━━━━━━━━━━
⚠️ সতর্কতা নম্বর : ${totalCount} / 3
🇬🇧 ইংরেজি গালি : ${enCount} বার
🇧🇩 বাংলা গালি  : ${bnCount} বার
━━━━━━━━━━━━━━━━━━━━━
🛡️ অ্যান্টি-গালি সিস্টেম`;

    // ========== পাঠানোর তালিকা ==========
    const sendPromises = [];

    // ১) গ্রুপে সতর্কবার্তা (শুধু ১ম ও ২য় বার)
    if (totalCount === 1) {
      sendPromises.push(
        api.sendMessage(frameBase(1, '📌 ১ম সতর্কতা! সাবধান!'), threadID).catch(() => {})
      );
    } else if (totalCount === 2) {
      sendPromises.push(
        api.sendMessage(frameBase(2, '⚠️ শেষ সতর্কতা! পরবর্তী বার কিক!'), threadID).catch(() => {})
      );
    }

    // ২) গ্রুপ অ্যাডমিনদের ইনবক্সে নোটিশ
    for (const admin of adminIDs) {
      const adminID = typeof admin === "string" ? admin : admin.id;
      if (adminID && String(adminID) !== String(userID)) {
        sendPromises.push(api.sendMessage(inboxNotice, adminID).catch(() => {}));
      }
    }

    // ৩) বট অ্যাডমিনদের ইনবক্সে নোটিশ (config.json থেকে)
    for (const botAdminID of botConfig.botAdmins) {
      if (botAdminID && String(botAdminID) !== String(userID)) {
        sendPromises.push(api.sendMessage(inboxNotice, botAdminID).catch(() => {}));
      }
    }

    await Promise.allSettled(sendPromises).catch(() => {});

    // ========== ৬০ সেকেন্ড পর অটো ডিলিট ==========
    if (event.messageID) {
      setTimeout(() => {
        api.unsendMessage(event.messageID).catch(() => {});
      }, 60000);
    }

    // ========== ৩ স্ট্রাইক হলে কিক ==========
    if (totalCount === 3) {
      const botIsAdmin = botID ? isAdminInThread(botID) : false;

      console.log("🔍 DEBUG → botID:", botID, "| botIsAdmin:", botIsAdmin);
      console.log("🔍 DEBUG → adminIDs:", JSON.stringify(adminIDs));

      // বট অ্যাডমিন না হলে কিক বন্ধ
      if (!botIsAdmin) {
        await api.sendMessage(
`╔══════════════════════╗
║                                                    
║     ⚠️ অটো কিক বন্ধ!                        
║                                                    
╠════════════════════════╣
║                                                    
║  🤖 বট গ্রুপ অ্যাডমিন নয়!                        
║  ❌ তাই কাউকে কিক করা সম্ভব নয়!                  
║                                                    
║  👤 ${userName}                                   
║  🆔 ${userID}                                    
║                                                    
╠══════════════════════════╣
║🛡️ অ্যান্টি-গালি সিস্টেম (৩ স্ট্রাইক)     ║
╚══════════════════════════╝`,
          threadID
        ).catch(() => {});
        return;
      }

      // ব্যবহারকারী নিজেই গ্রুপ অ্যাডমিন হলে কিক বন্ধ
      if (isAdminInThread(userID)) {
        await api.sendMessage(
`╔═════════════════════════╗
║                                                    
║      ⚠️ অটো কিক বন্ধ!                        
║                                                    
╠══════════════════════════╣
║                                                    
║  👑 এই ব্যবহারকারী গ্রুপ অ্যাডমিন!                
║  ❌ তাই তাকে কিক করা সম্ভব নয়!                   
║                                                    
║  👤 ${userName}                                   
║  🆔 ${userID}                                    
║                                                    
╠══════════════════════════╣
║  🛡️ অ্যান্টি-গালি সিস্টেম (৩ স্ট্রাইক)      
╚══════════════════════════╝`,
          threadID
        ).catch(() => {});
        return;
      }

      // কিক করার চেষ্টা
      try {
        await api.sendMessage(
`╔══════════════════════╗
║                                                    
║   🚫 ইউজার কিক করা হয়েছে!               
║                                                    
╠══════════════════════╣
║                                                    
║  👤 ${userName}                                   
║  🆔 ${userID}                                    
║                                                    
║  ⚠️ ৩ বার খারাপ কথা ব্যবহার করেছেন!              
║  💢 গ্রুপের পরিবেশ নষ্ট করার জন্য কিক!           
║  💀 বিদায়! 👋                                    
║                                                    
╠═══════════════════════╣
║ 🛡️ অ্যান্টি-গালি সিস্টেম (৩ স্ট্রাইক)      
╚═══════════════════════╝`,
          threadID
        );
        await api.removeUserFromGroup(userID, threadID);
        userData.total = 0; userData.enCount = 0; userData.bnCount = 0;
      } catch (kickErr) {
        userData.total = 2;
        await api.sendMessage(
`╔════════════════════════╗
║                                                    
║            ❌ ব্যর্থ হয়েছে!                       
║                                                    
╠════════════════════════╣
║                                                    
║  ⚠️ ${userName} (${userID})                       
║  ➡️ কিক করতে ব্যর্থ!                              
║  📌 কারণ: ${kickErr.message || 'অজানা'}          
║                                                    
╠════════════════════════╣
║ 🛡️ অ্যান্টি-গালি সিস্টেম (৩ স্ট্রাইক)      
╚════════════════════════╝`,
          threadID
        ).catch(() => {});
      }
    }

    // ========== ১ ঘন্টা পর রিসেট ==========
    setTimeout(() => {
      const rec = offenseTracker?.[threadID]?.[userID];
      if (rec && Date.now() - rec.lastUpdated > 3600000) {
        rec.total = 0; rec.enCount = 0; rec.bnCount = 0;
      }
    }, 3600000);

  } catch (error) {
    console.error("❌ AntiGali CRASH:", error);
    try {
      await api.sendMessage("⚠️ অ্যান্টি-গালি সিস্টেমে ত্রুটি! লগ চেক করুন।", event.threadID);
    } catch (_) {}
  }
};

// ==================== রান কমান্ড ====================
module.exports.run = async function ({ api, event, args }) {
  const threadID = event.threadID;
  const command = args[0] ? args[0].toLowerCase() : null;

  // config.json রিফ্রেশ (যাতে নতুন অ্যাডমিন যোগ করলে সাথে সাথে কাজ করে)
  loadBotConfig();

  const isBotAdmin = botConfig.botAdmins.map(String).includes(String(event.senderID));

  if (!command) {
    const statusText = settings[threadID] !== undefined
      ? (settings[threadID] ? '✅ চালু' : '❌ বন্ধ')
      : '✅ চালু (ডিফল্ট)';

    let menu =
`╔══════════════════════════════════════════════════╗
║                                                    ║
║        📋 অ্যান্টি-গালি কন্ট্রোল প্যানেল         ║
║                                                    ║
╠══════════════════════════════════════════════════╣
║                                                    ║
║  📌 বর্তমান স্ট্যাটাস: ${statusText}               ║
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

  // on/off এর জন্য বট অ্যাডমিন চেক
  if ((command === 'on' || command === 'off') && !isBotAdmin) {
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
`╔═════════════════════════╗
║                                                    
║       ✅ সিস্টেম চালু হয়েছে!                 
║                                                    
╠══════════════════════════╣
║                                                    
║  📌 এই গ্রুপে এখন থেকে খারাপ কথা ব্যবহার করলে     
║     ব্যবস্থা নেওয়া হবে।                          
║                                                    
╠══════════════════════════╣
║  🛡️ অ্যান্টি-গালি সিস্টেম (৩ স্ট্রাইক)      
╚══════════════════════════╝`,
      threadID
    );
  } else if (command === 'off') {
    settings[threadID] = false;
    saveSettings();
    if (offenseTracker[threadID]) delete offenseTracker[threadID];
    return api.sendMessage(
`╔════════════════════════╗
║                                                    
║   ❌ সিস্টেম বন্ধ করা হয়েছে!             
║                                                    
╠══════════════════════════╣
║                                                    
║  📌 এই গ্রুপে এখন থেকে কোনো খারাপ কথা চেক করা    
║     হবে না।                                       
║                                                    
╠══════════════════════════╣
║   🛡️ অ্যান্টি-গালি সিস্টেম (৩ স্ট্রাইক)      
╚══════════════════════════╝`,
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
`╔═══════════════════════╗
║                                                    
║            ⚠️ ভুল কমান্ড!                          
║                                                    
╠════════════════════════╣
║                                                    
║  📌 ব্যবহার করুন:                                  
║  ${module.exports.config.name} on/off/status       
║                                                    
╠════════════════════════╣
║ 🛡️ অ্যান্টি-গালি সিস্টেম (৩ স্ট্রাইক)      
╚════════════════════════╝`,
      threadID
    );
  }
};
