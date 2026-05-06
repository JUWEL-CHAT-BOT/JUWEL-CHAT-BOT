const moment = require("moment-timezone");

module.exports.config = {
    name: "autoban",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
    description: "Auto detect abusive words and ban user safely",
    commandCategory: "system",
    usages: "",
    cooldowns: 0
};

// ================== WORD LIST ==================
const badWords = [
    "bot mc", "mc bot", "chutiya bot", "bsdk bot",
    "jhatu bot", "stupid bot", "useless bot",
    "ভোদার বট", "চাপড়ি বট", "বালের জুয়েল",
    "bot lund", "bot lon", "bot cac",
    "bot fake", "bot sida", "bot oc",
    "bot kharap", "bot stupid"
];

// ================== EVENT HANDLER ==================
module.exports.handleEvent = async ({ event, api, Users }) => {
    const { threadID, messageID, body, senderID } = event;

    if (!body || senderID == api.getCurrentUserID()) return;

    const msg = body.toLowerCase().trim();
    const time = moment().tz("Asia/Dhaka").format("HH:mm:ss DD/MM/YYYY");

    const name = await Users.getNameUser(senderID);

    // Check bad words safely
    const isBad = badWords.some(word =>
        msg === word || msg.includes(word)
    );

    if (!isBad) return;

    // WARNING MESSAGE UI
    const warning = {
        body:
`━━━━━━━━━━━━━━━━━━
🚫 𝗔𝗨𝗧𝗢 𝗕𝗔𝗡 𝗦𝗬𝗦𝗧𝗘𝗠
━━━━━━━━━━━━━━━━━━

👤 User: ${name}
⚠️ Reason: Offensive language detected
⏰ Time: ${time}

❌ You have been removed from system
━━━━━━━━━━━━━━━━━━`
    };

    // BAN USER
    const userData = await Users.getData(senderID) || {};
    userData.banned = true;
    userData.reason = "Abusive language detected";
    userData.dateAdded = time;

    global.data.userBanned.set(senderID, {
        reason: userData.reason,
        dateAdded: time
    });

    await Users.setData(senderID, { data: userData });

    // SEND WARNING
    api.sendMessage(warning, threadID, messageID);

    // NOTIFY ADMINS
    const adminIDs = global.config.ADMINBOT || [];
    for (const admin of adminIDs) {
        api.sendMessage(
`🚨 ADMIN ALERT 🚨

👤 User: ${name}
🆔 UID: ${senderID}
⚠️ Action: Auto Banned
📌 Reason: Abusive language detected
⏰ Time: ${time}`,

        admin
        );
    }
};

// ================== RUN COMMAND ==================
module.exports.run = async ({ event, api }) => {
    return api.sendMessage(
`🤖 Anti-Abuse System Active

✔️ Monitoring enabled
✔️ Auto ban system ON
✔️ Admin protection active

⚡ Bot is running safely`,
        event.threadID
    );
};
