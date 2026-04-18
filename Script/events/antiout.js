module.exports.config = {
  name: "antiout",
  eventType: ["log:unsubscribe"],
  version: "3.0.0",
  credits: "𝐌𝐑 𝐉𝐔𝐖𝐄𝐋",
  description: "Antiout Savage Roast Level 2"
};

const leaveData = {};

function frame(msg) {
  return `
╔══════════════════════╗
   🚫  ANTI OUT SYSTEM
╠══════════════════════╣
${msg}
╚══════════════════════╝`;
}

module.exports.run = async function ({ event, api, Threads, Users }) {
  try {
    const { threadID } = event;
    const leftID = event.logMessageData.leftParticipantFbId;

    let data = (await Threads.getData(threadID)).data || {};
    if (data.antiout === false) return;

    if (leftID == api.getCurrentUserID()) return;

    let name = global.data.userName.get(leftID) || await Users.getNameUser(leftID);

    if (event.author != leftID) return;

    if (!leaveData[leftID]) {
      leaveData[leftID] = { count: 0, time: Date.now() };
    }

    let user = leaveData[leftID];

    if (Date.now() - user.time > 60 * 60 * 1000) {
      user.count = 0;
      user.time = Date.now();
    }

    user.count++;

    // ❌ BAN ZONE (3 times)
    if (user.count >= 3) {
      return api.sendMessage(frame(
`💀 আরে ${name}!!

😵 তুই তো দেখি “Group Ghost Simulator” খেলতেছোস!
👻 আসো → যাইসো → আবার আসো... সিরিয়াসলি?

😂 ১ ঘন্টায় ৩ বার লিভ মানে:
👉 তুই relationship না, buffering mode এ আছোস!

🚫 এখন থেকে তোকে আর এড করার টাইম নাই
🥱 “Not Eligible for Group Life” certified!
💀 RIP Social Stability 😏`
      ), threadID);
    }

    api.addUserToGroup(leftID, threadID, async (err) => {
      if (err) {
        return api.sendMessage(frame(
`🤡 ${name} disappeared again!

🧠 Theory:
👉 Bot block করছে না
👉 তুই নিজেই “privacy boss” হয়ে গেছোস

📵 WhatsApp: “access denied”
📩 Report ID: 100071528325738`
        ), threadID);
      }

      return api.sendMessage(frame(
`😏 ${name} আবার পালানোর চেষ্টা করলি?

😂 (${user.count}/3) বার attempt failed
🎯 Mission: “Escape Group” → FAILED

👑 তোর জন্য rule:
👉 Leave করলে vibe নষ্ট
👉 তাই তোকে বারবার ফিরায় আনা হচ্ছে

💀 বেশি try করলে “Professional Runner” tag দিবো 😎`
      ), threadID);
    });

  } catch (e) {
    console.log("AntiOut Error:", e);
  }
};
