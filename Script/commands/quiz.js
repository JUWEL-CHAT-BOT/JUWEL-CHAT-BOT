const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { ensureUser, addCoins, takeCoins, getMoney } = require("./coinlib");

module.exports.config = {
  name: "quiz",
  version: "4.0.0",
  hasPermssion: 0,
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "বাংলা কুইজ গেম (কয়েন সিস্টেম)",
  usePrefix: false,
  commandCategory: "Game",
  usages: "quiz [h]",
  cooldowns: 5,
  dependencies: { "axios": "" }
};

const REWARD = 5000;   // সঠিক উত্তরে পাবে
const PENALTY = 1000;  // ভুল উত্তরে কাটবে
const TIME_LIMIT = 30 * 1000; // ৩০ সেকেন্ড

const CACHE_DIR = path.resolve(__dirname, "cache");
const QUIZ_CACHE = path.join(CACHE_DIR, "quiz_cache.json");

// ---------- প্রশ্ন ক্যাশ (API ফেল করলে এখান থেকে প্রশ্ন আসবে) ----------
function readCache() {
  try {
    return JSON.parse(fs.readFileSync(QUIZ_CACHE, "utf8"));
  } catch {
    return [];
  }
}

function addToCache(q) {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    const list = readCache();
    if (list.some(x => x.question === q.question)) return;
    list.push({ question: q.question, A: q.A, B: q.B, C: q.C, D: q.D, answer: q.answer });
    if (list.length > 100) list.shift();
    fs.writeFileSync(QUIZ_CACHE, JSON.stringify(list));
  } catch (e) {
    console.error("quiz cache error:", e.message);
  }
}

async function getQuiz() {
  try {
    const res = await axios.get(
      "https://rubish-apihub.onrender.com/rubish/quiz-api?category=Bangla&apikey=rubish69",
      { timeout: 10000 }
    );
    const data = res.data;
    if (!data.question || !data.answer) throw new Error("Quiz data invalid");
    addToCache(data);
    return data;
  } catch (e) {
    const list = readCache();
    if (!list.length) throw e;
    return list[Math.floor(Math.random() * list.length)];
  }
}

module.exports.run = async function ({ api, event, args, Currencies }) {
  const { threadID, messageID, senderID } = event;

  if (args[0]?.toLowerCase() === "h") {
    return api.sendMessage(
      `🧠 কুইজ গাইড\n\n` +
      `➤ কমান্ড: quiz\n` +
      `➤ শুরুতে সবার কাছে ১০০০ কয়েন 🎁\n` +
      `➤ সঠিক উত্তর: +${REWARD} কয়েন 💰\n` +
      `➤ ভুল উত্তর: -${PENALTY} কয়েন ❌\n` +
      `➤ উত্তর দেওয়ার সময়: ৩০ সেকেন্ড ⏰\n` +
      `➤ কয়েন গিফট: gift @mention পরিমাণ 🎁\n` +
      `➤ কয়েন দিয়ে স্পিন: spin পরিমাণ 🎰\n` +
      `➤ টপ ১০ লিস্ট: top 🏆\n\n` +
      `⚡ শুভকামনা!`,
      threadID,
      messageID
    );
  }

  try {
    await ensureUser(Currencies, senderID);

    const data = await getQuiz();
    const answer = data.answer.toString().trim().toUpperCase();

    const quizText =
`╭──✦ 🧠 বাংলা কুইজ
├ প্রশ্ন: ${data.question}
│
├ 𝗔) ${data.A}
├ 𝗕) ${data.B}
├ 𝗖) ${data.C}
├ 𝗗) ${data.D}
╰──────────────────✦
✍️ রিপ্লাই দাও: A / B / C / D
✅ সঠিক: +${REWARD} কয়েন | ❌ ভুল: -${PENALTY} কয়েন
⏰ সময়: ৩০ সেকেন্ড`;

    return api.sendMessage(quizText, threadID, (err, info) => {
      if (err) return console.error(err);

      // সময় শেষ হলে শুধু উত্তর জানাবে (কয়েন কাটবে না), কুইজ মেসেজ ডিলিট হবে না
      const timeout = setTimeout(() => {
        const index = global.client.handleReply.findIndex(e => e.messageID === info.messageID);
        if (index !== -1) {
          global.client.handleReply.splice(index, 1);
          api.sendMessage(
            `⏰ সময় শেষ!\n✅ সঠিক উত্তর ছিল: ${answer}\n⚡ কোনো কয়েন কাটা হয়নি`,
            threadID,
            () => {},
            info.messageID
          );
        }
      }, TIME_LIMIT);

      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        author: senderID,
        answer,
        timeout
      });
    });
  } catch (e) {
    console.error(e);
    return api.sendMessage("❌ কুইজ লোড করা যায়নি, পরে আবার চেষ্টা করো!", threadID, messageID);
  }
};

module.exports.handleReply = async function ({ api, event, handleReply, Currencies, Users }) {
  const { senderID, threadID, messageID, body } = event;

  if (senderID !== handleReply.author) return;

  const userAnswer = (body || "").trim().toUpperCase();

  if (!["A", "B", "C", "D"].includes(userAnswer)) {
    return api.sendMessage("⚠️ দয়া করে শুধু A / B / C / D লিখে উত্তর দাও", threadID, messageID);
  }

  // একবার উত্তর দিলে টাইমার বন্ধ + আর কয়েন নেওয়া/কাটা যাবে না (মেসেজ ডিলিট হবে না)
  clearTimeout(handleReply.timeout);
  const index = global.client.handleReply.findIndex(e => e.messageID === handleReply.messageID);
  if (index !== -1) global.client.handleReply.splice(index, 1);

  try {
    await ensureUser(Currencies, senderID);

    const name = await Users.getNameUser(senderID);
    const mention = [{ id: senderID, tag: name }];

    if (userAnswer === handleReply.answer) {
      await addCoins(Currencies, senderID, REWARD);
      await ensureUser(Currencies, senderID);
      const money = await getMoney(Currencies, senderID);

      return api.sendMessage(
        {
          body:
            `🎉 অভিনন্দন ${name}!\n` +
            `✅ তোমার উত্তর সঠিক\n` +
            `💰 পেয়েছো: ${REWARD} কয়েন\n` +
            `🏦 মোট ব্যালেন্স: ${money} কয়েন`,
          mentions: mention
        },
        threadID,
        messageID
      );
    } else {
      const taken = await takeCoins(Currencies, senderID, PENALTY);
      await ensureUser(Currencies, senderID); // এডমিনের কয়েন ঠিক রাখে
      const money = await getMoney(Currencies, senderID);

      return api.sendMessage(
        {
          body:
            `❌ দুঃখিত ${name}\n` +
            `তোমার উত্তর ভুল\n` +
            `✅ সঠিক উত্তর: ${handleReply.answer}\n` +
            `💸 কাটা গেছে: ${taken} কয়েন\n` +
            `🏦 মোট ব্যালেন্স: ${money} কয়েন`,
          mentions: mention
        },
        threadID,
        messageID
      );
    }
  } catch (err) {
    console.error(err);
  }
};
