module.exports.config = {
  name: "imgurall",
  version: "2.3.0",
  hasPermssion: 3,
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "Upload last 30 group media to Imgur (admin only)",
  commandCategory: "other",
  usages: "imgurall",
  cooldowns: 30,
};

// ===== বট এডমিন লিস্ট বের করার হেল্পার =====
function getBotAdmins() {
  const fs = global.nodemodule['fs-extra'];
  const path = global.nodemodule['path'];

  const possiblePaths = [];

  if (global.client && global.client.dirConfig) {
    possiblePaths.push(global.client.dirConfig);
  }

  try {
    possiblePaths.push(path.join(__dirname, "..", "..", "config.json"));
    possiblePaths.push(path.join(__dirname, "..", "..", "..", "config.json"));
    possiblePaths.push(path.join(process.cwd(), "config.json"));
  } catch (e) {}

  if (global.config && typeof global.config === "object") {
    const direct =
      global.config.ADMINBOT ||
      global.config.adminBot ||
      global.config.ADMIN ||
      global.config.admin;
    if (Array.isArray(direct) && direct.length > 0) {
      return direct.map(String);
    }
  }

  for (const p of possiblePaths) {
    try {
      if (p && fs.existsSync(p)) {
        const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
        const list =
          raw.ADMINBOT ||
          raw.adminBot ||
          raw.ADMIN ||
          raw.admin ||
          raw.adminIds ||
          [];
        if (Array.isArray(list) && list.length > 0) {
          return list.map(String);
        }
      }
    } catch (e) {}
  }

  return [];
}

module.exports.run = async ({ api, event }) => {
  const axios = global.nodemodule['axios'];
  const { threadID, messageID, senderID } = event;

  // ===== বট এডমিন চেক =====
  const botAdminList = getBotAdmins();
  const isBotAdmin =
    botAdminList.length > 0 && botAdminList.includes(String(senderID));

  if (!isBotAdmin) {
    return api.sendMessage(
      "⛔ এই কমান্ডটি শুধুমাত্র বট এডমিন চালাতে পারবে!",
      threadID,
      messageID
    );
  }

  // ===== API key fetch =====
  let Shaon;
  try {
    const apis = await axios.get(
      'https://raw.githubusercontent.com/shaonproject/Shaon/main/api.json'
    );
    Shaon = apis.data.imgur;
  } catch (e) {
    return api.sendMessage("❌ API লোড করা যায়নি!", threadID, messageID);
  }

  // ===== ১০ সেকেন্ড ওয়েট =====
  api.sendMessage(
    "⏳ ১০ সেকেন্ড অপেক্ষা করুন...",
    threadID,
    messageID
  );

  await new Promise((resolve) => setTimeout(resolve, 10000));

  // ===== গ্রুপের মেসেজ হিস্ট্রি থেকে মিডিয়া সংগ্রহ (৩০টি) =====
  const MAX_MEDIA = 30;
  let mediaList = [];

  try {
    const threadInfo = await api.getThreadHistory(threadID, 100, Date.now());

    if (threadInfo && threadInfo.length > 0) {
      const sorted = [...threadInfo].sort(
        (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
      );

      for (const msg of sorted) {
        if (msg.attachments && msg.attachments.length > 0) {
          for (const att of msg.attachments) {
            const type = att.type;
            if (
              type === "photo" ||
              type === "video" ||
              type === "animated_image" ||
              (att.url &&
                /\.(jpg|jpeg|png|gif|mp4|webm|mov)$/i.test(att.url))
            ) {
              mediaList.push({
                url: att.url,
                type: type,
                timestamp: msg.timestamp,
              });
            }
          }
        }
        if (mediaList.length >= MAX_MEDIA) break;
      }
    }
  } catch (e) {
    console.log("History fetch error:", e);
  }

  // ===== ডুপ্লিকেট বাদ =====
  const uniqueMedia = [];
  const seen = new Set();
  for (const m of mediaList) {
    if (!seen.has(m.url)) {
      seen.add(m.url);
      uniqueMedia.push(m);
    }
  }

  const finalMedia = uniqueMedia.slice(0, MAX_MEDIA);

  if (finalMedia.length === 0) {
    return api.sendMessage(
      "❌ গ্রুপে কোনো মিডিয়া পাওয়া যায়নি!",
      threadID,
      messageID
    );
  }

  // ===== Imgur-এ আপলোড =====
  const uploadedLinks = [];
  for (let i = 0; i < finalMedia.length; i++) {
    try {
      const mediaUrl = encodeURIComponent(finalMedia[i].url);
      const res = await axios.get(`${Shaon}/imgur?link=${mediaUrl}`);
      const link = res.data?.uploaded?.image;
      if (link && link.startsWith("http")) {
        uploadedLinks.push(`"${link}"`);
      }
    } catch (e) {
      // ফেইল হলে স্কিপ
    }
  }

  if (uploadedLinks.length === 0) {
    return api.sendMessage(
      "❌ কোনো মিডিয়া আপলোড করা যায়নি!",
      threadID,
      messageID
    );
  }

  // ===== সরাসরি লিংক পাঠানো (কোনো নোটিশ ছাড়া) =====
  const formattedLinks = uploadedLinks.join(",\n");

  return api.sendMessage(formattedLinks, threadID, messageID);
};
