const axios = require("axios");

const triggers = [
  "Juwel", "jewel", "juwel", "jewel boss", "mr juwel", "boss juwel",
  "juyel", "Juyel", "juwl", "Jwel",
  "juwel vai", "juwel vaiya", "jowel", "Jowel", "hi juwel",
  "love you juwel", "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",

  "জোয়েল", "জোহেল", "জোয়েলjuweljuwel ভাই", "জুয়েল ভাইয়া", "জুয়েল বস",
  "জুয়েল কই", "জুয়েল কোথায়", "কই জুয়েল", "জোয়েল", "জুয়েল",
  "জুয়েল আসো", "জুয়েল শুনো", "জুয়েল ভালোবাসি", "আই লাভ ইউ জুয়েল",
  "মিস ইউ জুয়েল", "হ্যালো জুয়েল", "হাই জুয়েল"
];

const audioUrls = [
  "https://files.catbox.moe/2nbk9d.mp3",
  "https://files.catbox.moe/pkooah.mp3",
  "https://files.catbox.moe/xjplr6.mp3",
  "https://files.catbox.moe/q7dwfu.mp3",
  "https://files.catbox.moe/2wv3fz.mp3",
  "https://files.catbox.moe/9z7tm8.mp3",
  "https://files.catbox.moe/eztcbq.mp3",
  "https://files.catbox.moe/crl00r.mp3",
  "https://files.catbox.moe/twc0kr.mp3",
  "https://files.catbox.moe/ke8seq.mp3",
  "https://files.catbox.moe/9vcx2u.mp3",
  "https://files.catbox.moe/nvg08m.mp3",
  "https://files.catbox.moe/nk6dpg.mp3",
  "https://files.catbox.moe/314f6q.mp3"
];

const cooldown = new Map();

module.exports.config = {
  name: "autovoice",
  version: "1.0.0",
  hasPermission: 0,
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "Auto voice reply",
  commandCategory: "no prefix",
  usages: "",
  cooldowns: 0
};

module.exports.handleEvent = async function ({ api, event }) {
  try {
    if (!event.body) return;

    const msg = event.body.toLowerCase().trim();

    // আগে exact match চেক করি, না পেলে substring match
    const matched = triggers.some(t => msg === t || msg.includes(t.toLowerCase()));
    if (!matched) return;

    const senderID = event.senderID;
    const now = Date.now();
    const lastTime = cooldown.get(senderID) || 0;

    // ১ ঘণ্টা cooldown
    if (now - lastTime < 3600000) return;
    cooldown.set(senderID, now);

    const url = audioUrls[Math.floor(Math.random() * audioUrls.length)];

    const voice = await axios({
      url,
      method: "GET",
      responseType: "stream",
      timeout: 15000
    });

    return api.sendMessage(
      {
        body: "🅙𝐔🅦𝐄🅛",
        attachment: voice.data
      },
      event.threadID,
      event.messageID,
      (err) => {
        if (err) console.log("[AUTOVOICE SEND ERROR]", err);
      }
    );

  } catch (err) {
    console.log("[AUTOVOICE ERROR]", err.message || err);
  }
};

module.exports.run = async function () {};
