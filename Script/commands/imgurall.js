module.exports.config = {
  name: "imgurall",
  version: "3.0.0",
  hasPermssion: 3,
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "Upload ✅-reacted group media to Imgur (admin only)",
  commandCategory: "other",
  usages: "imgurall",
  cooldowns: 30,
};

// ===== বট এডমিন লিস্ট =====
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

// ===== প্রতিটি ইউজারের জন্য "already uploaded" ট্র্যাকিং =====
// গ্লোবাল স্টোর: userID -> Set(messageID + attachmentURL)
if (!global.imgurAllUsed) global.imgurAllUsed = {};
if (!global.imgurAllPending) global.imgurAllPending = {}; // কমান্ড চলাকালীন রিয়েক্ট ট্র্যাক

function getUsedKey(msgID, url) {
  return `${msgID}::${url}`;
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

  // ===== ইউজার স্টেট ইনিশিয়ালাইজ =====
  if (!global.imgurAllUsed[senderID]) {
    global.imgurAllUsed[senderID] = new Set();
  }

  const usedSet = global.imgurAllUsed[senderID];

  // ===== ২০ সেকেন্ড কাউন্টডাউন শুরু =====
  api.sendMessage(
    "⏳ ২০ সেকেন্ড অপেক্ষা করুন...\n\nএই সময়ের মধ্যে আপনি ✅ রিয়েক্ট দিতে থাকুন যেসব ফটো/ভিডিওর লিংক চান।",
    threadID,
    messageID
  );

  // এই কমান্ডের জন্য pending ট্র্যাকিং সেট
  const pendingKey = `${threadID}_${senderID}_${Date.now()}`;
  global.imgurAllPending[pendingKey] = new Set();

  // ওই ২০ সেকেন্ডে পড়া রিয়েক্ট ইভেন্টগুলো ক্যাচ করার জন্য লিসেনার
  const reactionHandler = (payload) => {
    try {
      if (!payload || payload.threadID !== threadID) return;
      if (payload.userID !== senderID) return;
      if (payload.reaction !== "✅") return;
      // রিয়েক্ট ইভেন্টে messageID থাকে যেটাতে রিয়েক্ট দেওয়া হয়েছে
      const targetMsgID = payload.messageID;
      if (targetMsgID) {
        global.imgurAllPending[pendingKey].add(targetMsgID);
      }
    } catch (e) {}
  };

  if (api.listen) {
    try { api.listen("event", reactionHandler); } catch (e) {}
  }

  await new Promise((resolve) => setTimeout(resolve, 20000));

  // লিসেনার সরানো
  if (api.removeListener) {
    try { api.removeListener("event", reactionHandler); } catch (e) {}
  }

  const extraReactedMsgIDs = global.imgurAllPending[pendingKey] || new Set();

  // ===== গ্রুপের মেসেজ হিস্ট্রি থেকে ডেটা আনা =====
  const MAX_MEDIA = 30;
  const collectedMedia = [];

  try {
    const threadInfo = await api.getThreadHistory(threadID, 100, Date.now());

    if (threadInfo && threadInfo.length > 0) {
      // ডুপ্লিকেট মেসেজ আইডি ফিল্টার (API একই মেসেজ দু'বার দিতে পারে)
      const seenMsg = new Set();
      const uniqueMessages = [];
      for (const m of threadInfo) {
        if (!m.messageID) continue;
        if (seenMsg.has(m.messageID)) continue;
        seenMsg.add(m.messageID);
        uniqueMessages.push(m);
      }

      // নতুন → পুরনো
      uniqueMessages.sort(
        (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
      );

      for (const msg of uniqueMessages) {
        if (!msg.attachments || msg.attachments.length === 0) continue;

        // ✅ রিয়েক্ট চেক — মেসেজে senderID-এর পক্ষ থেকে ✅ রিয়েক্ট আছে কি না
        // getThreadHistory থেকে reactions আসে: msg.reactions = { "✅": [userID1, userID2], ... }
        let hasUserReacted = false;

        // কমান্ড চলাকালীন লিসেনারে ধরা পড়া রিয়েক্ট
        if (extraReactedMsgIDs.has(msg.messageID)) {
          hasUserReacted = true;
        }

        // হিস্ট্রির reactions ফিল্ডে চেক
        if (!hasUserReacted && msg.reactions) {
          const reacts = msg.reactions;
          // reactions হতে পারে object: { "✅": [userID,...] }
          if (typeof reacts === "object" && !Array.isArray(reacts)) {
            for (const key of Object.keys(reacts)) {
              // ইমোজি ঠিক ✅ কিনা
              if (key === "✅" || key.includes("✅")) {
                const users = reacts[key];
                if (Array.isArray(users) && users.map(String).includes(String(senderID))) {
                  hasUserReacted = true;
                  break;
                }
              }
            }
          }
          // reactions হতে পারে array: [{reaction:"✅", userID:"..."}]
          if (!hasUserReacted && Array.isArray(reacts)) {
            for (const r of reacts) {
              const rEmoji = r.reaction || r.emoji || r.name;
              const rUser = r.userID || r.userId || r.senderID;
              if (rEmoji && String(rEmoji).includes("✅") && String(rUser) === String(senderID)) {
                hasUserReacted = true;
                break;
              }
            }
          }
        }

        if (!hasUserReacted) continue;

        // ✅ মিডিয়া অ্যাটাচমেন্ট নাও
        for (const att of msg.attachments) {
          const type = att.type;
          const url = att.url;
          if (!url) continue;

          const isMedia =
            type === "photo" ||
            type === "video" ||
            type === "animated_image" ||
            /\.(jpg|jpeg|png|gif|mp4|webm|mov)$/i.test(url);

          if (!isMedia) continue;

          // আগেই আপলোড হয়েছে কিনা চেক (ডুপ্লিকেট ব্লক)
          const key = getUsedKey(msg.messageID, url);
          if (usedSet.has(key)) continue;

          collectedMedia.push({
            url,
            type,
            timestamp: msg.timestamp,
            key,
          });

          if (collectedMedia.length >= MAX_MEDIA) break;
        }

        if (collectedMedia.length >= MAX_MEDIA) break;
      }
    }
  } catch (e) {
    console.log("History fetch error:", e);
  }

  if (collectedMedia.length === 0) {
    delete global.imgurAllPending[pendingKey];
    return api.sendMessage(
      "❌ কোনো নতুন ✅-রিয়েক্টেড মিডিয়া পাওয়া যায়নি!\n\n(যেসব মিডিয়ার লিংক আগেই বানানো হয়েছে, সেগুলো বাদ দেওয়া হয়েছে। নতুন মিডিয়াতে ✅ রিয়েক্ট দিয়ে আবার কমান্ড দিন।)",
      threadID,
      messageID
    );
  }

  // ===== Imgur-এ আপলোড =====
  const uploadedLinks = [];
  for (let i = 0; i < collectedMedia.length; i++) {
    try {
      const mediaUrl = encodeURIComponent(collectedMedia[i].url);
      const res = await axios.get(`${Shaon}/imgur?link=${mediaUrl}`);
      const link = res.data?.uploaded?.image;
      if (link && link.startsWith("http")) {
        uploadedLinks.push(`"${link}"`);
        // সফল হলে used সেটে যোগ করো
        usedSet.add(collectedMedia[i].key);
      }
    } catch (e) {
      // ফেইল হলে স্কিপ
    }
  }

  delete global.imgurAllPending[pendingKey];

  if (uploadedLinks.length === 0) {
    return api.sendMessage(
      "❌ কোনো মিডিয়া আপলোড করা যায়নি!",
      threadID,
      messageID
    );
  }

  const formattedLinks = uploadedLinks.join(",\n");
  return api.sendMessage(formattedLinks, threadID, messageID);
};
