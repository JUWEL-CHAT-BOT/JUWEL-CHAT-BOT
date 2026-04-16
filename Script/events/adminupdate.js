module.exports.config = {
    name: "adminUpdate",
    eventType: [
        "log:thread-admins",
        "log:thread-name",
        "log:user-nickname",
        "log:thread-icon",
        "log:thread-call",
        "log:thread-color",
        "log:thread-image" // ✅ ADD FIX
    ],
    version: "5.0.1",
    credits: "MR JUWEL",
    description: "Update team info with 20+ random stylish themes",
    envConfig: {
        sendNoti: true,
    }
};

module.exports.run = async function ({ event, api, Threads, Users }) {
    const fs = require("fs");
    const themePath = __dirname + "/themes.json";

    if (!fs.existsSync(themePath)) {
        fs.writeFileSync(themePath, JSON.stringify({
            rainbow: { top: "🌈━━━━━━━━━━━━━━━🌈", title: "🔰  𝗨𝗣𝗗𝗔𝗧𝗘", bottom: "🌈━━━━━━━━━━━━━━━🌈", icon: "🌈" },
            red: { top: "🔥━━━━━━━━━━━━━━━🔥", title: "⚡  𝗨𝗣𝗗𝗔𝗧𝗘", bottom: "🔥━━━━━━━━━━━━━━━🔥", icon: "🔥" },
            blue: { top: "🌊━━━━━━━━━━━━━━━🌊", title: "🌊  𝗨𝗣𝗗𝗔𝗧𝗘", bottom: "🌊━━━━━━━━━━━━━━━🌊", icon: "🌊" },
            pink: { top: "🌷━━━━━━━━━━━━━━━🌷", title: "🎉  𝗨𝗣𝗗𝗔𝗧𝗘", bottom: "🌷━━━━━━━━━━━━━━━🌷", icon: "🌷" },
            gold: { top: "⚡━━━━━━━━━━━━━━━⚡", title: "👑  𝗨𝗣𝗗𝗔𝗧𝗘", bottom: "⚡━━━━━━━━━━━━━━━⚡", icon: "⚡" },
            neon: { top: "🪩━━━━━━━━━━━━━━━🪩", title: "🎇  𝗡𝗘𝗢𝗡", bottom: "🪩━━━━━━━━━━━━━━━🪩", icon: "🪩" },
            cyber: { top: "🤖━━━━━━━━━━━━━━━🤖", title: "⚙️  𝗖𝗬𝗕𝗘𝗥", bottom: "🤖━━━━━━━━━━━━━━━🤖", icon: "🤖" },
            diamond: { top: "💎━━━━━━━━━━━━━━━💎", title: "🎆  𝗗𝗜𝗔𝗠𝗢𝗡𝗗", bottom: "💎━━━━━━━━━━━━━━━💎", icon: "💎" },
            galaxy: { top: "🌌━━━━━━━━━━━━━━━🌌", title: "🌩️  𝗚𝗔𝗟𝗔𝗫𝗬", bottom: "🌌━━━━━━━━━━━━━━━🌌", icon: "🌌" },
            king: { top: "👑━━━━━━━━━━━━━━━👑", title: "☢️  𝗞𝗜𝗡𝗚", bottom: "👑━━━━━━━━━━━━━━━👑", icon: "👑" }
        }, null, 2));
    }

    let themes = JSON.parse(fs.readFileSync(themePath));

    function getRandomTheme() {
        const keys = Object.keys(themes);
        return themes[keys[Math.floor(Math.random() * keys.length)]];
    }

    async function mentionUser(id) {
        const name = await Users.getNameUser(id);
        return {
            text: `✨ ${name} ✨`,
            mentions: [{ tag: name, id }]
        };
    }

    const { threadID, logMessageType, logMessageData } = event;

    let threadData = (await Threads.getData(threadID)) || {};
    if (!threadData.threadInfo) threadData.threadInfo = {};

    let dataThread = threadData.threadInfo;

    dataThread.adminIDs = dataThread.adminIDs || [];
    dataThread.nicknames = dataThread.nicknames || {};
    dataThread.threadName = dataThread.threadName || "";
    dataThread.threadIcon = dataThread.threadIcon || "";
    dataThread.threadColor = dataThread.threadColor || "";

    try {
        switch (logMessageType) {

            // ✅ ADMIN FIX
            case "log:thread-admins": {
                const t = getRandomTheme();

                if (logMessageData.ADMIN_EVENT == "add_admin" || logMessageData.admin_event == "add_admin") {

                    if (!dataThread.adminIDs.some(a => a.id == logMessageData.TARGET_ID)) {
                        dataThread.adminIDs.push({ id: logMessageData.TARGET_ID });
                    }

                    const m = await mentionUser(logMessageData.TARGET_ID);

                    api.sendMessage(
`${t.top}
${t.title} | 👑 𝗔𝗱𝗺𝗶𝗻
${t.bottom}
👤 ${m.text}
🎉 তাকে Admin করা হয়েছে ☢️⚡
`, threadID, { mentions: m.mentions });

                } else if (logMessageData.ADMIN_EVENT == "remove_admin" || logMessageData.admin_event == "remove_admin") {

                    dataThread.adminIDs = dataThread.adminIDs.filter(
                        item => item.id && item.id != logMessageData.TARGET_ID
                    );

                    const m = await mentionUser(logMessageData.TARGET_ID);

                    api.sendMessage(
`${t.top}
${t.title} | 👑 𝗔𝗱𝗺𝗶𝗻
${t.bottom}
👤 ${m.text}
❌ তার Admin রোল মুছে ফেলা হয়েছে ⚡🔥
`, threadID, { mentions: m.mentions });
                }
                break;
            }

            // ✅ GROUP PHOTO FIX
            case "log:thread-image": {
                const t = getRandomTheme();

                api.sendMessage(
`${t.top}
${t.title} | 🖼️ 𝗣𝗵𝗼𝘁𝗼
${t.bottom}
🖼️ গ্রুপ ফটো পরিবর্তন করা হয়েছে 🎆🎇
`, threadID);
                break;
            }

            case "log:thread-icon": {
                const t = getRandomTheme();

                dataThread.threadIcon =
                    logMessageData.thread_icon ||
                    logMessageData.threadIcon ||
                    "👍";

                api.sendMessage(
`${t.top}
${t.title} | 🎭 𝗜𝗰𝗼𝗻
${t.bottom}
🆕 নতুন Icon: ${dataThread.threadIcon} 🌈
`, threadID);
                break;
            }

            case "log:thread-call": {
                const t = getRandomTheme();

                if (logMessageData.event === "group_call_started") {

                    const m = await mentionUser(logMessageData.caller_id);

                    api.sendMessage(
`${t.top}
${t.title} | 📞 𝗖𝗮𝗹𝗹
${t.bottom}
👤 ${m.text}
▶️ কল শুরু হয়েছে ⚡🌩️
`, threadID, { mentions: m.mentions });

                } else if (logMessageData.event === "group_call_ended") {

                    const callDuration = logMessageData.call_duration || 0;

                    const hours = Math.floor(callDuration / 3600);
                    const minutes = Math.floor((callDuration % 3600) / 60);
                    const seconds = callDuration % 60;

                    const timeFormat = `${hours}h ${minutes}m ${seconds}s`;

                    api.sendMessage(
`${t.top}
${t.title} | 📞 𝗖𝗮𝗹𝗹
${t.bottom}
📴 কল শেষ হয়েছে 🎇
⏳ সময়কাল: ${timeFormat}
`, threadID);

                } else if (logMessageData.joining_user) {

                    const m = await mentionUser(logMessageData.joining_user);

                    api.sendMessage(
`${t.top}
${t.title} | 📞 𝗖𝗮𝗹𝗹
${t.bottom}
✨ ${m.text} Call এ যোগ দিয়েছে 🪩
`, threadID, { mentions: m.mentions });
                }
                break;
            }

            case "log:thread-color": {
                const t = getRandomTheme();

                dataThread.threadColor =
                    logMessageData.thread_color ||
                    "🌤";

                api.sendMessage(
`${t.top}
${t.title} | 🎨 𝗖𝗼𝗹𝗼𝗿
${t.bottom}
🎨 নতুন রঙ পরিবর্তন হয়েছে 🌪️
`, threadID);
                break;
            }

            case "log:user-nickname": {
                const t = getRandomTheme();

                const nick = logMessageData.nickname || "";

                dataThread.nicknames[logMessageData.participant_id] = nick;

                const m = await mentionUser(logMessageData.participant_id);

                api.sendMessage(
`${t.top}
${t.title} | 🏷️ 𝗡𝗶𝗰𝗸𝗻𝗮𝗺𝗲
${t.bottom}
👤 ${m.text}
➡️ নতুন নাম: ${nick.length === 0 ? "Original Name" : nick} 🎭
`, threadID, { mentions: m.mentions });
                break;
            }

            case "log:thread-name": {
                const t = getRandomTheme();

                dataThread.threadName = logMessageData.name || "No name";

                api.sendMessage(
`${t.top}
${t.title} | 🏷️ 𝗡𝗮𝗺𝗲
${t.bottom}
🆕 নতুন নাম: ${dataThread.threadName} 🎆
`, threadID);
                break;
            }
        }

        await Threads.setData(threadID, { threadInfo: dataThread });

    } catch (e) {
        console.log("adminUpdate error:", e);
    }
};
