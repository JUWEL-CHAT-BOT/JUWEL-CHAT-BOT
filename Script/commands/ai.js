const axios = require("axios");

module.exports.config = {
  name: "ai",
  version: "3.0",
  hasPermssion: 0,
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "GPT-4 Style Smart AI",
  commandCategory: "ai",
  usages: "[question]",
  cooldowns: 2
};

// 🔗 API BASE
const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
  return base.data.mahmud;
};

// 🧠 Smart Prompt Builder
function buildPrompt(userMsg) {
  return `
You are a highly intelligent AI like GPT-4.

Rules:
- Give clear, smart, human-like answers
- Keep it short but meaningful
- No unnecessary talking
- Use simple language
- If needed, give examples

User: ${userMsg}
AI:
`;
}

// 🎨 Premium UI
function format(text) {
  return `╭──『 🧠 SMART AI 』──╮\n${text}\n╰──────────────────╯`;
}

// ⚡ RUN
module.exports.run = async function ({ api, event, args }) {
  const question = args.join(" ");
  if (!question)
    return api.sendMessage("⚠️ প্রশ্ন লিখো! Example: /ai life কি?", event.threadID, event.messageID);

  try {
    const baseUrl = await mahmud();
    const prompt = buildPrompt(question);

    const res = await axios.post(`${baseUrl}/api/ai`, {
      question: prompt
    });

    const reply = format(res.data.response || "No response.");

    return api.sendMessage(reply, event.threadID, (err, info) => {
      if (!err) {
        global.client.handleReply.set(info.messageID, {
          name: module.exports.config.name,
          author: event.senderID
        });
      }
    }, event.messageID);

  } catch (e) {
    return api.sendMessage("× Error: " + e.message, event.threadID);
  }
};

// 🔁 CONTINUE CHAT (context feel)
module.exports.handleReply = async function ({ api, event, handleReply, args }) {
  if (event.senderID != handleReply.author) return;

  const msg = args.join(" ");
  if (!msg) return;

  try {
    const baseUrl = await mahmud();
    const prompt = buildPrompt(msg);

    const res = await axios.post(`${baseUrl}/api/ai`, {
      question: prompt
    });

    const reply = format(res.data.response || "No response.");

    return api.sendMessage(reply, event.threadID, (err, info) => {
      if (!err) {
        global.client.handleReply.set(info.messageID, {
          name: module.exports.config.name,
          author: event.senderID
        });
      }
    }, event.messageID);

  } catch (e) {
    return api.sendMessage("× Error: " + e.message, event.threadID);
  }
};
