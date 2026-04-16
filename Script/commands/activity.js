const fs = require("fs");
const path = __dirname + "/cache/activity.json";

// ensure cache folder
if (!fs.existsSync(__dirname + "/cache")) {
 fs.mkdirSync(__dirname + "/cache");
}

// load data safely
let data = {};
if (fs.existsSync(path)) {
 try {
 data = JSON.parse(fs.readFileSync(path));
 } catch {
 data = {};
 }
}

const save = () => fs.writeFileSync(path, JSON.stringify(data, null, 2));

// time format
function formatTime(ms) {
 let d = Math.floor(ms / (1000 * 60 * 60 * 24));
 let h = Math.floor((ms / (1000 * 60 * 60)) % 24);
 let m = Math.floor((ms / (1000 * 60)) % 60);
 return `${d}d ${h}h ${m}m`;
}

module.exports.config = {
 name: "activity",
 version: "2.0.0",
 hasPermssion: 0,
 credits: "MR JUWEL x ChatGPT PRO",
 usePrefix: true,
 description: "Advanced Activity System",
 commandCategory: "group",
 usages: "[top/inactive/me]",
 cooldowns: 3
};

// 🔥 TRACK SYSTEM
module.exports.handleEvent = async function ({ event }) {
 if (!event.senderID) return;

 let uid = event.senderID;

 if (!data[uid]) {
 data[uid] = {
 total: 0,
 last: Date.now()
 };
 }

 data[uid].total++;
 data[uid].last = Date.now();

 save();
};

// 🔥 COMMAND
module.exports.run = async function ({ api, event }) {
 const { threadID, senderID, body } = event;

 let threadInfo = await api.getThreadInfo(threadID);
 let users = threadInfo.userInfo || [];
 let now = Date.now();

 let arr = users.map(u => {
 let d = data[u.id] || { total: 0, last: 0 };

 let inactiveTime = d.last ? now - d.last : Infinity;

 let status = "🔴 Offline";
 if (inactiveTime < 5 * 60 * 1000) status = "🟢 Online";
 else if (inactiveTime < 60 * 60 * 1000) status = "🟡 Active";

 return {
 uid: u.id,
 name: u.name,
 msg: d.total,
 inactive: formatTime(inactiveTime),
 status
 };
 });

 let args = body ? body.split(" ")[1] : null;

 // 🏆 AUTO TOP (default)
 if (!args || args === "top") {
 let sorted = arr.sort((a, b) => b.msg - a.msg).slice(0, 10);

 let msg = `╔═════✦🏆 TOP ACTIVE ✦═════╗\n\n`;

 sorted.forEach((u, i) => {
 let medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🔹";
 msg += `${medal} ${u.name}\n📊 ${u.msg} msgs | ${u.status}\n\n`;
 });

 return api.sendMessage(msg, threadID);
 }

 // ❄️ INACTIVE
 if (args === "inactive") {
 let list = arr.filter(u => u.msg > 0);

 let msg = `╔═════✦❄️ INACTIVE ✦═════╗\n\n`;

 list.sort((a, b) => b.inactive.localeCompare(a.inactive)).slice(0, 15).forEach((u, i) => {
 msg += `${i + 1}. ${u.name}\n🕒 ${u.inactive}\n\n`;
 });

 return api.sendMessage(msg, threadID);
 }

 // 👤 ME
 if (args === "me") {
 let me = arr.find(u => u.uid == senderID);

 if (!me) return api.sendMessage("No data found", threadID);

 return api.sendMessage(`╔═════✦👤 YOUR STATS ✦═════╗

📊 Messages: ${me.msg}
🕒 Last Active: ${me.inactive}
${me.status}

╚══════════════════════╝`, threadID);
 }

 // help
 return api.sendMessage(
 "📊 Activity Commands:\n.activity\n.activity top\n.activity inactive\n.activity me",
 threadID
 );
};
