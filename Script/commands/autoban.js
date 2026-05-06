 moment = require("moment-timezone");

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
    "bot mc", "Mc bot", "Chutiya bot", "Bsdk bot", "Bot teri maa ki chut", "Jhatu bot", "ভোদার বট", "stupid bots", "চাপড়ি বট", "Bot lund", "Juwel mc", "Mc Juwel", "বালের বট জুয়েল কে", "সাউয়ার বট ","এটা বট ভালো না", "ভালো না এটা বট"," পাগল বট","বট পাগল হইছে","বালের বট","বালের বট কে এড করছে","কেউ বট কে এড করবে না" , "তোর বস বোকাচোদা", "বট তোর জুয়েল কে চুদি", "useless bot", "বট চুদি", "crazy bots", "bc bot", "Nikal bsdk bot", "bot khùng", "হেড়ার বট", "বালের জুয়েল", "তোর জুয়েল বস কে চুদি"," লুচ্চা বট", "cmm bot", "clap bot", "bot ncc", "bot oc", "bot óc", "bot óc chó", "cc bot", "bot tiki", "lozz bottt", "lol bot", "loz bot", "lồn bot", "boder bot", "bot lon", "bot cac", "bot nhu lon", "bot xodi", "bot sudi", "Bot sida", "bot sida", "bot fake", "Bot code", "bot shoppee", "bad bots", "bot cau"
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
