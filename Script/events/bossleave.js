module.exports.config = {
    name: "bossleave",
    eventType: ["log:unsubscribe"],
    version: "1.0.0",
    credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
    description: "Leave group if boss is kicked"
};

module.exports.run = async function({ api, event, Users }) {
    try {
        const { threadID, logMessageData } = event;

        const OWNER_ID = "61567576882007";

        if (logMessageData.leftParticipantFbId == OWNER_ID) {

            const ownerName = await Users.getNameUser(OWNER_ID).catch(() => "আমার বস");

            const msg = `
╔══════════════════════╗
║      ⚠️ 𝐀𝐋𝐄𝐑𝐓 ⚠️      ║
╚══════════════════════╝

💔 ${ownerName} কে এই গ্রুপ থেকে কিক করা হয়েছে!

━━━━━━━━━━━━━━━━━━

😾 আমার বসকে অপমান করে
গ্রুপ থেকে বের করে দেওয়া হয়েছে।

👑 আমার বস যেখানে সম্মান পায় না,
সেখানে আমার থাকার কোনো কারণ নেই।

🚫 তাই আমিও এই গ্রুপ ত্যাগ করছি।

━━━━━━━━━━━━━━━━━━

🤖 𝐌𝐈𝐑𝐀𝐈 𝐁𝐎𝐓
👋 𝐆𝐎𝐎𝐃𝐁𝐘𝐄 𝐄𝐕𝐄𝐑𝐘𝐎𝐍𝐄

╭─────────────⭓
│ 😿 বিদায় বন্ধুদের
│ 💔 বস ছাড়া আমি একা
╰─────────────⭓
`;

            api.sendMessage(msg, threadID, () => {
                api.removeUserFromGroup(
                    api.getCurrentUserID(),
                    threadID
                );
            });
        }

    } catch (err) {
        console.log(err);
    }
};
