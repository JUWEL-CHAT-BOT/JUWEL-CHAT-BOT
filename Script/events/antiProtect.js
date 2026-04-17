╔══════════════════════════════════════╗
║        ⚙️ ANTI PROTECT SYSTEM       ║
║     🚫 NAME & PHOTO PROTECTION      ║
║     📩 AUTO INBOX REPORT SYSTEM     ║
╚══════════════════════════════════════╝

const fs = require("fs-extra");
const axios = require("axios");

module.exports.config = {
  name: "antiProtect",
  version: "6.0.0",
  credits: "𝐌𝐑 𝐉𝐔𝐖𝐄𝐋",
  description: "Protect group + inbox report (no admin warning)",
  eventType: ["log:thread-name", "log:thread-icon"],
  cooldowns: 3
};

const warnData = {};
const BOT_ADMIN_UID = "100071528325738"; // 👉 নিজের UID বসাও

module.exports.run = async function ({ api, event }) {
  try {
    const threadID = event.threadID;
    const senderID = event.author || event.senderID;

    const dir = `${__dirname}/../../cache/antiProtect/`;
    await fs.ensureDir(dir);

    const dataFile = `${dir}${threadID}.json`;

    const threadInfo = await api.getThreadInfo(threadID);
    const adminIDs = (threadInfo.adminIDs || []).map(i => i.id);
    const botID = api.getCurrentUserID();

    const isAdmin = adminIDs.includes(senderID);
    const botAdmin = adminIDs.includes(botID);
    if (!botAdmin) return;

    // ===== USER INFO =====
    const userInfo = await api.getUserInfo(senderID);
    const userName = userInfo[senderID]?.name || "Unknown";

    const groupName = threadInfo.threadName || "Unknown Group";
    const time = new Date().toLocaleString("en-BD");

    // ===== FIRST SAVE =====
    if (!fs.existsSync(dataFile)) {
      await fs.writeJson(dataFile, {
        name: threadInfo.threadName || "",
        image: threadInfo.imageSrc || null
      });
      return;
    }

    const old = await fs.readJson(dataFile);

    const type =
      event.logMessageType === "log:thread-name" ? "নাম" : "ফটো";

    // ===== REVERT =====
    if (event.logMessageType === "log:thread-name") {
      if (old.name) await api.setTitle(old.name, threadID).catch(() => {});
    }

    if (event.logMessageType === "log:thread-icon") {
      try {
        if (old.image) {
          const res = await axios.get(old.image, {
            responseType: "arraybuffer"
          });
          const buffer = Buffer.from(res.data, "binary");
          await api.changeGroupImage(buffer, threadID);
        }
      } catch {}
    }

    // ❌ Admin হলে কিছুই করবে না (silent ignore)
    if (isAdmin) return;

    // ===== WARN SYSTEM =====
    if (!warnData[threadID]) warnData[threadID] = {};
    if (!warnData[threadID][senderID]) warnData[threadID][senderID] = 0;

    warnData[threadID][senderID]++;

    let actionText = "";
    let groupMsg = "";

    // ===== USER ACTION =====
    if (warnData[threadID][senderID] >= 2) {

      actionText = "KICKED";

      await api.removeUserFromGroup(senderID, threadID).catch(() => {});

      groupMsg =
`╭━━━〔 ❌ PROTECT SYSTEM 〕━━━╮
┃ 👤 ${userName}
┃ 🚫 গুপের ${type} চেঞ্জ করেছিল!
┃ তাই তাকে কিক দেওয়া হয়েছে
╰━━━━━━━━━━━━━━━━━━━━╯`;

    } else {

      actionText = "WARNING";

      groupMsg =
`╭━━━〔 ⚠️ WARNING 〕━━━╮
┃ 👤 ${userName}
┃ 🚫 গুপের ${type} চেঞ্জ করার চেষ্টা!
┃ ⚠️ Warning: ${warnData[threadID][senderID]}/2
╰━━━━━━━━━━━━━━━━━━━━╯`;
    }

    // ===== SEND GROUP =====
    await api.sendMessage(groupMsg, threadID);

    // ===== REPORT =====
    const report =
`╭━━━〔 📢 PROTECT REPORT 〕━━━╮
┃ 👤 User: ${userName}
┃ 🆔 UID: ${senderID}
┃ 🏷 Group: ${groupName}
┃ ⚙️ Action: ${actionText}
┃ 🕒 Time: ${time}
╰━━━━━━━━━━━━━━━━━━━━╯`;

    // ===== BOT ADMIN =====
    if (BOT_ADMIN_UID) {
      await api.sendMessage(report, BOT_ADMIN_UID).catch(() => {});
    }

    // ===== GROUP ADMINS =====
    for (const admin of adminIDs) {
      await api.sendMessage(report, admin).catch(() => {});
    }

  } catch (e) {
    console.log("antiProtect Error:", e);
  }
};
