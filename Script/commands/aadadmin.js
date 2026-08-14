const fs = require("fs");
const path = require("path");

module.exports.config = {
 name: "addadmin",
 version: "4.0.1",
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
 if (!timeStr) return null;
 
 const unit = timeStr.slice(-1);
 const value = parseInt(timeStr.slice(0, -1));
 
 if (isNaN(value)) return null;
 
 switch(unit) {
   case 'm': return value * 60 * 1000; // মিনিট
   case 'h': return value * 60 * 60 * 1000; // ঘন্টা
   case 'd': return value * 24 * 60 * 60 * 1000; // দিন
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

 let targetID;
 let timeDuration = null;
 let timeDisplay = "🔒 স্থায়ী Admin";

 // 🎯 ইউজার সিলেক্ট
 if (messageReply) targetID = messageReply.senderID;
 else if (Object.keys(mentions).length > 0) targetID = Object.keys(mentions)[0];
 else if (args[0]) {
   // চেক করুন args[0] এ UID আছে নাকি সময়
   if (args[0].match(/^\d+$/)) {
     targetID = args[0];
     if (args[1]) {
       const parsed = parseTime(args[1]);
       if (parsed !== null) {
         timeDuration = parsed;
         timeDisplay = `⏱️ সময়: ${args[1]}`;
       }
     }
   } else {
     // সময় দেওয়া থাকলে
     const parsed = parseTime(args[0]);
     if (parsed !== null) {
       timeDuration = parsed;
       timeDisplay = `⏱️ সময়: ${args[0]}`;
       // যদি শুধু সময় দেওয়া হয়, তাহলে রিপ্লাই করা ইউজারকে নিবে
       if (messageReply) {
         targetID = messageReply.senderID;
       } else {
         return api.sendMessage(
`╔════════════════════╗
 ⚠️ ইউজার পাওয়া যায়নি
╚════════════════════╝

📌 কাউকে Reply / Mention / UID সহ সময় দিন`,
 threadID, messageID
         );
       }
     } else {
       targetID = args[0];
     }
   }
 } else {
 return api.sendMessage(
`╔════════════════════╗
 ⚠️ ইউজার পাওয়া যায়নি
╚════════════════════╝

📌 কাউকে Reply / Mention / UID + সময় দিন
📝 উদাহরণ: addadmin 10m (রিপ্লাই করে)
📝 উদাহরণ: addadmin @mention 1h
📝 উদাহরণ: addadmin 123456789 30m`,
 threadID, messageID
 );
 }

 // চেক করুন targetID পাওয়া গেছে কিনা
 if (!targetID) {
   return api.sendMessage(
`╔════════════════════╗
 ⚠️ ইনভ্যালিড ইউজার
╚════════════════════╝

📌 সঠিক UID বা Mention দিন`,
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
 if (timeDuration !== null) {
   const expire = Date.now() + timeDuration;
   data[threadID].temps[targetID] = expire;

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
   }, timeDuration);
 }

 saveData(data);

 // 📩 ইনবক্স নোটিফাই
 try {
   api.sendMessage(
`🎉 অভিনন্দন!

আপনাকে "${await api.getThreadInfo(threadID).then(i => i.name)}" গ্রুপে Admin বানানো হয়েছে ✅

${timeDuration !== null ? `⏱️ সময়: ${args[0] || args[1]}` : "🔒 স্থায়ী Admin"}`,
   targetID
   );
 } catch(e) {}

 // 📊 লগ
 console.log(`[ADMIN LOG] ${event.senderID} -> ${targetID} (${timeDuration !== null ? 'Temporary' : 'Permanent'})`);

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
