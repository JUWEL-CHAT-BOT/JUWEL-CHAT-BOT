const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "rules_data.json");

// 🔰 LOAD DATA
let lastSent = {};
if (fs.existsSync(dataPath)) {
  try {
    lastSent = JSON.parse(fs.readFileSync(dataPath));
  } catch (e) {
    lastSent = {};
  }
}

// 🔰 SAVE DATA
function saveData() {
  fs.writeFileSync(dataPath, JSON.stringify(lastSent, null, 2));
}

// 🔥 NEW FILE (scheduler memory - ADD ONLY)
const schedulePath = path.join(__dirname, "rules_schedule.json");
let scheduleData = {};
if (fs.existsSync(schedulePath)) {
  try {
    scheduleData = JSON.parse(fs.readFileSync(schedulePath));
  } catch {
    scheduleData = {};
  }
}
function saveSchedule() {
  fs.writeFileSync(schedulePath, JSON.stringify(scheduleData, null, 2));
}

// 🔥 SETTINGS FILE (PER GROUP CONTROL + ON/OFF + SILENT)
const settingsPath = path.join(__dirname, "rules_settings.json");

let settingsData = {};
if (fs.existsSync(settingsPath)) {
  try {
    settingsData = JSON.parse(fs.readFileSync(settingsPath));
  } catch {
    settingsData = {};
  }
}

function saveSettings() {
  fs.writeFileSync(settingsPath, JSON.stringify(settingsData, null, 2));
}

// 🔥 GET GROUP SETTINGS
function getSettings(threadID) {
  if (!settingsData[threadID]) {
    settingsData[threadID] = {
      auto: true,
      silent: false
    };
  }
  return settingsData[threadID];
}

module.exports.config = {
  name: "rules",
  version: "8.0.0",
  hasPermssion: 0,
  credits: "𝐌𝐑 𝐉𝐔𝐖𝐄𝐋",
  description: "Auto + Command rules with admin mention (Fixed)",
  commandCategory: "information",
  usages: "rules",
  cooldowns: 5
};

// 🔰 MESSAGE BUILDER (UNCHANGED)
async function buildMessage(api, event, Users) {
  const threadInfo = await api.getThreadInfo(event.threadID);
  const threadName = threadInfo.threadName || "Unknown Group";

  const adminIDs = threadInfo.adminIDs || [];

  let adminText = "";
  let mentions = [];

  for (let admin of adminIDs) {
    const uid = admin.id || admin;

    let name;
    try {
      name = await Users.getNameUser(uid);
    } catch {
      name = "Admin";
    }

    adminText += `➤ ${name}\n`;

    mentions.push({
      tag: name,
      id: uid
    });
  }

  // 🔰 BOT ADMIN
  const botAdminUID = "61567576882007";

  let botAdminName;
  try {
    botAdminName = await Users.getNameUser(botAdminUID);
  } catch {
    botAdminName = "𝐌𝐑 𝐉𝐔𝐖𝐄𝐋";
  }

  const msg = ` ╔══════════════════════╗
 🫡আসসালামু ওয়ালাইকুম আমাদের🙌🫂
 
     ${threadName}
     
     🎀🌷গুপের কিছু রুল্স আছে🫂♻️
 ╚══════════════════════╝

 ০১) আজেবাজে খারাপ কথা বলা যাবে না ⚠️
 ০২) কাউকে অপমান কিংবা গালাগালি করা যাবে না ⚠️🚫
 ০৩) অপ্রয়োজনীয় ট্যাগ / বারবার mention করা যাবে না 🚫
 ০৪) SEX নিয়ে কোনো কথা বলা যাবে না ⚠️🚫
 ০৫) অশ্লীল ছবি / ভিডিও / মিম দিলে সরাসরি কিক ⚡🚫
 ০৬) নিজের ইউটিউব / পেজ লিংক দিয়ে স্প্যাম করলে কিক 🚫
 ০৭) অ্যাডমিনদের সম্মান করতে হবে 🛡🌷
 ০৮) কোনো ধর্ম বা জাতি নিয়ে কটাক্ষ করা যাবে না 🚫
 ০৯) ভুয়া নিউজ / গুজব দিলে রিপোর্ট + ব্লক 🚫
 ১০) রাত ১২টার পর শুধু ভদ্র মজা, অশ্লীলতা নয় 🚫
 ১১) Meta AI এর সাথে গ্রুপে কথা বলা যাবে না 🚫
 ১২) অপরিচিত কাউকে ইনবক্সে ডাকবেন না 🚫
 ১৩) অপরিচিত কাউকে ফ্রেন্ড রিকুয়েস্ট দিবেন না 🚫
 ১৪) অন্য গ্রুপের লিংক দিলে কিক 🚫
 ১৫) আমাদের মেম্বারদের অন্য গ্রুপে এড করবেন না 🚫
 ১৬) ৩টার বেশি ইমোজি ব্যবহার করবেন না 🚫
 ১৭) গ্রুপের নাম / ফটো চেঞ্জ করলে কিক 🚫
 ১৮) বারবার থিম / গ্রুপ ইমোজি চেঞ্জ করলে কিক 🚫
 ১৯) ক্যাপশন বা ভিডিও পোস্ট করা যাবে না 🚫
 ২০) 18+ কোনো ইমোজি দেওয়া যাবে না 🚫
 ২১) আড্ডার সময় বটের সাথে কথা বলা যাবে না 🚫
 ২২) গালি দিলে অ্যাডমিনের ইনবক্সে জানাবেন 🚫
 ২৩) অন্য গ্রুপের বিষয় আলোচনা করবেন না 🚫
 ২৪) গ্রুপ ভালো না লাগলে লিভ নিতে পারবেন 🚫
 ২৫) 18+ নিকনেম ব্যবহার করা যাবে না 🚫
 ২৬) 18+ নামের আইডি এড করা যাবে না 🚫
 ২৭) কাউকে এড করলে তাকে নিয়ম জানাবেন 🚫
 ২৮) যারা নিয়ম মানে না তাদের এড করবেন না 🚫
 ২৯) কাউকে বিরক্ত করবেন না 🚫
 ৩০) অন্যের নিকনেম চেঞ্জ করবেন না 🚫
 ৩১) অন্যের নামে নিকনেম দিবেন না 🚫
 ৩২) SPAM করবেন না 🚫
 ৩৩) সমস্যা হলে অ্যাডমিনকে বলবেন 🚫
 ৩৪) গ্রুপে ঝগড়া করবেন না 🚫
 ৩৫) সবাই মিলেমিশে আড্ডা দিবেন 🌷😻
 ╚══════════════════════╝

 👑 BOT ADMIN: ${botAdminName}
 🔗 https://www.facebook.com/profile.php?id=${botAdminUID}

 ╔══════════════════════╗
 ☢️কোনো সমস্যা হলে সরাসরি
 👥 𝙰𝙳𝙼𝙸𝙽𝚂 দের 📥ইনবক্স করুন 💌

 👥 GROUP ADMINS:
 ${adminText}
 ╚══════════════════════╝

 ╔══════════════════════╗
 ❖ রুলস না মানলে আগে ⚠️ওয়ার্নিং,
 পরে অ্যাকশন 😈❌
 ╚══════════════════════╝`;

  return { msg, mentions };
}

// 🔰 COMMAND (BOT ADMIN ONLY CONTROL ADDED)
module.exports.run = async ({ api, event, Users }) => {

  const args = event.body ? event.body.split(" ") : [];
  const sub = args[1];

  const threadID = event.threadID;
  const senderID = event.senderID;
  const setting = getSettings(threadID);

  const botAdminUID = "61567576882007";

  // 🔒 PERMISSION CHECK
  if (["on","off","silent"].includes(sub) && senderID != botAdminUID) {
    return api.sendMessage("⛔ শুধু BOT ADMIN এই কমান্ড ব্যবহার করতে পারবে!", threadID, event.messageID);
  }

  if (sub === "on") {
    setting.auto = true;
    saveSettings();
    return api.sendMessage("✅ Auto Rules ON হয়েছে", threadID, event.messageID);
  }

  if (sub === "off") {
    setting.auto = false;
    saveSettings();
    return api.sendMessage("❌ Auto Rules OFF হয়েছে", threadID, event.messageID);
  }

  if (sub === "silent") {
    setting.silent = true;
    saveSettings();
    return api.sendMessage("🔕 Silent Mode ON (শুধু 4PM rules যাবে)", threadID, event.messageID);
  }

  const { msg, mentions } = await buildMessage(api, event, Users);

  return api.sendMessage({
    body: msg,
    mentions: mentions
  }, threadID, event.messageID);
};

// 🔰 AUTO SYSTEM (UNCHANGED + SETTINGS CHECK)
module.exports.handleEvent = async ({ api, event, Users }) => {
  try {
    if (!event.threadID) return;

    const hour = new Date().getHours();
    if (hour < 10 || hour > 20) return;

    const threadID = event.threadID;
    const setting = getSettings(threadID);

    if (!setting.auto) return;
    if (setting.silent) return;

    const today = new Date().toISOString().slice(0, 10);

    if (!lastSent[threadID]) {
      lastSent[threadID] = { date: today, count: 0 };
    }

    if (lastSent[threadID].date !== today) {
      lastSent[threadID] = { date: today, count: 0 };
    }

    if (scheduleData.lastRun === today) return;
    if (lastSent[threadID].count >= 1) return;

    const { msg, mentions } = await buildMessage(api, event, Users);

    api.sendMessage({
      body: msg,
      mentions: mentions
    }, threadID);

    lastSent[threadID].count += 1;
    saveData();

  } catch (e) {
    console.log("RULES AUTO ERROR:", e);
  }
};

// 🔥 ORIGINAL SCHEDULER + FIX
let lastRun = 0;

setInterval(async () => {
  try {
    const now = new Date();

    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();

    const today = now.toISOString().slice(0, 10);

    if (hour === 16 && minute === 0 && second === 0) {

      if (scheduleData.lastRun === today) return;

      if (Date.now() - lastRun < 60000) return;
      lastRun = Date.now();

      scheduleData.lastRun = today;
      saveSchedule();

      const allThreads = global.data.allThreadID || [];

      for (const threadID of allThreads) {

        const setting = getSettings(threadID);
        if (!setting.auto) continue;

        try {
          const { msg, mentions } = await buildMessage(global.api, {
            threadID: threadID
          }, global.Users);

          global.api.sendMessage({
            body: msg,
            mentions: mentions
          }, threadID);

        } catch (e) {}
      }
    }

  } catch (err) {
    console.log("AUTO RULES SCHEDULER ERROR:", err);
  }
}, 1000);
