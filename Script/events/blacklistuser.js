module.exports.config = {
  name: "blacklistuser",
  eventType: ["log:subscribe"],
  version: "1.0.0",
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "Auto kick blacklisted users"
};

const fs = require("fs-extra");
const path = require("path");

const filePath = path.join(__dirname, "cache", "blacklist.json");

/* ===== LOAD ===== */
function load() {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath));
}

module.exports.run = async function ({ api, event, Threads }) {
  try {
    if (!event.logMessageData || !event.logMessageData.addedParticipants) return;

    const blacklist = load();
    if (blacklist.length === 0) return;

    const { threadID } = event;

    const threadInfo = await Threads.getInfo(threadID);
    const botID = api.getCurrentUserID();

    const isAdmin = threadInfo.adminIDs.some(e => e.id == botID);

    for (const user of event.logMessageData.addedParticipants) {
      if (blacklist.includes(user.userFbId)) {

        if (isAdmin) {
          await api.removeUserFromGroup(user.userFbId, threadID);

          return api.sendMessage(
`🚫 BLACKLIST USER DETECTED

👤 Name: ${user.fullName}
❌ Reason: Blacklisted user

⚡ Action: Auto Kick`,
            threadID
          );

        } else {
          return api.sendMessage(
`⚠️ BLACKLIST ALERT

👤 ${user.fullName} is blacklisted!
❌ But bot is not admin 😢`,
            threadID
          );
        }
      }
    }

  } catch (e) {
    console.log("Blacklist Error:", e);
  }
};
