const fs = require("fs-extra");
const request = require("request");
const path = require("path");

module.exports.config = {
    name: "help",
    version: "8.0.0",
    hasPermssion: 0,
    credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
    description: "Ultra Premium Help System",
    commandCategory: "system",
    usages: "[command/page]",
    cooldowns: 5
};

// 💎 UI FRAME
function frame(content, prefix, bot) {
    return `╔════════════════════════╗
║      🌌 𝙋𝙍𝙀𝙈𝙄𝙐𝙈 𝙃𝙀𝙇𝙋 🌌     ║
╠════════════════════════╣
${content}
╠════════════════════════╣
║ ⚙ PREFIX : ${prefix}
║ 🤖 BOT    : ${bot}
╚════════════════════════╝`;
}

// 🖼 IMAGE
const imgs = ["https://i.imgur.com/sj7ieqs.jpeg"];

function getImage(cb) {
    const file = path.join(__dirname, "cache", `help_${Date.now()}.jpg`);

    request(imgs[0])
        .pipe(fs.createWriteStream(file))
        .on("close", () => cb(file))
        .on("error", () => cb(null));
}

// ===============================
// 🔥 MAIN RUN
// ===============================
module.exports.run = async function ({ api, event, args }) {

    const { commands } = global.client;
    const { threadID, messageID, senderID } = event;

    const prefix = global.config.PREFIX || "!";
    const botName = global.config.BOTNAME || "BOT";

    const all = Array.from(commands.keys()).sort();

    const perPage = 100;
    const totalPage = Math.ceil(all.length / perPage);

    // ===========================
    // 📌 COMMAND INFO MODE
    // ===========================
    if (args[0] && isNaN(args[0])) {

        const cmd = commands.get(args[0].toLowerCase());
        if (!cmd) return api.sendMessage("❌ Command not found!", threadID, messageID);

        const perm = ["User", "Admin", "Bot Admin"][cmd.config.hasPermssion] || "Unknown";

        const raw = `📛 NAME ➤ ${cmd.config.name}
📌 USAGE ➤ ${cmd.config.usages || "N/A"}
📝 DESC ➤ ${cmd.config.description || "N/A"}
🔑 PERM ➤ ${perm}
👨‍💻 DEV ➤ ${cmd.config.credits}
📂 CAT ➤ ${cmd.config.commandCategory}
⏳ COOLD ➤ ${cmd.config.cooldowns}s`;

        return api.sendMessage(frame(raw, prefix, botName), threadID, messageID);
    }

    // ===========================
    // 📌 PAGE BUILDER
    // ===========================
    const buildPage = (page) => {
        const start = (page - 1) * perPage;
        const list = all.slice(start, start + perPage);

        let msg = list.map((c, i) => `✅ ${start + i + 1}. ${c}`).join("\n");

        return `📄 PAGE ➤ ${page}/${totalPage}
📊 TOTAL ➤ ${all.length}

${msg}

💬 Reply number (1-${totalPage})`;
    };

    // ===========================
    // 📌 SEND PAGE
    // ===========================
    const page = Math.max(parseInt(args[0]) || 1, 1);

    getImage(file => {
        api.sendMessage({
            body: frame(buildPage(page), prefix, botName),
            attachment: file ? fs.createReadStream(file) : null
        }, threadID, (err, info) => {

            global.client.handleReply = global.client.handleReply || [];

            global.client.handleReply.push({
                name: module.exports.config.name,
                messageID: info.messageID,
                author: senderID,
                type: "help"
            });

            if (file) fs.unlinkSync(file);
        }, messageID);
    });
};

// ===============================
// 🔥 HANDLE REPLY (FIXED)
// ===============================
module.exports.handleReply = async function ({ api, event, handleReply }) {

    if (event.senderID !== handleReply.author) return;
    if (handleReply.type !== "help") return;
    if (isNaN(event.body)) return;

    const page = Math.max(parseInt(event.body), 1);

    const all = Array.from(global.client.commands.keys()).sort();
    const perPage = 100;
    const totalPage = Math.ceil(all.length / perPage);

    const start = (page - 1) * perPage;
    const list = all.slice(start, start + perPage);

    let msg = list.map((c, i) => `✅ ${start + i + 1}. ${c}`).join("\n");

    const final = `📄 PAGE ➤ ${page}/${totalPage}

${msg}

💬 Reply number to jump page`;

    if (api.editMessage) {
        return api.editMessage(final, handleReply.messageID);
    } else {
        return api.sendMessage(final, event.threadID);
    }
};
