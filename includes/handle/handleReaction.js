/**
 * 📌 ফাইলের নাম: reactkick.js
 * 📝 বিবরণ:
 *    ❌ = মেসেজ আনসেন্ড
 *    🦵 = ReactKick
 *
 * 🦵 বটের নিজের মেসেজে দিলে → বট গ্রুপ থেকে Leave করবে
 * 🦵 অন্য ইউজারের মেসেজে দিলে → বট Admin হলে সেই ইউজারকে Kick করবে
 *
 * 👑 শুধুমাত্র config.json-এর ADMINBOT UID ব্যবহার করতে পারবে
 */

module.exports = function ({
    api,
    models,
    Users,
    Threads,
    Currencies
}) {

    return async function ({ event }) {

        try {

            const {
                messageID,
                threadID,
                reaction
            } = event;

            // =====================================================
            // CONFIG
            // =====================================================

            const config = global.config || {};

            // config.json থেকে ADMINBOT নেওয়া
            let ADMINBOT = [];

            if (Array.isArray(config.ADMINBOT)) {
                ADMINBOT = config.ADMINBOT;
            } else if (config.ADMINBOT) {
                ADMINBOT = [config.ADMINBOT];
            }

            // চাইলে এখানে আপনার UID সরাসরি রাখতে পারবেন
            const EXTRA_ADMIN = [
                "61594400795920"
            ];

            const reactAdmins = [
                ...new Set(
                    [...ADMINBOT, ...EXTRA_ADMIN]
                        .filter(Boolean)
                        .map(String)
                )
            ];

            // =====================================================
            // BOT UID
            // =====================================================

            const botID = String(
                api.getCurrentUserID()
            );

            // Reaction দেওয়া ব্যক্তির UID
            const reactorID = String(
                event.userID ||
                event.senderID ||
                event.author ||
                ""
            );

            // =====================================================
            // 🦵 REACT KICK
            // =====================================================

            if (
                reaction &&
                String(reaction).includes("🦵")
            ) {

                console.log(
                    "[REACTKICK]",
                    {
                        reaction,
                        messageID,
                        threadID,
                        reactorID,
                        botID,
                        allowed: reactAdmins.includes(reactorID)
                    }
                );

                // শুধুমাত্র অনুমোদিত ADMIN
                if (!reactAdmins.includes(reactorID)) {
                    return;
                }

                // =================================================
                // Message Author বের করা
                // =================================================

                let messageAuthor = String(
                    event.senderID ||
                    event.author ||
                    ""
                );

                // =================================================
                // Thread Info
                // =================================================

                let threadInfo;

                try {

                    threadInfo = await new Promise(
                        (resolve, reject) => {

                            api.getThreadInfo(
                                threadID,
                                (err, info) => {

                                    if (err) {
                                        return reject(err);
                                    }

                                    resolve(info);
                                }
                            );

                        }
                    );

                } catch (err) {

                    console.log(
                        "[REACTKICK] ThreadInfo Error:",
                        err
                    );

                    return;
                }

                // =================================================
                // 👑 বট কি গ্রুপ ADMIN?
                // =================================================

                const adminIDs =
                    Array.isArray(threadInfo.adminIDs)
                        ? threadInfo.adminIDs
                        : [];

                const botIsAdmin =
                    adminIDs.some(
                        admin =>
                            String(admin.id) === botID
                    );

                console.log(
                    "[REACTKICK] Bot Admin:",
                    botIsAdmin
                );

                // =================================================
                // 🦵 BOT-এর নিজের মেসেজ
                // =================================================

                if (messageAuthor === botID) {

                    console.log(
                        "[REACTKICK] Bot message detected → Leaving group"
                    );

                    try {

                        await new Promise(
                            (resolve) => {

                                api.removeUserFromGroup(
                                    botID,
                                    threadID,
                                    (err) => {

                                        if (err) {
                                            console.log(
                                                "[REACTKICK] Leave Error:",
                                                err
                                            );
                                        }

                                        resolve();
                                    }
                                );

                            }
                        );

                    } catch (err) {

                        console.log(
                            "[REACTKICK] Leave Exception:",
                            err
                        );

                    }

                    return;
                }

                // =================================================
                // 🦵 অন্য ইউজারের মেসেজ
                // =================================================

                if (
                    messageAuthor &&
                    messageAuthor !== botID
                ) {

                    // বট Admin না হলে Kick করতে পারবে না
                    if (!botIsAdmin) {

                        console.log(
                            "[REACTKICK] Bot is not Group Admin"
                        );

                        return;
                    }

                    // Admin UID-কে Kick করবে না
                    if (
                        reactAdmins.includes(
                            messageAuthor
                        )
                    ) {

                        console.log(
                            "[REACTKICK] Target is protected ADMIN"
                        );

                        return;
                    }

                    console.log(
                        "[REACTKICK] Kicking:",
                        messageAuthor
                    );

                    try {

                        await new Promise(
                            (resolve) => {

                                api.removeUserFromGroup(
                                    messageAuthor,
                                    threadID,
                                    (err) => {

                                        if (err) {

                                            console.log(
                                                "[REACTKICK] Kick Error:",
                                                err
                                            );

                                        } else {

                                            console.log(
                                                "[REACTKICK] Kick Success:",
                                                messageAuthor
                                            );

                                        }

                                        resolve();
                                    }
                                );

                            }
                        );

                    } catch (err) {

                        console.log(
                            "[REACTKICK] Kick Exception:",
                            err
                        );

                    }

                    return;
                }

                return;
            }

            // =====================================================
            // ❌ UNSEND
            // =====================================================

            if (reaction === "❌") {

                try {

                    return api.unsendMessage(
                        messageID
                    );

                } catch (err) {

                    console.log(
                        "[REACTKICK] Unsend Error:",
                        err
                    );

                    return;
                }
            }

            // =====================================================
            // CUSTOM HANDLE REACTION
            // =====================================================

            const handleReaction =
                global.client.handleReaction || [];

            const commands =
                global.client.commands;

            if (
                !handleReaction ||
                handleReaction.length === 0
            ) {
                return;
            }

            const indexOfHandle =
                handleReaction.findIndex(
                    e =>
                        e.messageID == messageID
                );

            if (indexOfHandle < 0) {
                return;
            }

            const indexOfMessage =
                handleReaction[indexOfHandle];

            const handleNeedExec =
                commands.get(
                    indexOfMessage.name
                );

            if (!handleNeedExec) {

                return api.sendMessage(
                    global.getText(
                        "handleReaction",
                        "missingValue"
                    ),
                    threadID,
                    messageID
                );

            }

            try {

                let getText2;

                // =================================================
                // LANGUAGE HANDLER
                // =================================================

                if (
                    handleNeedExec.languages &&
                    typeof handleNeedExec.languages === "object"
                ) {

                    getText2 = (...value) => {

                        const react =
                            handleNeedExec.languages || {};

                        const language =
                            global.config.language;

                        if (
                            !Object.prototype.hasOwnProperty.call(
                                react,
                                language
                            )
                        ) {

                            return api.sendMessage(
                                global.getText(
                                    "handleCommand",
                                    "notFoundLanguage",
                                    handleNeedExec.config.name
                                ),
                                threadID,
                                messageID
                            );

                        }

                        let lang =
                            react[language][value[0]] || "";

                        for (
                            let i = value.length;
                            i > 0;
                            i--
                        ) {

                            const expReg =
                                new RegExp(
                                    "%" + i,
                                    "g"
                                );

                            lang =
                                lang.replace(
                                    expReg,
                                    value[i]
                                );

                        }

                        return lang;
                    };

                } else {

                    getText2 = () => {};

                }

                // =================================================
                // HANDLER OBJECT
                // =================================================

                const Obj = {

                    api,
                    event,
                    models,
                    Users,
                    Threads,
                    Currencies,

                    handleReaction:
                        indexOfMessage,

                    getText:
                        getText2

                };

                await handleNeedExec.handleReaction(
                    Obj
                );

                return;

            } catch (error) {

                console.log(
                    "[REACTKICK] HandleReaction Error:",
                    error
                );

                return api.sendMessage(
                    global.getText(
                        "handleReaction",
                        "executeError",
                        error
                    ),
                    threadID,
                    messageID
                );

            }

        } catch (error) {

            console.log(
                "[REACTKICK] Main Error:",
                error
            );

        }

    };

};

"config.json"

আপনার "config.json"-এ এটা রাখবেন:

{
    "ADMINBOT": [
        "আপনার_ADMIN_UID"
    ]
}

যদি আপনার "ADMINBOT" আগে থেকেই থাকে, সেটা মুছে ফেলবেন না। শুধু UID নিশ্চিত করবেন।

কীভাবে কাজ করবে:

- 👑 "ADMINBOT" UID-এর কেউ "🦵" দিলে → ReactKick সক্রিয় হবে।
- 🦵 বটের নিজের মেসেজে → বট চুপচাপ গ্রুপ থেকে বের হবে।
- 🦵 অন্য ইউজারের মেসেজে → বট গ্রুপ Admin হলে তাকে kick করবে।
- ❌ → মেসেজ unsend করবে।
- অন্য reaction → আগের "handleReaction" system-এ যাবে।
- কোনো action-এর জন্য বট নিজে message পাঠাবে না; console-এ শুধু debugging তথ্য থাকবে।

ফাইলের নাম: "reactkick.js"

এটাকে আপনার bot-এর event handler / "handleReaction" system যেখান থেকে এই ফাইলগুলো load করে, সেখানেই রাখতে হবে।
