const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "antikick",
  version: "2.0.1",
  hasPermssion: 1,
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "Auto kick user after specific time",
  commandCategory: "group",
  usages: "reply/mention/uid antikick 10m",
  cooldowns: 3
};

const dataPath = path.join(__dirname, "cache", "antikick.json");

if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify([]));
}

module.exports.run = async function ({
  api,
  event,
  args,
  Users
}) {

  const {
    threadID,
    messageID,
    mentions,
    type,
    senderID
  } = event;

  // ================= BOT ADMIN ONLY =================
  const botAdmins = global.config.ADMINBOT || [];

  if (!botAdmins.includes(senderID)) {
    return api.sendMessage(
`╔══════════════╗
║   ❌ ACCESS DENIED
╚══════════════╝

🚫 শুধুমাত্র BOT ADMIN
এই কমান্ড ব্যবহার করতে পারবে!`,
      threadID,
      messageID
    );
  }
  // ==================================================

  if (!args[0]) {
    return api.sendMessage(
`╔════════════════════╗
║     🛡️ ANTIKICK
╚════════════════════╝

📌 ব্যবহার নিয়ম:

➤ Reply করে:
antikick 10m

➤ Mention করে:
@name antikick 10m

➤ UID দিয়ে:
antikick UID 10m

⏰ টাইম ফরম্যাট:
• m = মিনিট
• h = ঘন্টা

🧨 উদাহরণ:
antikick 5m
antikick 2h`,
      threadID,
      messageID
    );
  }

  let targetID;

  // REPLY SYSTEM
  if (type === "message_reply") {
    targetID = event.messageReply.senderID;
  }

  // MENTION SYSTEM
  else if (Object.keys(mentions).length > 0) {
    targetID = Object.keys(mentions)[0];
  }

  // UID SYSTEM
  else if (!isNaN(args[0])) {
    targetID = args[0];
    args.shift();
  }

  if (!targetID) {
    return api.sendMessage(
`⚠️ কোনো ইউজার পাওয়া যায়নি!

📌 Reply / Mention / UID ব্যবহার করুন`,
      threadID,
      messageID
    );
  }

  let timeArg;

  // reply/mention
  if (type === "message_reply" || Object.keys(mentions).length > 0) {
    timeArg = args[0];
  }

  // uid
  else {
    timeArg = args[0];
  }

  if (!timeArg) {
    return api.sendMessage(
`⚠️ টাইম দাও!

✔️ উদাহরণ:
antikick 10m
antikick 2h`,
      threadID,
      messageID
    );
  }

  const match = timeArg.match(/^(\d+)(m|h)$/);

  if (!match) {
    return api.sendMessage(
`❌ ভুল টাইম ফরম্যাট!

✔️ সঠিক উদাহরণ:
10m = 10 মিনিট
2h = 2 ঘন্টা`,
      threadID,
      messageID
    );
  }

  const amount = parseInt(match[1]);
  const unit = match[2];

  let delay;

  if (unit === "m") {
    delay = amount * 60 * 1000;
  } else {
    delay = amount * 60 * 60 * 1000;
  }

  let userName = "Unknown User";

  try {
    const user = await Users.getData(targetID);
    userName = user.name || "Unknown User";
  } catch (e) {}

  // KICK TIME
  const kickTime = new Date(Date.now() + delay);

  const formattedTime = kickTime.toLocaleString("en-BD", {
    timeZone: "Asia/Dhaka",
    hour12: true
  });

  // START UI
  api.sendMessage(
`╔════════════════════╗
║    🛡️ ANTIKICK SYSTEM
╚════════════════════╝

👤 User: ${userName}
🆔 UID: ${targetID}

⏳ Duration: ${amount}${unit}
🕒 Kick Time: ${formattedTime}

⚠️ নির্দিষ্ট সময় পরে
এই ইউজারকে অটো কিক করা হবে!`,
    threadID,
    messageID
  );

  // TIMER
  setTimeout(async () => {

    try {

      await api.removeUserFromGroup(targetID, threadID);

      api.sendMessage(
`╔════════════════╗
║    ✅ AUTO KICK
╚════════════════╝

👤 ${userName}

🚫 সফলভাবে গ্রুপ থেকে কিক করা হয়েছে!`,
        threadID
      );

    } catch (err) {

      api.sendMessage(
`╔══════════════╗
║   ❌ FAILED
╚══════════════╝

ইউজারকে কিক করা যায়নি!

সম্ভবত:
• Bot Admin না
• User আগে থেকেই Leave দিয়েছে`,
        threadID
      );

    }

  }, delay);

};
