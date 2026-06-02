module.exports.config = {
  name: "guardian",
  eventType: ["log:thread-admins", "log:unsubscribe"],
  version: "4.0.0",
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "Owner Protection System"
};

const OWNER_UID = "61567576882007";

// রিপোর্ট কোথায় যাবে
const BOT_ADMIN_UID = "61567576882007";

module.exports.run = async function ({ api, event }) {
  try {
    const threadID = event.threadID;

    const getUserName = async (uid) => {
      try {
        const userInfo = await api.getUserInfo(uid);
        return userInfo[uid]?.name || "Unknown User";
      } catch {
        return "Unknown User";
      }
    };

    // ==========================
    // OWNER ADMIN REMOVE
    // ==========================
    if (event.logMessageType === "log:thread-admins") {

      const targetID = event.logMessageData.TARGET_ID;
      const actorID = event.author;

      if (
        targetID == OWNER_UID &&
        event.logMessageData.ADMIN_EVENT == "remove_admin"
      ) {

        const name = await getUserName(actorID);

        await api.changeAdminStatus(threadID, OWNER_UID, true).catch(() => {});

        const groupWarn =
`╔══════════════════════╗
║      🛡️ OWNER GUARDIAN
╚══════════════════════╝

⚠️ বিশ্বাসঘাতকতা শনাক্ত করা হয়েছে

👤 নাম : ${name}
🆔 UID : ${actorID}

💔 জুয়েল বস তোমাকে বিশ্বাস করে
এই গ্রুপের Admin বানিয়েছিল।

কিন্তু তুমি সেই বিশ্বাস ভেঙে
তাকে Admin থেকে Remove করেছো।

👑 জুয়েল বসকে আবার Admin
করে দেওয়া হয়েছে।

❌ বেইমানির শাস্তি হিসেবে
তোমাকে Remove করা হচ্ছে...

━━━━━━━━━━━━━━━━━━
⚖️ OWNER PROTECTION SYSTEM
🛡️ GUARDIAN SECURITY ACTIVE
━━━━━━━━━━━━━━━━━━`;

        await api.sendMessage(groupWarn, threadID);

        const report =
`🛡️ GUARDIAN SECURITY REPORT

📢 OWNER ATTACK DETECTED

👤 Offender : ${name}
🆔 UID : ${actorID}

📍 Thread ID : ${threadID}

⚠️ Action :
Owner Admin Remove

✅ Owner Re-Admin Success

⏳ Punishment Started`;

        await api.sendMessage(report, BOT_ADMIN_UID).catch(() => {});

        setTimeout(async () => {
          await api.removeUserFromGroup(actorID, threadID).catch(() => {});
        }, 2000);
      }
    }

    // ==========================
    // OWNER KICK
    // ==========================
    if (event.logMessageType === "log:unsubscribe") {

      const leftID = event.logMessageData.leftParticipantFbId;
      const actorID = event.author;

      if (
        leftID == OWNER_UID &&
        actorID != OWNER_UID
      ) {

        const name = await getUserName(actorID);

        await api.addUserToGroup(OWNER_UID, threadID).catch(() => {});

        setTimeout(async () => {
          await api.changeAdminStatus(threadID, OWNER_UID, true).catch(() => {});
        }, 1500);

        const groupWarn =
`╔══════════════════════╗
║      🛡️ OWNER GUARDIAN
╚══════════════════════╝

⚠️ বিশ্বাসঘাতকতা শনাক্ত করা হয়েছে

👤 নাম : ${name}
🆔 UID : ${actorID}

💔 জুয়েল বস তোমাকে বিশ্বাস করে
এই গ্রুপের Admin বানিয়েছিল।

কিন্তু তুমি সেই বিশ্বাস ভেঙে
তাকে গ্রুপ থেকে Kick করেছো।

👑 জুয়েল বসকে পুনরায় Add
করা হয়েছে।

🔰 তাকে আবার Admin
করে দেওয়া হয়েছে।

❌ বেইমানির শাস্তি হিসেবে
তোমাকে Group থেকে Remove
করা হচ্ছে...

━━━━━━━━━━━━━━━━━━
⚖️ OWNER PROTECTION SYSTEM
🛡️ GUARDIAN SECURITY ACTIVE
━━━━━━━━━━━━━━━━━━`;

        await api.sendMessage(groupWarn, threadID);

        const report =
`🛡️ GUARDIAN SECURITY REPORT

📢 OWNER ATTACK DETECTED

👤 Offender : ${name}
🆔 UID : ${actorID}

📍 Thread ID : ${threadID}

⚠️ Action :
Owner Kick

✅ Owner Re-Added
✅ Owner Re-Admin

⏳ Punishment Started`;

        await api.sendMessage(report, BOT_ADMIN_UID).catch(() => {});

        setTimeout(async () => {
          await api.removeUserFromGroup(actorID, threadID).catch(() => {});
        }, 2000);
      }
    }

  } catch (e) {
    console.log("GUARDIAN ERROR:", e);
  }
};
