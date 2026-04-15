const fs = require("fs-extra");
const request = require("request");
const path = require("path");

module.exports.config = {
    name: "help",
    version: "4.0.1",
    hasPermssion: 0,
    credits: "MR JUWEL",
    description: "Help system (prefix required)",
    commandCategory: "system",
    usages: "[name/page/category]",
    cooldowns: 5
};

// 🖼️ images
const helpImages = [
    "https://i.imgur.com/koljbGQ.jpeg",
 
];

// 📊 usage file
const usageDataPath = __dirname + "/cache/helpUsage.json";
if (!fs.existsSync(usageDataPath)) fs.writeFileSync(usageDataPath, JSON.stringify({}));

function saveUsage(cmd) {
    let data = JSON.parse(fs.readFileSync(usageDataPath));
    data[cmd] = (data[cmd] || 0) + 1;
    fs.writeFileSync(usageDataPath, JSON.stringify(data, null, 2));
}

// 🖼️ image download
function downloadImages(callback) {
    const url = helpImages[Math.floor(Math.random() * helpImages.length)];
    const filePath = path.join(__dirname, "cache", "help.jpg");

    request(url)
        .on("error", () => callback([]))
        .pipe(fs.createWriteStream(filePath))
        .on("close", () => callback([filePath]));
}

// 🔎 suggestion
function getSuggest(input, list) {
    input = input.toLowerCase();
    return list.find(x => x.toLowerCase().includes(input));
}

module.exports.run = function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const { commands } = global.client;

    const prefix = global.config.PREFIX || "";

    const allCommands = Array.from(commands.keys());

    // 🔍 SEARCH
    if (args[0] === "-s") {
        const keyword = args.slice(1).join(" ").toLowerCase();

        const result = allCommands.filter(cmd =>
            cmd.toLowerCase().includes(keyword)
        );

        return api.sendMessage(
`╔════════════════════╗
🔍 SEARCH RESULT
╚════════════════════╝

🔎 Query: ${keyword}

${result.length ? result.join("\n") : "❌ No command found"}

━━━━━━━━━━━━━━`,
            threadID,
            messageID
        );
    }

    // 📂 CATEGORY
    if (args[0] && isNaN(args[0])) {
        const category = args[0].toLowerCase();
        const filtered = [];

        for (let [name, cmd] of commands) {
            if ((cmd.config.commandCategory || "").toLowerCase() === category) {
                filtered.push(name);
            }
        }

        if (filtered.length > 0) {
            return api.sendMessage(
`╔════════════════════╗
📂 CATEGORY: ${category.toUpperCase()}
╚════════════════════╝

${filtered.join("\n")}

━━━━━━━━━━━━━━`,
                threadID,
                messageID
            );
        }
    }

    // 📌 COMMAND INFO
    if (args[0] && commands.has(args[0])) {
        const cmd = commands.get(args[0]);
        saveUsage(cmd.config.name);

        let usageData = JSON.parse(fs.readFileSync(usageDataPath));
        let used = usageData[cmd.config.name] || 0;

        const msg =
`╔════════════════════╗
✨ COMMAND INFO
╚════════════════════╝

📌 Name: ${cmd.config.name}
📄 Usage: ${cmd.config.usages || "N/A"}
📜 Description: ${cmd.config.description}
📂 Category: ${cmd.config.commandCategory}
📊 Used: ${used} times

⚙ Prefix Required: YES (${prefix}help)
━━━━━━━━━━━━━━`;

        return downloadImages(files => {
            api.sendMessage({
                body: msg,
                attachment: files.map(f => fs.createReadStream(f))
            }, threadID, () => files.forEach(f => fs.unlinkSync(f)), messageID);
        });
    }

    // ❌ SUGGESTION
    if (args[0] && !commands.has(args[0])) {
        const suggest = getSuggest(args[0], allCommands);

        if (suggest) {
            return api.sendMessage(
`❌ Command not found

👉 Did you mean: ${suggest}?`,
                threadID,
                messageID
            );
        }
    }

    // 📄 PAGINATION
    const page = Math.max(1, parseInt(args[0]) || 1);
    const perPage = 15;
    const totalPages = Math.ceil(allCommands.length / perPage);

    const list = allCommands.slice((page - 1) * perPage, page * perPage);

    let msg =
`╔════════════════════╗
📜 HELP MENU
╚════════════════════╝

📄 Page: ${page}/${totalPages}
🧮 Total Commands: ${allCommands.length}

━━━━━━━━━━━━━━
`;

    msg += list.map(cmd => `✦ ${cmd}`).join("\n");

    msg += `

━━━━━━━━━━━━━━
🤖 Bot: ${global.config.BOTNAME || "BOT"}
👑 Owner: MR JUWEL
⚙ Prefix Required: YES (${prefix}help)

▶ Next: ${prefix}help ${page + 1}
◀ Prev: ${prefix}help ${page - 1}
━━━━━━━━━━━━━━`;

    downloadImages(files => {
        api.sendMessage({
            body: msg,
            attachment: files.map(f => fs.createReadStream(f))
        }, threadID, () => files.forEach(f => fs.unlinkSync(f)), messageID);
    });
};
