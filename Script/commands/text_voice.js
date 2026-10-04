module.exports.config = {
  name: "text_voice",
  version: "1.3",
  hasPermssion: 0,
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "মেসেজে I love you / আই লাভ ইউ থাকলেই কিউট মেয়ের ভয়েস প্লে করবে 😍",
  commandCategory: "noprefix",
  usages: "𝚃𝚎𝚡𝚃",
  cooldowns: 5
};

const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Trigger -> audio URL
// pattern গুলো regex: ছোট/বড় হাত, স্পেস, সংখ্যা, সিম্বল সব ignore করবে
const triggers = [
  {
    pattern: /i\s*love\s*you/i,   // "I love you", "ILoveYou", "i LOVE you123", ইত্যাদি
    url: "https://files.catbox.moe/bx66nu.mp4"
  },
  {
    pattern: /আই\s*লাভ\s*ইউ/,     // "আই লাভ ইউ", "আইলাভইউ"
    url: "https://files.catbox.moe/bpghul.mp4"
  }
];

// Cooldown tracker
const cooldowns = {};

module.exports.handleEvent = async ({ api, event }) => {
  const { threadID, messageID, body, senderID } = event;
  if (!body || !senderID) return;

  // ✅ সংখ্যা ও অপ্রয়োজনীয় সিম্বল বাদ দিয়ে শুধু অক্ষর রাখা
  // উদাহরণ: "I love you 123 ❤️" → "I love you"
  const cleanedBody = body
    .replace(/[0-9]/g, "")        // সংখ্যা বাদ
    .replace(/[^\p{L}\s\u0980-\u09FF]/gu, "") // অক্ষর/স্পেস/বাংলা ছাড়া সব বাদ
    .trim();

  // matched trigger খুঁজে বের করা
  const matched = triggers.find(t => t.pattern.test(cleanedBody));
  if (!matched) return;

  // Cooldown (৫ সেকেন্ড per user)
  const now = Date.now();
  if (cooldowns[senderID] && now - cooldowns[senderID] < 5000) return;
  cooldowns[senderID] = now;

  const audioUrl = matched.url;

  // Extension URL থেকে নিন
  const ext = path.extname(new URL(audioUrl).pathname) || ".mp4";
  const cacheDir = path.join(__dirname, "cache");
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

  const fileName = `voice_${Date.now()}_${Math.floor(Math.random() * 9999)}${ext}`;
  const filePath = path.join(cacheDir, fileName);

  const cleanup = () => {
    fs.unlink(filePath, (err) => {
      if (err && err.code !== "ENOENT") console.error("Delete error:", err.message);
    });
  };

  try {
    const response = await axios({
      method: "GET",
      url: audioUrl,
      responseType: "stream",
      timeout: 30000,
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage(
        {
          body: "",
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        (err) => {
          cleanup();
          if (err) console.error("Send error:", err);
        },
        messageID
      );
    });

    writer.on("error", (err) => {
      console.error("Write error:", err.message);
      cleanup();
      api.sendMessage("ভয়েস প্লে হয়নি 😅", threadID, messageID);
    });

  } catch (error) {
    console.error("Download error:", error.message);
    cleanup();
    api.sendMessage("ভয়েস প্লে হয়নি 😅", threadID, messageID);
  }
};

module.exports.run = () => {};
