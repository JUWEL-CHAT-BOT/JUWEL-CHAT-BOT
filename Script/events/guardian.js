module.exports.config = {
  name: "guardian",
  eventType: ["log:thread-admins", "log:unsubscribe"],
  version: "3.1.0",
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "Owner Protection System"
};

const OWNER_UID = "61567576882007";

module.exports.run = async function ({ api, event, Users }) {
  try {
    const threadID = event.threadID;

    // ==========================
    // ADMIN REMOVE
    // ==========================
    if (event.logMessageType == "log:thread-admins") {

      const targetID = event.logMessageData.TARGET_ID;
      const actorID = event.author;

      if (
        targetID == OWNER_UID &&
        event.logMessageData.ADMIN_EVENT == "remove_admin"
      ) {

        await api.changeAdminStatus(threadID, OWNER_UID, true);

        let name = await Users.getNameUser(actorID).catch(() => "Unknown User");

        await api.sendMessage(
`🛡️ OWNER PROTECT

⚠️ ${name}

আমার বসকে Admin থেকে Remove করেছিস।

👑 বসকে আবার Admin করা হয়েছে।
⏳ এখন ব্যবস্থা নেওয়া হচ্ছে...`,
          threadID
        );

        setTimeout(async () => {
          await api.removeUserFromGroup(actorID, threadID).catch(() => {});
        }, 2000);
      }
    }

    // ==========================
    // OWNER KICK
    // ==========================
    if (event.logMessageType == "log:unsubscribe") {

      const leftID = event.logMessageData.leftParticipantFbId;
      const actorID = event.author;

      if (
        leftID == OWNER_UID &&
        actorID != OWNER_UID
      ) {

        await api.addUserToGroup(OWNER_UID, threadID).catch(() => {});
        await api.changeAdminStatus(threadID, OWNER_UID, true).catch(() => {});

        let name = await Users.getNameUser(actorID).catch(() => "Unknown User");

        await api.sendMessage(
`🛡️ OWNER PROTECT

⚠️ ${name}

আমার বসকে গ্রুপ থেকে Kick করেছিস।

👑 বসকে আবার Add + Admin করা হয়েছে।
⏳ ব্যবস্থা নেওয়া হচ্ছে...`,
          threadID
        );

        setTimeout(async () => {
          await api.removeUserFromGroup(actorID, threadID).catch(() => {});
        }, 2000);
      }
    }

  } catch (err) {
    console.log(err);
  }
};
