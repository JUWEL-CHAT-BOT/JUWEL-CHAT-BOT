const axios = require("axios");

module.exports.config = {
 name: "ai",
 version: "2.0",
 hasPermssion: 0,
 credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
 description: "Premium AI Chat with Auto Reply",
 commandCategory: "ai",
 usages: "[question]",
 cooldowns: 3
};

// 🔗 API BASE
const mahmud = async () => {
 const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
 return base.data.mahmud;
};

// ✨ UI STYLE
function formatReply(text) {
 return `╭──『 🤖 AI 』──╮\n${text}\n╰──────────────╯`;
}

// ⚡ Typing Effect
async function sendTyping(api, threadID) {
 return new Promise(resolve => {
 api.sendTypingIndicator(threadID, true);
 setTimeout(() => {
 api.sendTypingIndicator(threadID, false);
 resolve();
 }, 1500);
 });
}

// 🚀 RUN COMMAND
module.exports.run = async function ({ api, event, args }) {
 try {
 const query = args.join(" ");
 if (!query) {
 return api.sendMessage("⚠️ কিছু লিখো! Example: /ai তুমি কে?", event.threadID, event.messageID);
 }

 await sendTyping(api, event.threadID);

 const baseUrl = await mahmud();
 const res = await axios.post(`${baseUrl}/api/ai`, { question: query });

 const reply = formatReply(res.data.response || "× কোনো উত্তর পাওয়া যায়নি!");

 return api.sendMessage(reply, event.threadID, (err, info) => {
 if (!err) {
 global.client.handleReply.set(info.messageID, {
 name: module.exports.config.name,
 author: event.senderID
 });
 }
 }, event.messageID);

 } catch (err) {
 return api.sendMessage("× API Error: " + err.message, event.threadID);
 }
};

// 🔁 REPLY CONTINUE CHAT
module.exports.handleReply = async function ({ api, event, handleReply, args }) {
 if (event.senderID != handleReply.author) return;

 const prompt = args.join(" ");
 if (!prompt) return;

 await sendTyping(api, event.threadID);

 try {
 const baseUrl = await mahmud();
 const res = await axios.post(`${baseUrl}/api/ai`, { question: prompt });

 const reply = formatReply(res.data.response || "× কোনো উত্তর পাওয়া যায়নি!");

 return api.sendMessage(reply, event.threadID, (err, info) => {
 if (!err) {
 global.client.handleReply.set(info.messageID, {
 name: module.exports.config.name,
 author: event.senderID
 });
 }
 }, event.messageID);

 } catch (err) {
 return api.sendMessage("× API Error: " + err.message, event.threadID);
 }
};

// 🤖 AUTO CHAT (mention দিলে)
module.exports.handleEvent = async function ({ api, event }) {
 try {
 if (!event.body) return;

 // bot UID
 const botID = api.getCurrentUserID();

 // mention check
 if (!event.mentions || !event.mentions[botID]) return;

 const msg = event.body.replace(/@\S+/g, "").trim();
 if (!msg) return;

 await sendTyping(api, event.threadID);

 const baseUrl = await mahmud();
 const res = await axios.post(`${baseUrl}/api/ai`, { question: msg });

 const reply = formatReply(res.data.response || "× কোনো উত্তর পাওয়া যায়নি!");

 return api.sendMessage(reply, event.threadID, (err, info) => {
 if (!err) {
 global.client.handleReply.set(info.messageID, {
 name: module.exports.config.name,
 author: event.senderID
 });
 }
 });

 } catch (e) {
 console.log("AutoChat Error:", e.message);
 }
};
