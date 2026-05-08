module.exports.config = {
    name: "adminUpdate",
    eventType: [
        "log:thread-admins",
        "log:thread-name",
        "log:user-nickname",
        "log:thread-icon",
        "log:thread-call",
        "log:thread-color",
        "log:thread-image"
    ],
    version: "6.0.0",
    credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
    description: "Advanced Stylish Group Update System",
    envConfig: {
        sendNoti: true
    }
};

module.exports.run = async function ({ api, event, Threads, Users }) {

    const fs = require("fs-extra");
    const path = require("path");

    if (!event.logMessageData) return;

    const themePath = path.join(__dirname, "themes.json");

    // ==================== THEMES ====================

    if (!fs.existsSync(themePath)) {
        fs.writeJsonSync(themePath, {

            rainbow: {
                top: "🌈━━━━━━━━━━━━━━━━🌈",
                title: "𝗥𝗔𝗜𝗡𝗕𝗢𝗪 𝗨𝗣𝗗𝗔𝗧𝗘",
                bottom: "🌈━━━━━━━━━━━━━━━━🌈",
                icon: "🌈"
            },

            fire: {
                top: "🔥━━━━━━━━━━━━━━━━🔥",
                title: "𝗙𝗜𝗥𝗘 𝗨𝗣𝗗𝗔𝗧𝗘",
                bottom: "🔥━━━━━━━━━━━━━━━━🔥",
                icon: "🔥"
            },

            galaxy: {
                top: "🌌━━━━━━━━━━━━━━━━🌌",
                title: "𝗚𝗔𝗟𝗔𝗫𝗬 𝗨𝗣𝗗𝗔𝗧𝗘",
                bottom: "🌌━━━━━━━━━━━━━━━━🌌",
                icon: "🌌"
            },

            cyber: {
                top: "🤖━━━━━━━━━━━━━━━━🤖",
                title: "𝗖𝗬𝗕𝗘𝗥 𝗨𝗣𝗗𝗔𝗧𝗘",
                bottom: "🤖━━━━━━━━━━━━━━━━🤖",
                icon: "🤖"
            },

            king: {
                top: "👑━━━━━━━━━━━━━━━━👑",
                title: "𝗞𝗜𝗡𝗚 𝗨𝗣𝗗𝗔𝗧𝗘",
                bottom: "👑━━━━━━━━━━━━━━━━👑",
                icon: "👑"
            },

            neon: {
                top: "🪩━━━━━━━━━━━━━━━━🪩",
                title: "𝗡𝗘𝗢𝗡 𝗨𝗣𝗗𝗔𝗧𝗘",
                bottom: "🪩━━━━━━━━━━━━━━━━🪩",
                icon: "🪩"
            },

            diamond: {
                top: "💎━━━━━━━━━━━━━━━━💎",
                title: "𝗗𝗜𝗔𝗠𝗢𝗡𝗗 𝗨𝗣𝗗𝗔𝗧𝗘",
                bottom: "💎━━━━━━━━━━━━━━━━💎",
                icon: "💎"
            },

            anime: {
                top: "🎌━━━━━━━━━━━━━━━━🎌",
                title: "𝗔𝗡𝗜𝗠𝗘 𝗨𝗣𝗗𝗔𝗧𝗘",
                bottom: "🎌━━━━━━━━━━━━━━━━🎌",
                icon: "🎌"
            },

            hacker: {
                top: "💻━━━━━━━━━━━━━━━━💻",
                title: "𝗛𝗔𝗖𝗞𝗘𝗥 𝗨𝗣𝗗𝗔𝗧𝗘",
                bottom: "💻━━━━━━━━━━━━━━━━💻",
                icon: "💻"
            },

            thunder: {
                top: "⚡━━━━━━━━━━━━━━━━⚡",
                title: "𝗧𝗛𝗨𝗡𝗗𝗘𝗥 𝗨𝗣𝗗𝗔𝗧𝗘",
                bottom: "⚡━━━━━━━━━━━━━━━━⚡",
                icon: "⚡"
            }

        }, { spaces: 2 });
    }

    const themes = fs.readJsonSync(themePath);

    function randomTheme() {
        const keys = Object.keys(themes);
        return themes[
            keys[Math.floor(Math.random() * keys.length)]
        ];
    }

    const theme = randomTheme();

    // ==================== USER ====================

    async function getUser(uid) {

        const name = await Users.getNameUser(uid);

        return {
            name,
            mentions: [{
                tag: name,
                id: uid
            }]
        };
    }

    // ==================== THREAD ====================

    const threadID = event.threadID;

    const data =
        await Threads.getData(threadID) || {};

    if (!data.threadInfo)
        data.threadInfo = {};

    const info = data.threadInfo;

    info.adminIDs = info.adminIDs || [];
    info.nicknames = info.nicknames || {};

    // ==================== SEND ====================

    async function send(body, mentions = []) {

        return api.sendMessage({
            body,
            mentions
        }, threadID);
    }

    // ==================== EVENTS ====================

    try {

        switch (event.logMessageType) {

            // ===================================================
            // ADMIN UPDATE
            // ===================================================

            case "log:thread-admins": {

                const target =
                    event.logMessageData.TARGET_ID;

                const author =
                    event.author ||
                    event.senderID;

                const user =
                    await getUser(target);

                const admin =
                    await getUser(author);

                // ADD ADMIN

                if (
                    event.logMessageData.ADMIN_EVENT == "add_admin" ||
                    event.logMessageData.admin_event == "add_admin"
                ) {

                    if (!info.adminIDs.some(
                        i => i.id == target
                    )) {

                        info.adminIDs.push({
                            id: target
                        });
                    }

                    return send(

`${theme.top}
👑 ${theme.title}
${theme.bottom}

✅ NEW ADMIN ADDED

👤 User :
${user.name}

⚡ Added By :
${admin.name}

🎉 তাকে Admin বানানো হয়েছে
🔥 Team Power Increased

${theme.bottom}`,

[
user.mentions[0],
admin.mentions[0]
]

                    );
                }

                // REMOVE ADMIN

                else {

                    info.adminIDs =
                        info.adminIDs.filter(
                            i => i.id != target
                        );

                    return send(

`${theme.top}
❌ ${theme.title}
${theme.bottom}

🚫 ADMIN REMOVED

👤 User :
${user.name}

⚡ Removed By :
${admin.name}

💀 তার Admin Power Remove করা হয়েছে

${theme.bottom}`,

[
user.mentions[0],
admin.mentions[0]
]

                    );
                }
            }

            // ===================================================
            // THREAD NAME
            // ===================================================

            case "log:thread-name": {

                const oldName =
                    info.threadName || "Unknown";

                const newName =
                    event.logMessageData.name ||
                    "No Name";

                info.threadName = newName;

                return send(

`${theme.top}
🏷️ ${theme.title}
${theme.bottom}

✨ GROUP NAME UPDATED

📌 Old Name :
${oldName}

🆕 New Name :
${newName}

⚡ Team Looks Fresh Now

${theme.bottom}`

                );
            }

            // ===================================================
            // NICKNAME
            // ===================================================

            case "log:user-nickname": {

                const uid =
                    event.logMessageData.participant_id;

                const oldNick =
                    info.nicknames[uid] ||
                    "Original Name";

                const newNick =
                    event.logMessageData.nickname ||
                    "Original Name";

                info.nicknames[uid] = newNick;

                const user =
                    await getUser(uid);

                return send(

`${theme.top}
🏷️ ${theme.title}
${theme.bottom}

✨ NICKNAME UPDATED

👤 User :
${user.name}

📌 Old Nickname :
${oldNick}

🆕 New Nickname :
${newNick}

🔥 Stylish Upgrade Complete

${theme.bottom}`,

[user.mentions[0]]

                );
            }

            // ===================================================
            // GROUP ICON
            // ===================================================

            case "log:thread-icon": {

                const icon =
                    event.logMessageData.thread_icon ||
                    event.logMessageData.threadIcon ||
                    "👍";

                info.threadIcon = icon;

                return send(

`${theme.top}
🎭 ${theme.title}
${theme.bottom}

✨ GROUP EMOJI UPDATED

🆕 New Emoji :
${icon}

⚡ Team Style Changed Successfully

${theme.bottom}`

                );
            }

            // ===================================================
            // THREAD COLOR
            // ===================================================

            case "log:thread-color": {

                return send(

`${theme.top}
🎨 ${theme.title}
${theme.bottom}

🌈 GROUP COLOR UPDATED

⚡ New Theme Color Applied
🔥 Chat Now Looks Amazing

${theme.bottom}`

                );
            }

            // ===================================================
            // THREAD PHOTO
            // ===================================================

            case "log:thread-image": {

                return send(

`${theme.top}
🖼️ ${theme.title}
${theme.bottom}

✨ GROUP PHOTO UPDATED

📸 New Group Photo Set
🔥 Team Profile Looks Awesome

${theme.bottom}`

                );
            }

            // ===================================================
            // CALL EVENT
            // ===================================================

            case "log:thread-call": {

                // CALL START

                if (
                    event.logMessageData.event ==
                    "group_call_started"
                ) {

                    const caller =
                        await getUser(
                            event.logMessageData.caller_id
                        );

                    return send(

`${theme.top}
📞 ${theme.title}
${theme.bottom}

☎️ GROUP CALL STARTED

👤 Started By :
${caller.name}

⚡ সবাই Call এ Join দাও

${theme.bottom}`,

[caller.mentions[0]]

                    );
                }

                // CALL END

                if (
                    event.logMessageData.event ==
                    "group_call_ended"
                ) {

                    const duration =
                        event.logMessageData.call_duration || 0;

                    const h =
                        String(
                            Math.floor(duration / 3600)
                        ).padStart(2, '0');

                    const m =
                        String(
                            Math.floor(
                                (duration % 3600) / 60
                            )
                        ).padStart(2, '0');

                    const s =
                        String(
                            duration % 60
                        ).padStart(2, '0');

                    return send(

`${theme.top}
📴 ${theme.title}
${theme.bottom}

❌ GROUP CALL ENDED

⏳ Duration :
${h}:${m}:${s}

⚡ Call Session Finished

${theme.bottom}`

                    );
                }

                // JOIN CALL

                if (
                    event.logMessageData.joining_user
                ) {

                    const user =
                        await getUser(
                            event.logMessageData.joining_user
                        );

                    return send(

`${theme.top}
📞 ${theme.title}
${theme.bottom}

✅ USER JOINED CALL

👤 User :
${user.name}

🎧 এখন Call এ Connected

${theme.bottom}`,

[user.mentions[0]]

                    );
                }

                break;
            }

        }

        // ==================== SAVE ====================

        await Threads.setData(threadID, {
            threadInfo: info
        });

    } catch (err) {

        console.error(
            "[ ADMIN UPDATE ERROR ]",
            err
        );

    }

};
