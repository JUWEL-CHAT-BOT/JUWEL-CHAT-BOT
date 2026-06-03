module.exports.config = {
    name: "bossleave",
    eventType: ["log:unsubscribe"],
    version: "5.0.0",
    credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
    description: "Leave group when boss is kicked"
};

module.exports.run = async function ({ api, event, Users }) {
    try {
        const { threadID, logMessageData } = event;

        const OWNER_ID = "61567576882007";

        const leftID = logMessageData.leftParticipantFbId;
        const authorID = logMessageData.author;

        // বস নিজে লিভ নিলে কিছু হবে না
        if (leftID != OWNER_ID || authorID == OWNER_ID) return;

        const ownerName = await Users.getNameUser(OWNER_ID)
            .catch(() => "আমার বস");

        const kickerName = await Users.getNameUser(authorID)
            .catch(() => "Unknown User");

        const threadInfo = await api.getThreadInfo(threadID)
            .catch(() => ({ threadName: "Unknown Group" }));

        const threadName = threadInfo.threadName || "Unknown Group";

        const mainMsg = `
╔══════════════════════════╗
║        ⚠️ 𝐁𝐎𝐒𝐒 𝐀𝐋𝐄𝐑𝐓 ⚠️
╚══════════════════════════╝

👑 বস: ${ownerName}
🆔 UID: ${OWNER_ID}

━━━━━━━━━━━━━━━━━━

🏠 গ্রুপ:
${threadName}

⚠️ কিককারী:
${kickerName}

🆔 UID:
${authorID}

━━━━━━━━━━━━━━━━━━

💔 আমার বসকে এই গ্রুপ থেকে
অপমান করে বের করে দেওয়া হয়েছে।

😾 আমার বস যেখানে সম্মান পায় না,
সেখানে আমার থাকার কোনো কারণ নেই।

🤖 তাই আমিও এই গ্রুপ ত্যাগ করছি...

━━━━━━━━━━━━━━━━━━
`;

        api.sendMessage(mainMsg, threadID, async () => {

            for (let i = 5; i >= 0; i--) {
                await new Promise(resolve => setTimeout(resolve, 1000));

                await api.sendMessage(
                    `⏳ ${i}...`,
                    threadID
                ).catch(() => {});
            }

            const byeMsg = `
╔════════════════════╗
║      👋 𝐆𝐎𝐎𝐃𝐁𝐘𝐄
╚════════════════════╝

💔 বস ছাড়া আমি একা

😿 বিদায় বন্ধুদের

🤖 ⎯꯭𓆩꯭𝆺𝅥😻⃞𝐑⃞𝐈⃞𝐘⃞𝐀⃞༢࿐ 𝐁𝐎𝐓

━━━━━━━━━━━━━━━━━━
👑 Respect The Boss
━━━━━━━━━━━━━━━━━━
`;

            api.sendMessage(byeMsg, threadID, () => {
                api.removeUserFromGroup(
                    api.getCurrentUserID(),
                    threadID
                );
            });
        });

    } catch (err) {
        console.log("[BOSSLEAVE ERROR]", err);
    }
};
