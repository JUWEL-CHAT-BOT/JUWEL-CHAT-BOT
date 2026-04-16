const chalk = require("chalk");
const fs = require("fs");

const logFile = __dirname + "/joinHistory.json";

// ensure log file
if (!fs.existsSync(logFile)) fs.writeFileSync(logFile, "[]");

function saveLog(data) {
 fs.writeFileSync(logFile, JSON.stringify(data, null, 2));
}

function addLog(entry) {
 let data = JSON.parse(fs.readFileSync(logFile));
 data.push(entry);
 saveLog(data);
}

module.exports.config = {
 name: "join",
 version: "3.0.0",
 hasPermssion: 2,
 credits: "MR JUWEL (Advanced v3)",
 description: "Advanced Join System with retry, fallback, auto mode & logs",
 commandCategory: "system",
 cooldowns: 5
};

let autoMode = false;

module.exports.onLoad = () => {
 console.log(chalk.bold.hex("#00c300")(" JOIN SYSTEM v3 LOADED 🚀"));
};

// ---------------- HANDLE REPLY ----------------
module.exports.handleReply = async function ({ api, event, handleReply, Threads }) {
 const { threadID, senderID, body } = event;
 const { ID, author } = handleReply;

 if (senderID != author) return;

 const input = (body || "").trim().toLowerCase();
 let selected = [];

 if (input === "add all") {
 selected = ID.map((_, i) => i);
 } else {
 selected = input.split(/\s+/)
  .map(x => parseInt(x) - 1)
  .filter(i => !isNaN(i) && i >= 0 && i < ID.length);
 }

 if (selected.length === 0)
  return api.sendMessage("❌ Invalid input", threadID);

 let result = {
  added: 0,
  failed: 0,
  retry: 0,
  details: []
 };

 for (const i of selected) {
 const tid = ID[i];

 let success = false;

 // 🔄 RETRY SYSTEM (3 times)
 for (let r = 0; r < 3; r++) {
 try {
 await api.addUserToGroup(senderID, tid);
 success = true;
 result.retry += r;
 break;
 } catch (e) {
 await new Promise(res => setTimeout(res, 800));
 }
 }

 if (!success) {
 result.failed++;

 // 🔗 Fallback: try invite link
 try {
 const info = await Threads.getInfo(tid);
 const link = info.inviteLink || "No invite link found";
 api.sendMessage(`🔗 Join manually: ${link}`, threadID);
 } catch {}
 }

 // log + UI
 try {
 const info = await Threads.getInfo(tid);

 const status = success ? "✅ Joined" : "❌ Failed";

 result.details.push(`${status} → ${info.threadName}`);

 addLog({
 user: senderID,
 threadID: tid,
 name: info.threadName,
 status,
 time: new Date().toISOString()
 });

 } catch {}
 }

 // 📊 REPORT UI (THEME)
 return api.sendMessage(
 `╔═════════════╗
║ 🔰 JOIN REPORT  
╠══════════════╣
║ ✅ Added: ${result.added}
║ ❌ Failed: ${result.failed}
║ 🔄 Retry used: ${result.retry}
╚══════════════╝

📌 Details:
${result.details.join("\n")}

⚡ Mode: ${autoMode ? "AUTO ON" : "MANUAL"}`,
 threadID
 );
};

// ---------------- MAIN RUN ----------------
module.exports.run = async function ({ api, event, Threads }) {
 const { threadID, senderID, messageID } = event;

 const allThreads = await Threads.getAll();

 let msg = "╔════════════════════╗\n║ 🔰 GROUP LIST v3 ║\n╚════════════════════╝\n\n";
 const ID = [];

 allThreads.forEach((t, i) => {
 msg += `${i + 1}. ${t.threadInfo.threadName}\n`;
 ID.push(t.threadID);
 });

 msg += `\n✏️ Reply numbers / add all\n`;
 msg += `⚡ Type "auto on" / "auto off"\n`;

 return api.sendMessage(msg, threadID, (err, info) => {
 if (!err) {
 global.client.handleReply.push({
 name: module.exports.config.name,
 author: senderID,
 messageID: info.messageID,
 ID
 });
 }
 }, messageID);
};

// ---------------- AUTO MODE SUPPORT ----------------
module.exports.handleEvent = async function ({ api, event }) {
 const body = (event.body || "").toLowerCase();

 if (body === "auto on") {
 autoMode = true;
 return api.sendMessage("⚡ Auto Join Mode ENABLED", event.threadID);
 }

 if (body === "auto off") {
 autoMode = false;
 return api.sendMessage("⚡ Auto Join Mode DISABLED", event.threadID);
 }
};
