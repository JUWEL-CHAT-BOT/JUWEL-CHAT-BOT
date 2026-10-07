const fs = require("fs");
const path = require("path");

// ─── Data paths ───
const DATA_DIR = path.join(__dirname, "data");
const BAN_FILE = path.join(DATA_DIR, "banned.json");
const PENDING_FILE = path.join(DATA_DIR, "pending_kicks.json");

// ─── Ensure data dir + files ───
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(BAN_FILE)) fs.writeFileSync(BAN_FILE, "{}");
if (!fs.existsSync(PENDING_FILE)) fs.writeFileSync(PENDING_FILE, "[]");

// ─── Helpers ───
const readJSON = (f, def) => {
    try { return JSON.parse(fs.readFileSync(f, "utf8")); }
    catch { return def; }
};
const writeJSON = (f, data) =>
    fs.writeFileSync(f, JSON.stringify(data, null, 2));

const parseTime = (str) => {
    // "10s", "5m", "2h" → ms
    const m = /^(\d+)([smh])$/i.exec(str);
    if (!m) return null;
    const n = parseInt(m[1]);
    const unit = m[2].toLowerCase();
    return n * (unit === "s" ? 1000 : unit === "m" ? 60000 : 3600000);
};

module.exports.config = {
    name: "kick",
    version: "2.0.0",
    hasPermssion: 1,
    credits: "MR JUWEL (upgraded)",
    description: "Kick with limit, ban, undo, schedule",
    commandCategory: "System",
    usages: "[tag/reply] [in 10m] [--ban] [--undo]",
    cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID, mentions, messageReply, type } = event;

    try {
        // ─── Load data ───
        const banned = readJSON(BAN_FILE, {});
        let pending = readJSON(PENDING_FILE, []);

        // ─── Bot admin check ───
        const threadInfo = await api.getThreadInfo(threadID);
        const botID = api.getCurrentUserID();
        const adminIDs = threadInfo.adminIDs.map(a => a.id);

        if (!adminIDs.includes(botID))
            return api.sendMessage("❌ Bot needs admin rights!", threadID, messageID);

        if (!adminIDs.includes(senderID))
            return api.sendMessage("❌ Only group admins can use this!", threadID, messageID);

        // ─── Sub-commands ───
        const lowerArgs = args.map(a => a.toLowerCase());

        // 🔹 UNDO: /kick undo <id>  OR  reply + "undo"
        if (lowerArgs[0] === "undo") {
            let id = args[1] || (type === "message_reply" ? messageReply.senderID : null);
            if (!id) return api.sendMessage("⚠️ Usage: /kick undo <id> or reply + undo", threadID, messageID);
            try {
                await api.addUserToGroup(id, threadID);
                return api.sendMessage(`✅ Re-added: ${id}`, threadID);
            } catch {
                return api.sendMessage("❌ Undo failed (user may need friend request / privacy blocks).", threadID);
            }
        }

        // 🔹 UNBAN: /kick unban <id>
        if (lowerArgs[0] === "unban") {
            const id = args[1];
            if (!id) return api.sendMessage("⚠️ Usage: /kick unban <id>", threadID, messageID);
            if (banned[threadID] && banned[threadID].includes(id)) {
                banned[threadID] = banned[threadID].filter(x => x !== id);
                writeJSON(BAN_FILE, banned);
                return api.sendMessage(`✅ Unbanned: ${id}`, threadID);
            }
            return api.sendMessage("ℹ️ Not banned.", threadID);
        }

        // 🔹 BANLIST: /kick banlist
        if (lowerArgs[0] === "banlist") {
            const list = banned[threadID] || [];
            return api.sendMessage(
                list.length ? `🚫 Banned in this group (${list.length}):\n${list.join("\n")}` : "ℹ️ No banned users.",
                threadID
            );
        }

        // ─── Collect targets ───
        let targetIDs = [];
        if (type === "message_reply") targetIDs.push(messageReply.senderID);
        if (mentions) targetIDs.push(...Object.keys(mentions));
        targetIDs = [...new Set(targetIDs)];

        if (targetIDs.length === 0)
            return api.sendMessage("⚠️ Reply or tag someone!", threadID, messageID);

        // ─── Filter ───
        const safeTargets = targetIDs.filter(id =>
            id !== botID && !adminIDs.includes(id)
        );
        const skipped = targetIDs.length - safeTargets.length;

        if (safeTargets.length === 0)
            return api.sendMessage("⚠️ Nothing to kick (all admins or bot).", threadID, messageID);

        // ─── 🚦 2) Kick limit ───
        const MAX_KICK = 10;
        if (safeTargets.length > MAX_KICK)
            return api.sendMessage(
                `⚠️ Max ${MAX_KICK} users per command! You tried ${safeTargets.length}.`,
                threadID, messageID
            );

        // ─── Parse flags ───
        const isBan = lowerArgs.includes("--ban") || lowerArgs.includes("ban");
        const timeIdx = lowerArgs.indexOf("in");
        let delayMs = 0;
        if (timeIdx !== -1 && lowerArgs[timeIdx + 1]) {
            const parsed = parseTime(lowerArgs[timeIdx + 1]);
            if (!parsed) return api.sendMessage("⚠️ Invalid time. Use like: in 30s / 5m / 1h", threadID, messageID);
            delayMs = parsed;
        }

        // ─── 🕒 15) Scheduled kick ───
        if (delayMs > 0) {
            const job = {
                threadID,
                senderID,
                targets: safeTargets,
                ban: isBan,
                kickAt: Date.now() + delayMs,
            };
            pending.push(job);
            writeJSON(PENDING_FILE, pending);

            const secs = Math.round(delayMs / 1000);
            return api.sendMessage(
                `⏰ Scheduled kick in ${secs}s\n👥 Targets: ${safeTargets.length}\n🚫 Ban: ${isBan ? "Yes" : "No"}`,
                threadID
            );
        }

        // ─── Immediate kick ───
        const result = await doKick(api, threadID, safeTargets, { ban: isBan, banned, BAN_FILE });

        return api.sendMessage(
            `╭──── KICK RESULT ────╮\n` +
            `│ 👥 Targets : ${safeTargets.length}\n` +
            `│ ✅ Kicked  : ${result.kicked}\n` +
            `│ ❌ Failed  : ${result.failed}\n` +
            `│ ⏭️ Skipped : ${skipped}\n` +
            `│ 🚫 Banned  : ${isBan ? result.kicked : 0}\n` +
            `╰─────────────────────╯`,
            threadID
        );

    } catch (err) {
        console.error("[KICK ERROR]", err);
        return api.sendMessage("❌ Kick error! Check console.", threadID);
    }
};

// ─────────────────────────────────────
// Kick executor (used by immediate + scheduled)
// ─────────────────────────────────────
async function doKick(api, threadID, targets, opts = {}) {
    let kicked = 0, failed = 0;

    for (const id of targets) {
        try {
            await api.removeUserFromGroup(id, threadID);
            kicked++;

            // 🚫 8) Ban system
            if (opts.ban && opts.banned && opts.BAN_FILE) {
                if (!opts.banned[threadID]) opts.banned[threadID] = [];
                if (!opts.banned[threadID].includes(id)) {
                    opts.banned[threadID].push(id);
                    writeJSON(opts.BAN_FILE, opts.banned);
                }
            }

            await new Promise(r => setTimeout(r, 300));
        } catch {
            failed++;
        }
    }
    return { kicked, failed };
}

// ─────────────────────────────────────
// Scheduler: call this from your main bot file every ~10s
// ─────────────────────────────────────
module.exports.checkScheduledKicks = async function (api) {
    const pending = readJSON(PENDING_FILE, []);
    if (!pending.length) return;

    const banned = readJSON(BAN_FILE, {});
    const now = Date.now();
    const remaining = [];

    for (const job of pending) {
        if (job.kickAt <= now) {
            try {
                await doKick(api, job.threadID, job.targets, {
                    ban: job.ban, banned, BAN_FILE,
                });
                api.sendMessage(
                    `⏰ Scheduled kick done\n👥 Targets: ${job.targets.length}\n🚫 Ban: ${job.ban ? "Yes" : "No"}`,
                    job.threadID
                );
            } catch (e) {
                console.error("[SCHED KICK]", e);
            }
        } else {
            remaining.push(job);
        }
    }
    writeJSON(PENDING_FILE, remaining);
};
