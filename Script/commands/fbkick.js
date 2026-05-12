module.exports.config = {
  name: "fbkick",
  version: "9.0.0",
  hasPermission: 2,
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "Premium FB User Cleaner",
  commandCategory: "group",
  usages: "fbkick",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {

  const { threadID, messageID, senderID } = event;

  // ADMIN CHECK
  if (!global.config.ADMINBOT.includes(senderID)) {

    return api.sendMessage(
`╔━━❖ ❌ ACCESS DENIED ❖━━╗
┃
┃ শুধুমাত্র BOT ADMIN
┃ এই কমান্ড ব্যবহার করতে পারবে।
┃
╚━━━━━━━━━━━━━━━━━━╝`,
      threadID,
      messageID
    );
  }

  // THREAD INFO
  const threadInfo =
    await api.getThreadInfo(threadID);

  // BOT ADMIN CHECK
  const botAdmin =
    threadInfo.adminIDs.some(
      item =>
        item.id == api.getCurrentUserID()
    );

  if (!botAdmin) {

    return api.sendMessage(
`╔━━❖ ⚠️ BOT ADMIN REQUIRED ❖━━╗
┃
┃ আগে আমাকে গ্রুপ এডমিন বানান।
┃
╚━━━━━━━━━━━━━━━━━━╝`,
      threadID,
      messageID
    );
  }

  // FIND FB USERS
  const fbUsers =
    threadInfo.userInfo.filter(
      user => user.gender === undefined
    );

  // NO USER
  if (fbUsers.length === 0) {

    return api.sendMessage(
`╔━━❖ ✅ GROUP CLEAN ❖━━╗
┃
┃ কোনো Facebook User পাওয়া যায়নি 🌸
┃
╚━━━━━━━━━━━━━━━━━━╝`,
      threadID,
      messageID
    );
  }

  // START MESSAGE
  api.sendMessage(
`╔━━❖ 🇧🇩 FB CLEANER ❖━━╗
┃
┃ 👥 FB User Found : ${fbUsers.length}
┃
┃ ⚡ Cleaner Started...
┃ 🛡️ Please Wait...
┃
╚━━━━━━━━━━━━━━━━━━╝`,
    threadID
  );

  let success = 0;
  let failed = 0;

  // REMOVE USERS
  for (const user of fbUsers) {

    try {

      await api.removeUserFromGroup(
        user.id,
        threadID
      );

      success++;

    } catch (err) {

      failed++;

      console.log(err);
    }

    // DELAY
    await new Promise(resolve =>
      setTimeout(resolve, 1000)
    );
  }

  // FINAL RESULT
  return api.sendMessage(
`╔━━❖ ✅ CLEAN COMPLETE ❖━━╗
┃
┣━━━━━━━━━━━━━━━━━━
┃ 👥 Total FB Users : ${fbUsers.length}
┃
┃ ✅ Success Kick : ${success}
┃ ❌ Failed Kick : ${failed}
┃
┣━━━━━━━━━━━━━━━━━━
┃ 🛡️ Group Successfully Cleaned
┃ 🇧🇩 Bangladesh Security System
┃
╚━━❖ POWERED BY BOT ❖━━╝`,
    threadID,
    messageID
  );
};
