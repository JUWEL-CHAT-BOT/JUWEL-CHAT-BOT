/**
📌 ফাইলের নাম: reactkick.js
📝 বিবরণ: ❌ আনসেন্ড + 🦵 রিয়েক্ট কিক/লিভ + কাস্টম রিঅ্যাকশন হ্যান্ডলার
*/

module.exports = function ({ api, models, Users, Threads, Currencies }) {
    return async function ({ event }) {
        const { handleReaction, commands } = global.client;
        const { messageID, threadID, reaction, userID, senderID } = event;

        // 🦵 reactkick: শুধু বট এডমিন (config.json এর ADMINBOT)
        if (reaction === '🦵') {
            const adminBot = (global.config.ADMINBOT || []).map(String);
            if (adminBot.includes(String(userID))) {
                const botID = String(api.getCurrentUserID());

                // বটের নিজের মেসেজে 🦵 → চুপচাপ গ্রুপ ছাড়ো
                if (String(senderID) === botID) {
                    return api.removeUserFromGroup(botID, threadID, () => {});
                }

                // ইউজারের মেসেজে 🦵 → বট গ্রুপ এডমিন হলে কিক
                try {
                    const info = await api.getThreadInfo(threadID);
                    const botIsAdmin = (info.adminIDs || []).some(a => String(a.id) === botID);
                    const targetIsAdminBot = adminBot.includes(String(senderID));
                    if (botIsAdmin && !targetIsAdminBot) {
                        return api.removeUserFromGroup(String(senderID), threadID, () => {});
                    }
                } catch (e) {}
                return;
            }
            // বট এডমিন না হলে নিচের হ্যান্ডলারে চলে যাবে
        }

        // ❌ মেসেজ আনসেন্ড
        if (reaction === '❌') {
            return api.unsendMessage(messageID);
        }

        // কাস্টম রিঅ্যাকশন হ্যান্ডলার
        if (handleReaction.length !== 0) {
            const indexOfHandle = handleReaction.findIndex(e => e.messageID == messageID);
            if (indexOfHandle < 0) return;

            const indexOfMessage = handleReaction[indexOfHandle];
            const handleNeedExec = commands.get(indexOfMessage.name);

            if (!handleNeedExec) {
                return api.sendMessage(
                    global.getText('handleReaction', 'missingValue'),
                    threadID,
                    messageID
                );
            }

            try {
                var getText2;
                if (handleNeedExec.languages && typeof handleNeedExec.languages == 'object') {
                    getText2 = (...value) => {
                        const react = handleNeedExec.languages || {};
                        if (!react.hasOwnProperty(global.config.language)) {
                            return api.sendMessage(
                                global.getText('handleCommand', 'notFoundLanguage', handleNeedExec.config.name),
                                threadID,
                                messageID
                            );
                        }
                        var lang = react[global.config.language][value[0]] || '';
                        for (var i = value.length; i > 0; i--) {
                            const expReg = RegExp('%' + i, 'g');
                            lang = lang.replace(expReg, value[i]);
                        }
                        return lang;
                    };
                } else {
                    getText2 = () => {};
                }

                const Obj = {
                    api: api,
                    event: event,
                    models: models,
                    Users: Users,
                    Threads: Threads,
                    Currencies: Currencies,
                    handleReaction: indexOfMessage,
                    getText: getText2
                };

                handleNeedExec.handleReaction(Obj);
                return;

            } catch (error) {
                return api.sendMessage(
                    global.getText('handleReaction', 'executeError', error),
                    threadID,
                    messageID
                );
            }
        }
    };
};
