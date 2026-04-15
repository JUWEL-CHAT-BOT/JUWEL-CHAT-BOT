const fs = require("fs-extra");
const path = require("path");

const cacheDir = path.join(__dirname, "cache");
const pathFile = path.join(cacheDir, "autoseen.json");

// Ensure folder
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
}

// Default data (ONLY first time)
if (!fs.existsSync(pathFile)) {
    fs.writeJsonSync(pathFile, { status: false }, { spaces: 2 });
}

let lastRun = 0;

module.exports.config = {
    name: "autoseen",
    version: "3.0.0",
    hasPermssion: 2,
    credits: "MR JUWEL",
    description: "Auto Seen with full persistent system",
    commandCategory: "tools",
    usages: "on/off",
    cooldowns: 3
};

// READ FUNCTION (safe)
function getStatus() {
    try {
        const data = fs.readJsonSync(pathFile);
        return data.status === true;
    } catch {
        return false;
    }
}

// WRITE FUNCTION (safe)
function setStatus(value) {
    fs.writeJsonSync(pathFile, { status: value }, { spaces: 2 });
}

module.exports.handleEvent = async ({ api }) => {
    try {
        // যদি OFF থাকে → কিছুই করবে না
        if (!getStatus()) return;

        const now = Date.now();
        if (now - lastRun < 5000) return;
        lastRun = now;

        await api.markAsReadAll();

    } catch (e) {
        console.log("AutoSeen Error:", e);
    }
};

module.exports.run = async ({ api, event, args }) => {
    const cmd = (args[0] || "").toLowerCase();

    if (cmd === "on") {
        setStatus(true);
        return api.sendMessage("✅ Auto Seen ON", event.threadID, event.messageID);
    }

    if (cmd === "off") {
        setStatus(false);
        return api.sendMessage("❌ Auto Seen OFF", event.threadID, event.messageID);
    }

    // current status দেখাবে
    const current = getStatus() ? "ON ✅" : "OFF ❌";
    return api.sendMessage(`⚙️ Current Status: ${current}`, event.threadID, event.messageID);
};
