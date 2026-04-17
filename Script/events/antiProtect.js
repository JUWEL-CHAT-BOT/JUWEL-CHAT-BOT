const fs = require("fs-extra");
const axios = require("axios");

module.exports.config = {
  name: "antiProtect",
  version: "4.0.0",
  credits: "𝐌𝐑 𝐉𝐔𝐖𝐄𝐋",
  description: "Advanced group protection system",
  eventType: ["log:thread-name", "log:thread-icon"],
  cooldowns: 3
};

const warnDB = {};

function frame(text) {
  return `
╔══════════════════════╗
║   🔐 ANTI PROTECT    ║
╠══════════════════════╣
${text.split("\n").map(t => "║ " + t).join("\n")}
╚══════════════════════╝`;
}

module.exports.run = async function ({ api, event }) {
  try {
    const threadID = event.threadID;
    const senderID = event.author || event.senderID;

    const dir = `${__dirname}/../../cache/antiProtect/`;
    fs.ensureDirSync(dir);

    const file = `${dir}${threadID}.json`;
    const logFile = `${dir}log.json`;

    const threadInfo = await api.getThreadInfo(threadID);
    const adminIDs = (threadInfo.adminIDs || []).map(u => u.id);
    const botID = api.getCurrentUserID();

    if (!adminIDs.includes(botID)) return;

    if (!fs.existsSync(file)) {
      fs.writeJsonSync(file, {
        name: threadInfo.threadName || "",
        image: threadInfo.imageSrc || null
      }, { spaces: 2 });
      return;
    }

    const old = fs.readJsonSync(file);

    const isAdmin = adminIDs.includes(senderID);

    // snapshot update only admin/bot
    if (isAdmin || senderID === botID) {
      fs.writeJsonSync(file, {
        name: threadInfo.threadName,
        image: threadInfo.imageSrc
      }, { spaces: 2 });
      return;
    }

    // warning system init
    if (!warnDB[threadID]) warnDB[threadID] = {};
    if (!warnDB[threadID][senderID]) warnDB[threadID][senderID] = 0;

    const warnUser = () => {
      warnDB[threadID][senderID]++;

      const count = warnDB[threadID][senderID];

      if (count >= 2) {
        api.removeUserFromGroup(senderID, threadID);

        const log = fs.existsSync(logFile)
          ? fs.readJsonSync(logFile)
          : [];

        log.push({
          user: senderID,
          action: "KICK",
          reason: "AntiProtect violation"
        });

        fs.writeJsonSync(logFile, log, { spaces: 2 });

        api.sendMessage(
          frame(`🚫 USER KICKED\n👤 ID: ${senderID}\n⚠️ Reason: 2 warnings reached`),
          threadID
        );
      } else {
        api.sendMessage(
          frame(`⚠️ WARNING ${count}/2\n👤 User: ${senderID}\n🚨 Do not change group settings`),
          threadID
        );
      }
    };

    // NAME PROTECT
    if (event.logMessageType === "log:thread-name") {
      await api.setTitle(old.name, threadID).catch(() => {});
      warnUser();

      return api.sendMessage(
        frame(`🚫 NAME CHANGE BLOCKED\n♻️ Restored successfully`),
        threadID
      );
    }

    // IMAGE PROTECT
    if (event.logMessageType === "log:thread-icon") {
      try {
        if (old.image) {
          const res = await axios.get(old.image, { responseType: "arraybuffer" });
          const img = Buffer.from(res.data, "binary");
          await api.changeGroupImage(img, threadID);
        }
      } catch {}

      warnUser();

      return api.sendMessage(
        frame(`🚫 PHOTO CHANGE BLOCKED\n♻️ Restored successfully`),
        threadID
      );
    }

  } catch (e) {
    console.log("antiProtect Error:", e);
  }
};
