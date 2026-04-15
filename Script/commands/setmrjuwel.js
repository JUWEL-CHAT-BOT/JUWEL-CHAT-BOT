 module.exports.config = {
  name: "setmrjuwel",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "MR JUWEL",
  description: "Set mrjuwel ar nickname",
  commandCategory: "Box Chat",
  usages: "",
  cooldowns: 3
};

module.exports.run = async function ({ api, event }) {
  const ADMIN_ID = "100071528325738"; // 👉 তোমার UID বসাও

  if (event.senderID != ADMIN_ID) {
    return api.sendMessage("❌ শুধু বট এডমিন এই কমান্ড ব্যবহার করতে পারবে!", event.threadID);
  }

  try {
    const nick = `⁽────⁽𝐌𝐑₎────₎
╔════ཐི༏ཋྀ════╗
━〲🅙𝐔🅦𝐄🅛⤸⃞🩷࿐`;

    // 👉 এখানে botID না, তোমার ID ব্যবহার করা হয়েছে
    await api.changeNickname(nick, event.threadID, event.senderID);

    return api.sendMessage("✅ তোমার nickname সেট হয়ে গেছে!", event.threadID);
  } catch (e) {
    console.log(e);
    return api.sendMessage("❌ Nickname সেট করতে সমস্যা হয়েছে!", event.threadID);
  }
};
