const fs = require("fs-extra");
const request = require("request");
const path = require("path");

module.exports.config = {
    name: "help",
    version: "6.0.0",
    hasPermssion: 0,
    credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
    description: "Ultra Premium Help Menu",
    commandCategory: "system",
    usages: "[command/page]",
    cooldowns: 5
};

// 💎 ULTRA PREMIUM FRAMES
const frames = [
(content, prefix, bot) => `╔════════════════════════╗
║   🌌 𝙋𝙍𝙀𝙈𝙄𝙐𝙈 𝙃𝙀𝙇𝙋 🌌   ║
╠════════════════════════╣
${content}
╠════════════════════════╣
║ ⚙ PREFIX : ${prefix}
║ 🤖 BOT    : ${bot}
║ 📡 STATUS : ONLINE
╚════════════════════════╝`,

(content, prefix, bot) => `┏━━━━━━━━━━━━━━━━━━━━━━━━┓
┃    ⚡ 𝙐𝙇𝙏𝙍𝘼 𝙃𝙀𝙇𝙋 𝙈𝙀𝙉𝙐 ⚡     ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━┫
${content}
┣━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ ⚙ ${prefix}  |  🤖 ${bot}
┃ 💠 POWERED BY JUWEL
┗━━━━━━━━━━━━━━━━━━━━━━━━┛`,

(content, prefix, bot) => `╭━━━━━━━━━━━━━━━━━━━━━━━━╮
│   🚀 𝙎𝙔𝙎𝙏𝙀𝙈 𝘾𝙊𝙉𝙏𝙍𝙊𝙇 🚀    │
├━━━━━━━━━━━━━━━━━━━━━━━━┤
${content}
├━━━━━━━━━━━━━━━━━━━━━━━━┤
│ ⚙ Prefix ➤ ${prefix}
│ 🤖 Bot    ➤ ${bot}
│ 🔥 Mode   ➤ Premium
╰━━━━━━━━━━━━━━━━━━━━━━━━╯`
];

function getFrame(content, prefix, bot) {
    return frames[Math.floor(Math.random() * frames.length)](content, prefix, bot);
}

// 🖼 IMAGE
const imgs = [
    "https://i.imgur.com/sj7ieqs.jpeg"
];

function getImage(callback) {
    const url = imgs[Math.floor(Math.random() * imgs.length)];
    const filePath = path.join(__dirname, "cache", `help_${Date.now()}.jpg`);

    request(url)
        .pipe(fs.createWriteStream(filePath))
        .on("close", () => callback(filePath))
        .on("error", () => callback(null));
}

// 🔥 MAIN
module.exports.run = async function ({ api, event, args }) {
    const { commands } = global.client;
    const { threadID, messageID } = event;

    const prefix = global.config.PREFIX || "!";
    const botName = global.config.BOTNAME || "BOT";

    // 🔎 COMMAND INFO
    if (args[0] && isNaN(args[0])) {
        const cmd = commands.get(args[0].toLowerCase());

        if (!cmd) {
            return api.sendMessage("❌ Command not found!", threadID, messageID);
        }

        const perm = ["User", "Admin", "Bot Admin"][cmd.config.hasPermssion] || "Unknown";

        const raw = `📛 NAME   ➤ ${cmd.config.name}
📌 USAGE  ➤ ${cmd.config.usages || "N/A"}
📝 DESC   ➤ ${cmd.config.description || "N/A"}
🔑 PERM   ➤ ${perm}
👨‍💻 DEV    ➤ ${cmd.config.credits}
📂 CAT    ➤ ${cmd.config.commandCategory}
⏳ COOLD  ➤ ${cmd.config.cooldowns}s`;

        const final = getFrame(raw, prefix, botName);

        api.sendMessage("⏳ Loading Premium Menu...", threadID, (err, info) => {
            getImage(file => {
                if (!file) return api.editMessage(final, info.messageID);

                api.sendMessage({
                    body: final,
                    attachment: fs.createReadStream(file)
                }, threadID, () => fs.unlinkSync(file), info.messageID);
            });
        });

        return;
    }

    // 📜 COMMAND LIST
    const all = Array.from(commands.keys()).sort();

    const page = Math.max(parseInt(args[0]) || 1, 1);
    const perPage = 50;
    const totalPage = Math.ceil(all.length / perPage);

    const start = (page - 1) * perPage;
    const list = all.slice(start, start + perPage);

    let msg = list.map((c, i) => `✅ ${String(i + 1).padStart(2, "0")} ➤ ${c}`).join("\n");

    const raw = `📄 PAGE ➤ ${page}/${totalPage}
📊 TOTAL ➤ ${all.length}

${msg}

💎 TYPE ➤ ${prefix}help <cmd>`;

    const final = getFrame(raw, prefix, botName);

    api.sendMessage("🚀 Loading Premium Commands...", threadID, (err, info) => {
        getImage(file => {
            if (!file) return api.editMessage(final, info.messageID);

            api.sendMessage({
                body: final,
                attachment: fs.createReadStream(file)
            }, threadID, () => fs.unlinkSync(file), info.messageID);
        });
    });
};
