module.exports.config = {
  name: "blacklistuser",
  eventType: ["log:subscribe"],
  version: "2.0.0",
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "ব্ল্যাকলিস্ট ইউজার অটো কিক সিস্টেম"
};

const fs = require("fs-extra");
const path = require("path");

const filePath = path.join(__dirname, "cache", "blacklist.json");

/* ===== LOAD ===== */
function load() {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([]));
      return [];
    }
    return JSON.parse(fs.readFileSync(filePath));
  } catch (e) {
    console.log("Load Error:", e);
    return [];
  }
}

module.exports.run = async function ({ api, event, Threads }) {
  try {
    if (!event.logMessageData || !event.logMessageData.addedParticipants) return;

    const blacklist = load();
    if (!blacklist || blacklist.length === 0) return;

    const { threadID } = event;

    const threadInfo = await Threads.getInfo(threadID);
    const botID = api.getCurrentUserID();

    const isAdmin = threadInfo.adminIDs.some(e => e.id == botID);

    for (const user of event.logMessageData.addedParticipants) {
      if (blacklist.includes(user.userFbId)) {

        if (isAdmin) {
          try {
            await api.removeUserFromGroup(user.userFbId, threadID);

            await api.sendMessage(
`╔═══🚫 ব্ল্যাকলিস্ট ইউজার ধরা পড়েছে ═══╗
┃ 👤 নাম: ${user.fullName}
┃ 🆔 UID: ${user.userFbId}
┃ ❌ স্ট্যাটাস: ব্ল্যাকলিস্টেড
┃ ⚡ অ্যাকশন: অটো কিক
┃
┃ 📛 কারণ:
┃ তুই আমার বস 乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐ এর সাথে আর তার গুপে বাল"পাকনামি করার জন্য তোকে বস ব্লক"লিস্টে রাখছে তুই এই গুপে এড হতে পারবি না কিক খা 🥵🤌🤧🦵
╚════════════════════════╝`,
              threadID
            );

          } catch (err) {
            console.log("Kick Error:", err);
          }

        } else {
          await api.sendMessage(
`⚠️ ব্ল্যাকলিস্ট সতর্কতা

👤 ${user.fullName}
🆔 ${user.userFbId}

❌ এই ইউজার ব্ল্যাকলিস্টে আছে
😢 কিন্তু বট অ্যাডমিন না`,
            threadID
          );
        }
      }
    }

  } catch (e) {
    console.log("Blacklist Error:", e);
  }
};
