const fs = require("fs");
const path = require("path");

module.exports.config = {
 name: "addadmin",
 version: "4.0.2",
 hasPermssion: 2,
 credits: "𝐌𝐑 𝐉𝐔𝐖𝐄𝐋",
 description: "বাংলা Ultimate Admin System (Add + Protect + Temp + Log)",
 commandCategory: "group",
 usages: "reply / @mention / UID / সময়",
 cooldowns: 5
};

// 📁 ডাটা ফাইল
const dataPath = path.join(__dirname, "adminData.json");

// 📥 ডাটা লোড
function loadData() {
 if (!fs.existsSync(dataPath)) return {};
 return JSON.parse(fs.readFileSync(dataPath));
}

// 💾 ডাটা সেভ
function saveData(data) {
 fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// ⏱️ সময় পার্স ফাংশন
function parseTime(timeStr) {
 if (!timeStr || typeof timeStr !== 'string') return null;
 
 // শুধু সংখ্যা চেক
 if (timeStr.match(/^\d+$/)) {
   return { duration: parseInt(timeStr) * 60 * 60 * 1000, display: `${timeStr} ঘন্টা` };
 }
 
 const unit = timeStr.slice(-1);
 const value = parseInt(timeStr.slice(0, -1));
 
 if (isNaN(value)) return null;
 
 switch(unit.toLowerCase()) {
   case 'm': return { duration: value * 60 * 1000, display: `${value} মিনিট` };
   case 'h': return { duration: value * 60 * 60 * 1000, display: `${value} ঘন্টা` };
   case 'd': return { duration: value * 24 * 60 * 60 * 1000, display: `${value} দিন` };
   default: return null;
 }
}

module.exports.run = async function ({ api, event, args, Users }) {
 const { threadID, messageID, mentions, messageReply } = event;
 const threadInfo = await api.getThreadInfo(threadID);
 const botID = api.getCurrentUserID();

 const data = loadData();
 if (!data[threadID]) data[threadID] = { owners: [], temps: {} };

 // ❌ বট admin না হলে
 if (!threadInfo.adminIDs.some(i => i.id == botID)) {
 return api.sendMessage(
`╔════════════════════╗
 ❌ 𝗘𝗥𝗥𝗢𝗥
╚════════════════════╝

🤖 আমি এই গ্রুপে Admin না!
👉 আগে আমাকে Admin বানাও`,
 threadID, messageID
 );
 }

 let targetID = null;
 let timeInfo = null;
 let argsIndex = 0;

 // 🎯 প্রথম আর্গুমেন্ট চেক করুন
 if (args.length > 0) {
   // চেক করুন এটি সময় কিনা (যেমন: 10m, 1h, 30m)
   const possibleTime = parseTime(args[0]);
   if (possibleTime) {
     timeInfo = possibleTime;
     argsIndex = 1;
   }
 }

 // ইউজার আইডি খুঁজুন
 if (messageReply) {
   targetID = messageReply.senderID;
 } else if (Object.keys(mentions).length > 0) {
   targetID = Object.keys(mentions)[0];
 } else if (args.length > argsIndex) {
   // চেক করুন args[argsIndex] UID কিনা
   if (args[argsIndex].match(/^\d+$/)) {
     targetID = args[argsIndex];
   } else {
     // যদি UID না হয়, তাহলে সময় চেক করুন
     const timeCheck = parseTime(args[argsIndex]);
     if (timeCheck) {
       timeInfo = timeCheck;
     }
   }
 }

 // যদি এখনও সময় পাওয়া না যায় এবং args এ সময় থাকতে পারে
 if (!timeInfo && args.length > 0) {
   for (let arg of args) {
     const check = parseTime(arg);
     if (check) {
       timeInfo = check;
       break;
     }
   }
 }

 // যদি টার্গেট না পাওয়া যায়
 if (!targetID) {
   return api.sendMessage(
`╔════════════════════╗
 ⚠️ ইউজার পাওয়া যায়নি
╚════════════════════╝

📌 ব্যবহার:
• রিপ্লাই + সময়: (রিপ্লাই) addadmin 10m
• মেনশন + সময়: addadmin @mention 1h
• UID + সময়: addadmin 123456789 30m
• শুধু রিপ্লাই: (রিপ্লাই) addadmin (স্থায়ী)`,
 threadID, messageID
   );
 }

 try {
 // ⚠️ Already admin
 if (threadInfo.adminIDs.some(i => i.id == targetID)) {
 return api.sendMessage(
`╔════════════════════╗
 ⚠️ আগে থেকেই Admin
╚════════════════════╝

👤 এই ইউজার আগে থেকেই Admin আছে`,
 threadID, messageID
 );
 }

 // 🚀 Admin বানানো
 await api.changeAdminStatus(threadID, targetID, true);

 const name = await Users.getNameUser(targetID);

 // 🔒 Owner save (স্থায়ী অ্যাডমিন হিসেবে সেভ)
 if (!data[threadID].owners.includes(targetID)) {
   data[threadID].owners.push(targetID);
 }

 // ⏱️ Temporary admin
 let timeDisplay = "🔒 স্থায়ী Admin";
 if (timeInfo) {
   const expire = Date.now() + timeInfo.duration;
   data[threadID].temps[targetID] = expire;
   timeDisplay = `⏱️ সময়: ${timeInfo.display}`;

   // টাইমার সেট করুন
   setTimeout(async () => {
     try {
       const newInfo = await api.getThreadInfo(threadID);
       if (newInfo.adminIDs.some(i => i.id == targetID)) {
         await api.changeAdminStatus(threadID, targetID, false);
         
         // টেম্প লিস্ট থেকে রিমুভ করুন
         const currentData = loadData();
         if (currentData[threadID] && currentData[threadID].temps) {
           delete currentData[threadID].temps[targetID];
           saveData(currentData);
         }
         
         api.sendMessage(
`⏱️ সময় শেষ!

👤 ${name} (${targetID}) এখন আর Admin নেই`,
         threadID
         );
       }
     } catch (e) {
       console.log("টাইমার এরর:", e);
     }
   }, timeInfo.duration);
 }

 saveData(data);

 // 📩 ইনবক্স নোটিফাই
 try {
   api.sendMessage(
`🎉 অভিনন্দন!

আপনাকে "${await api.getThreadInfo(threadID).then(i => i.name)}" গ্রুপে Admin বানানো হয়েছে ✅

${timeInfo ? `⏱️ সময়: ${timeInfo.display}` : "🔒 স্থায়ী Admin"}`,
   targetID
   );
 } catch(e) {}

 // 📊 লগ
 console.log(`[ADMIN LOG] ${event.senderID} -> ${targetID} (${timeInfo ? 'Temporary' : 'Permanent'})`);

 return api.sendMessage(
`╔════════════════════╗
 ✅ 𝗔𝗗𝗗 𝗔𝗗𝗠𝗜𝗡
╚════════════════════╝

👤 নাম: ${name}
🆔 UID: ${targetID}

${timeDisplay}

🛡️ Protected System চালু`,
 threadID,
 messageID
 );

 } catch (e) {
   console.error("Addadmin Error:", e);
   return api.sendMessage(
`╔════════════════════╗
 ❌ ব্যর্থ
╚════════════════════╝

⚠️ Admin করতে সমস্যা হয়েছে!
📌 এরর: ${e.message}`,
 threadID,
 messageID
 );
 }
};

// 🛡️ Protection System
module.exports.handleEvent = async function ({ api, event }) {
 const { threadID, logMessageType, logMessageData } = event;

 if (logMessageType !== "log:thread-admins") return;

 const data = loadData();
 if (!data[threadID]) return;

 const removed = logMessageData.ADMIN_EVENT == "remove_admin";
 const targetID = logMessageData.TARGET_ID;

 // 🔒 Protected admin remove হলে auto add
 if (removed && data[threadID].owners.includes(targetID)) {
 try {
   await api.changeAdminStatus(threadID, targetID, true);
   api.sendMessage(
`╔════════════════════╗
 🛡️ প্রোটেকশন চালু
╚════════════════════╝

❌ Protected Admin remove করা যাবে না!
✅ আবার Admin করে দেওয়া হয়েছে`,
   threadID
   );
 } catch (e) {
   console.log("Protection Error:", e);
 }
 }
};
