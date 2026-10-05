const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "autodl",
    version: "3.2.1",
    hasPermssion: 0,
    credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
    description: "Advanced Auto Video Downloader",
    commandCategory: "media",
    usages: "paste link",
    cooldowns: 5
  },

  run: async function () {},

  handleEvent: async function ({ api, event }) {
    const { threadID, messageID, senderID, body } = event;
    if (!body || !body.startsWith("https://")) return;

    let filePath = null;

    try {
      const userName = global.data.userName.get(senderID) || "Unknown User";
      const mention = [{ tag: userName, id: senderID }];
      const startTime = Date.now();

      //━━━━━━━━━━ COOLDOWN ━━━━━━━━━━//
      const COOLDOWN_TIME = 5 * 60 * 1000;
      const adminIDs = Array.isArray(global.config.ADMINBOT)
        ? global.config.ADMINBOT.map(String)
        : [];
      const isAdmin = adminIDs.includes(String(senderID));

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      const dbPath = path.join(cacheDir, "autodl-count.json");
      let db = { total: 0, users: {} };
      try {
        if (fs.existsSync(dbPath)) {
          db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
        }
      } catch (err) {
        db = { total: 0, users: {} };
      }

      if (!db.users[senderID]) {
        db.users[senderID] = {
          name: userName,
          totalDownload: 0,
          totalTime: 0,
          lastDownload: null,
          cooldownUntil: 0
        };
      }

      if (!isAdmin) {
        const now = Date.now();
        const cooldownUntil = db.users[senderID].cooldownUntil || 0;
        if (now < cooldownUntil) {
          const remaining = cooldownUntil - now;
          const minutes = Math.floor(remaining / 60000);
          const seconds = Math.floor((remaining % 60000) / 1000);
          api.setMessageReaction("⏰", messageID, () => {}, true);
          return api.sendMessage(
            `┏━━━〔 ⏰ DOWNLOAD COOLDOWN ⏰ 〕━━━┓\n\n👤 USER : ${userName}\n━━━━━━━━━━━━━━━━━━\n❌ ৫ মিনিটের আগে আর ভিডিও ডাউনলোড দিতে পারবে না\n🕒 বাকি সময় : ${minutes} মিনিট ${seconds} সেকেন্ড\n⌛ কুলডাউন শেষ হলে আবার ভিডিও ডাউনলোড দিতে পারবে\n┗━━━━━━━━━━━━━━━━━━┛`,
            threadID,
            messageID
          );
        }
      }

      //━━━━━━━━━━ PLATFORM DETECT ━━━━━━━━━━//
      let platform = "Unknown";
      if (/facebook\.com|fb\.watch|fb\.me/.test(body)) platform = "Facebook";
      else if (/tiktok\.com/.test(body)) platform = "TikTok";
      else if (/youtube\.com|youtu\.be/.test(body)) platform = "YouTube";
      else if (/instagram\.com/.test(body)) platform = "Instagram";
      else if (/likee\.video/.test(body)) platform = "Likee";
      else if (/pinterest\.com/.test(body)) platform = "Pinterest";
      else if (/twitter\.com|x\.com/.test(body)) platform = "Twitter";
      else if (/capcut\.com/.test(body)) platform = "CapCut";

      api.setMessageReaction("⏳", messageID, () => {}, true);

      //━━━━━━━━━━ DOWNLOAD API ━━━━━━━━━━//
      let videoUrl = null;
      let title = `${platform} Video`;

      // Try multiple APIs for better success rate
      const apis = [
        `https://api.samirthakuri10.workers.dev/alldl?url=${encodeURIComponent(body)}`,
        `https://nayan-video-downloader.vercel.app/alldown?url=${encodeURIComponent(body)}`,
        `https://api.azadx69x.workers.dev/alldl?url=${encodeURIComponent(body)}`
      ];

      for (const apiUrl of apis) {
        try {
          const res = await axios.get(apiUrl, { timeout: 20000 });
          const data = res.data;

          if (data && (data.status === true || data.success === true || data.status === "success")) {
            videoUrl = data.url || data.video_url || data.download_url || 
                       (data.data && (data.data.url || data.data.high || data.data.video)) ||
                       (data.links && (data.links.hd || data.links.sd));
            title = data.title || data.caption || data.desc || 
                    (data.data && data.data.title) || title;
            if (videoUrl) break;
          }

          // Alternative response shape
          if (data && data.high) { videoUrl = data.high; title = data.title || title; break; }
          if (data && data.hd) { videoUrl = data.hd; break; }
          if (data && data.video) { videoUrl = data.video; break; }
        } catch (err) {
          console.log(`[autodl] API failed:`, err.message);
          continue;
        }
      }

      if (!videoUrl) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return api.sendMessage(
          "❌ Unable To Download This Video!\n\nসাপোর্টেড লিংক: Facebook, TikTok, YouTube, Instagram, Likee, Pinterest, Twitter, CapCut",
          threadID,
          messageID
        );
      }

      //━━━━━━━━━━ DOWNLOAD VIDEO ━━━━━━━━━━//
      title = String(title).replace(/\n/g, " ").replace(/\s+/g, " ").trim().slice(0, 100);

      const fileName = `autodl_${senderID}_${Date.now()}.mp4`;
      filePath = path.join(cacheDir, fileName);

      const response = await axios({
        url: videoUrl,
        method: "GET",
        responseType: "stream",
        timeout: 60000,
        maxRedirects: 5,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Referer': 'https://www.facebook.com/'
        }
      });

      // Stream to file
      await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        writer.on("finish", resolve);
        writer.on("error", reject);
        response.data.on("error", reject);
      });

      // Check if file has content
      const stats = fs.statSync(filePath);
      if (stats.size < 1000) {
        throw new Error("Downloaded file is too small or corrupted");
      }

      const fileSize = (stats.size / 1024 / 1024).toFixed(2) + " MB";
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

      //━━━━━━━━━━ UPDATE DB ━━━━━━━━━━//
      db.total += 1;
      db.users[senderID].totalDownload += 1;
      db.users[senderID].totalTime += Number(totalTime);
      db.users[senderID].lastDownload = new Date().toLocaleString("en-BD", { timeZone: "Asia/Dhaka" });
      if (!isAdmin) {
        db.users[senderID].cooldownUntil = Date.now() + COOLDOWN_TIME;
      }
      try {
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
      } catch (e) {
        console.log("[autodl] DB write error:", e.message);
      }

      api.setMessageReaction("✅", messageID, () => {}, true);

      //━━━━━━━━━━ SEND VIDEO ━━━━━━━━━━//
      return api.sendMessage(
        {
          body:
            `╔══════════✦═════════╗\n『 AUTO DOWNLOADER 』\n╚═════════✦════════╝\n\n╭━━━━━━━━━━━━━━━━━━╮\n┃ 👤 REQUEST BY :\n┃ ${userName}\n┣━━━━━━━━━━━━━━━━━━┫\n┃ 🎬 PLATFORM :\n┃ ${platform}\n┣━━━━━━━━━━━━━━━━━━┫\n┃ ⚡ DOWNLOAD TIME :\n┃ ${totalTime} Seconds\n┣━━━━━━━━━━━━━━━━━━┫\n┃ 📦 FILE SIZE :\n┃ ${fileSize}\n╰━━━━━━━━━━━━━━━━━━╯\n\n⎯͢🩷ꤪ⁽𝐌ꤪ𝆠፝֟𝐑₎ꜛ⪼─⃞⤹𐙚\n𝐉𝆠፝֟🅤𝆠፝֟𝐖𝆠፝֟🅔𝆠፝֟𝐋༢ꜛ國🩷ꤪ🪽`,
          mentions: mention,
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => {
          // Cleanup after send
          setTimeout(() => {
            try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (e) {}
          }, 5000);
        },
        messageID
      );

    } catch (e) {
      console.log("[autodl] Error:", e);

      api.setMessageReaction("❌", messageID, () => {}, true);

      // Cleanup on error
      if (filePath) {
        try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (err) {}
      }

      let errMsg = e.message || "Unknown error";
      if (errMsg.includes("timeout") || errMsg.includes("ETIMEDOUT")) {
        errMsg = "ডাউনলোড টাইমআউট হয়েছে। ভিডিওটি অনেক বড় বা সার্ভার স্লো।";
      } else if (errMsg.includes("ENOTFOUND") || errMsg.includes("ECONNREFUSED")) {
        errMsg = "সার্ভারে কানেক্ট করা যাচ্ছে না। ইন্টারনেট চেক করুন।";
      }

      return api.sendMessage(`❌ Error:\n${errMsg}`, threadID, messageID);
    }
  }
};
