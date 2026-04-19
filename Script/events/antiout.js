module.exports.config = {
  name: "antiout",
  eventType: ["log:unsubscribe"],
  version: "2.1.0",
  credits: "𝐌𝐑 𝐉𝐔𝐖𝐄𝐋",
  description: "Anti leave funny limit system"
};

const leaveData = {};

function frame(msg) {
  return `
   ╔══════════════════╗   
   ☢️ ANTI OUT SYSTEM⚠️   
   ╠══════════════════╣   
   ${msg}   
   ╚══════════════════╝`;
}

module.exports.run = async function ({ event, api, Threads, Users }) {
  try {
    const { threadID } = event;
    const leftID = event.logMessageData.leftParticipantFbId;

    let data = (await Threads.getData(threadID)).data || {};
    if (data.antiout === false) return;

    if (leftID == api.getCurrentUserID()) return;

    let name =
      global.data.userName.get(String(leftID)) ||
      await Users.getNameUser(leftID.toString());

    if (event.author != leftID) return;

    if (!leaveData[leftID]) {
      leaveData[leftID] = {
        count: 0,
        time: Date.now()
      };
    }

    let user = leaveData[leftID];

    if (Date.now() - user.time > 60 * 60 * 1000) {
      user.count = 0;
      user.time = Date.now();
    }

    user.count++;

    // ❌ limit reached
    if (user.count >= 3) {

      let msg = frame(`
😂 আরে ${name}!!

🆔 UID: ${leftID}

😴 তুই কি লিভ দেওয়ার কম্পিটিশন করতেছোস নাকি? 🏆
১ ঘন্টায় ৩ বার লিভ = Disqualified!

🚫 তোকে আর গুপে এড করলাম না তুই 🐸
এই গুপে থাকার যোগ্য না🥵💦!
🥵 বিদায় লুচ্চা 🫂🫦`);

      api.sendMessage(msg, threadID);

      // ✅ ADMIN FORWARD
      try {
        const time = new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" });
        let threadInfo = await Threads.getInfo(threadID);
        let threadName = threadInfo.threadName || "Unknown Group";

        let adminMsg = `
🚨 ANTI OUT ALERT 🚨

👤 Name: ${name}
🆔 UID: ${leftID}

🏷️ Group: ${threadName}
🕒 Time: ${time}

⚠️ User reached leave limit!
`;

        const adminUIDs = ["61567576882007", "100071528325738"];

        for (let admin of adminUIDs) {
          api.sendMessage(adminMsg, admin);
        }

      } catch (e) {
        console.log("Forward Error:", e);
      }

      return;
    }

    api.addUserToGroup(leftID, threadID, async (err) => {
      if (err) {

        let msg = frame(`
😆 ${name} এরে এড করতে গেলাম ও'মা😴

🆔 UID: ${leftID}

সে তো ভয় পাইছে 😵
🤖 Bot ব্লক করছে 📵
বা privacy tight করে রাখছে

📩 রিপোর্ট আইডি: 100071528325738`);

        api.sendMessage(msg, threadID);

        // ✅ ADMIN FORWARD
        try {
          const time = new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" });
          let threadInfo = await Threads.getInfo(threadID);
          let threadName = threadInfo.threadName || "Unknown Group";

          let adminMsg = `
🚨 ANTI OUT ALERT 🚨

👤 Name: ${name}
🆔 UID: ${leftID}

🏷️ Group: ${threadName}
🕒 Time: ${time}

⚠️ Failed to re-add user!
`;

          const adminUIDs = ["61567576882007", "100071528325738"];

          for (let admin of adminUIDs) {
            api.sendMessage(adminMsg, admin);
          }

        } catch (e) {
          console.log("Forward Error:", e);
        }

        return;
      }

      let msg = frame(`
😏 ওহ ${name} আবার পালাইছোস?

🆔 UID: ${leftID}

😂 (${user.count}/3) বার ধরা পড়ছোস 🔁
তোকে আবার টেনে আনা হইলো

😒🤌 এটা কোনো সাধারণ গ্রুপ নয় লা👻 এ হলো
গ্যাংস্টারদের গুপ লা😝এখান থেকে লিভ নিতে হলে
এডমিন পারমিশন লাগবে লা🤧😂`);

      api.sendMessage(msg, threadID);

      // ✅ ADMIN FORWARD
      try {
        const time = new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" });
        let threadInfo = await Threads.getInfo(threadID);
        let threadName = threadInfo.threadName || "Unknown Group";

        let adminMsg = `
🚨 ANTI OUT ALERT 🚨

👤 Name: ${name}
🆔 UID: ${leftID}

🏷️ Group: ${threadName}
🕒 Time: ${time}

⚠️ User left & was re-added!
`;

        const adminUIDs = ["61567576882007", "100071528325738"];

        for (let admin of adminUIDs) {
          api.sendMessage(adminMsg, admin);
        }

      } catch (e) {
        console.log("Forward Error:", e);
      }

    });

  } catch (e) {
    console.log("AntiOut Error:", e);
  }
};
