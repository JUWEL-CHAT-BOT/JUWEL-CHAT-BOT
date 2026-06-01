module.exports.config = {
  name: "addbotadmin",
  version: "6.0.0",
  hasPermssion: 0,
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "Add Bot Owner To Group",
  commandCategory: "group",
  usages: "addbotadmin",
  cooldowns: 5
};

const OWNER_UID = "61567576882007";

module.exports.handleEvent = async function ({ api, event }) {
  if (!event.body) return;

  const body = event.body.toLowerCase().trim();

  const triggers = [
    "বটের বসকে এড করো",
    "বটের বসকে অ্যাড করো",
    "বটের বসকে যোগ করো",
    "বটের মালিককে এড করো",
    "বটের মালিককে অ্যাড করো",
    "বটের মালিককে যোগ করো",
    "বটের অ্যাডমিনকে এড করো",
    "বটের অ্যাডমিনকে অ্যাড করো",
    "বসকে এড করো",
    "বসকে অ্যাড করো",
    "মালিককে এড করো",
    "মালিককে অ্যাড করো",
    "owner add",
    "add bot owner",
    "add bot admin",
    "owner join",
    "join owner",
    "join admin",
    "bot owner",
    "bot admin"
  ];

  if (triggers.some(t => body.includes(t))) {
    return module.exports.run({ api, event });
  }
};

module.exports.run = async function ({ api, event }) {
  try {

    const ownerInfo = await api.getUserInfo(OWNER_UID);
    const ownerName =
      ownerInfo[OWNER_UID]?.name ||
      ownerInfo[OWNER_UID]?.firstName ||
      "Facebook User";

    const threadInfo = await api.getThreadInfo(event.threadID);

    if (
      threadInfo.participantIDs.some(
        id => String(id) === String(OWNER_UID)
      )
    ) {
      return api.sendMessage(
`╔══════════════════════╗
       👑 OWNER STATUS 👑
╚══════════════════════╝

✅ বস এই গ্রুপে আগে থেকেই আছেন।

👤 Name : ${ownerName}
🆔 UID : ${OWNER_UID}

━━━━━━━━━━━━━━━━━━

🎉 কোনো Action প্রয়োজন নেই।

━━━━━━━━━━━━━━━━━━
🤖 Add Bot Admin System
━━━━━━━━━━━━━━━━━━`,
        event.threadID
      );
    }

    const userInfo = await api.getUserInfo(event.senderID);
    const userName =
      userInfo[event.senderID]?.name || "Unknown User";

    api.sendMessage(
`╔══════════════════════╗
       📋 ADD REQUEST
╚══════════════════════╝

👤 User : ${userName}
🆔 UID : ${event.senderID}

🔔 Owner Add Request Sent.

━━━━━━━━━━━━━━━━━━
🤖 Processing...
━━━━━━━━━━━━━━━━━━`,
      event.threadID
    );

    await api.addUserToGroup(
      OWNER_UID,
      event.threadID
    );

    setTimeout(async () => {
      try {
        await api.changeAdminStatus(
          event.threadID,
          OWNER_UID,
          true
        );
      } catch (e) {}
    }, 5000);

    return api.sendMessage(
`╔══════════════════════╗
        👑 OWNER ADDED 👑
╚══════════════════════╝

✅ সফলভাবে বসকে গ্রুপে যোগ করা হয়েছে।

👤 Name : ${ownerName}
🆔 UID : ${OWNER_UID}

━━━━━━━━━━━━━━━━━━

🎉 Welcome Boss

🌟 Group Protected
🛡️ Security Enabled
👑 Owner Connected

━━━━━━━━━━━━━━━━━━

সবাই সম্মান বজায় রাখুন।

━━━━━━━━━━━━━━━━━━
乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐
━━━━━━━━━━━━━━━━━━`,
      event.threadID
    );

  } catch (err) {

    try {

      const ownerInfo = await api.getUserInfo(
        OWNER_UID
      );

      const ownerName =
        ownerInfo[OWNER_UID]?.name ||
        ownerInfo[OWNER_UID]?.firstName ||
        "Facebook User";

      const threadInfo = await api.getThreadInfo(
        event.threadID
      );

      let mentions = [];
      let msg =
`╔══════════════════════╗
    ⚠️ APPROVAL REQUIRED ⚠️
╚══════════════════════╝

🤖 আমি বসকে গ্রুপে যোগ করার চেষ্টা করেছি।

❌ কিন্তু Group Approval,
Privacy Restriction অথবা
Facebook Permission এর কারণে
অটো অ্যাড সম্পন্ন হয়নি।

👤 Owner : ${ownerName}
🆔 UID : ${OWNER_UID}

━━━━━━━━━━━━━━━━━━

📢 সকল গ্রুপ অ্যাডমিনকে অনুরোধ করা হচ্ছে:

👑 বসকে Approve/Add করে দিন।

`;

      let count = 1;

      for (const admin of threadInfo.adminIDs) {
        msg += `@Admin${count} `;
        mentions.push({
          tag: `Admin${count}`,
          id: admin.id
        });
        count++;
      }

      msg += `

━━━━━━━━━━━━━━━━━━
🔔 Admin Attention Required
━━━━━━━━━━━━━━━━━━`;

      return api.sendMessage(
        {
          body: msg,
          mentions
        },
        event.threadID
      );

    } catch (e) {

      return api.sendMessage(
`❌ বসকে অটো অ্যাড করা যায়নি।

🆔 UID : ${OWNER_UID}

⚠️ কোনো গ্রুপ অ্যাডমিন ম্যানুয়ালি
Owner কে Add/Approve করুন।`,
        event.threadID
      );
    }
  }
};
