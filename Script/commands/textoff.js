/install textoff.js const BOSS     = "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐";
const BOX_TOP  = "╔══════════════════════════════╗";
const BOX_MID  = "╠══════════════════════════════╣";
const BOX_BOT  = "╚══════════════════════════════╝";
const LINE     = "┃";
const THIN     = "┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄";

// ================= TIME HELPERS =================

function msToHuman(ms) {
    if (ms <= 0) return "০ সেকেন্ড";

    const totalSec = Math.round(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    const parts = [];
    if (h > 0) parts.push(`${h} ঘন্টা`);
    if (m > 0) parts.push(`${m} মিনিট`);
    if (s > 0 && h === 0) parts.push(`${s} সেকেন্ড`);

    return parts.join(" ");
}

function clockStr(ts) {
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
}

function unlockLine(endsAt) {
    if (!endsAt) return `${LINE} 🔒 পার্মানেন্ট লক করা আছে`;

    const rem = msToHuman(endsAt - Date.now());

    return `${LINE} ⏳ আর ${rem} পরে আনলক হবে\n` +
           `${LINE} 🕐 আনলক সময়: ${clockStr(endsAt)}`;
}

// ================= NOTICE BUILDERS =================

function buildTextOffNotice(endsAt, permanent) {
    const timeLine = permanent
        ? `${LINE} 🔒 পার্মানেন্ট টেক্সট অফ করা হয়েছে`
        : unlockLine(endsAt);

    return `${BOX_TOP}\n` +
`${LINE} 🔇 গ্রুপ টেক্সট অফ নোটিশ 🔇\n` +
`${BOX_MID}\n` +
`${LINE}\n` +
`${LINE} 👑 @everyone\n` +
`${LINE} ${BOSS}\n` +
`${LINE} এই গ্রুপের টেক্সট অফ করে দিছে!\n` +
`${BOX_MID}\n` +
`${LINE} ❌ নিষিদ্ধ:\n` +
`${LINE} • টেক্সট মেসেজ\n` +
`${LINE} • ইমোজি / স্টিকার\n` +
`${LINE} • ফটো / ভিডিও\n` +
`${LINE} • লিংক / ফাইল\n` +
`${LINE}\n` +
`${LINE} 🥾 নিয়ম ভাঙলে কিক দেওয়া হবে!\n` +
`${BOX_MID}\n` +
`${timeLine}\n` +
`${BOX_BOT}\n` +
`${THIN}\n` +
`🤖 Bot by ${BOSS}`;
}

function buildWarnNotice(uname, durationStr, endsAt) {
    const timeLine = endsAt
        ? `${LINE} ⏳ আর ${msToHuman(endsAt - Date.now())} বাকি আছে`
        : `${LINE} 🔒 পার্মানেন্ট চলছে`;

    return `${BOX_TOP}\n` +
`${LINE} ⚠️ সতর্কতা ⚠️\n` +
`${BOX_MID}\n` +
`${LINE}\n` +
`${LINE} 👤 @${uname}\n` +
`${LINE} ${BOSS}\n` +
`${LINE} ${durationStr} এর জন্য টেক্সট অফ আছে!\n` +
`${BOX_MID}\n` +
`${timeLine}\n` +
`${LINE}\n` +
`${LINE} এখনই মেসেজ ডিলিট করো!\n` +
`${LINE} না করলে কিক হবে!\n` +
`${BOX_BOT}\n` +
`${THIN}\n` +
`🤖 Bot by ${BOSS}`;
}

function buildKickNotice(uname, durationStr) {
    return `${BOX_TOP}\n` +
`${LINE} 🥾 কিক নোটিশ 🥾\n` +
`${BOX_MID}\n` +
`${LINE}\n` +
`${LINE} 👤 @${uname}\n` +
`${LINE} ${BOSS}\n` +
`${LINE} ${durationStr} এর নিয়ম ভাঙা হয়েছে\n` +
`${LINE} রিমুভ করা হলো!\n` +
`${BOX_BOT}\n` +
`${THIN}\n` +
`🤖 Bot by ${BOSS}`;
}

function buildNoAdminNotice(uname) {
    return `${BOX_TOP}\n` +
`${LINE} ℹ️ বট নোটিশ ℹ️\n` +
`${BOX_MID}\n` +
`${LINE}\n` +
`${LINE} 😔 আমি এডমিন না!\n` +
`${LINE} তাই @${uname} কে কিক দিতে পারলাম না\n` +
`${BOX_BOT}\n` +
`${THIN}\n` +
`🤖 Bot by ${BOSS}`;
}

function buildTextOnNotice() {
    return `${BOX_TOP}\n` +
`${LINE} ✅ টেক্সট আনলক নোটিশ ✅\n` +
`${BOX_MID}\n` +
`${LINE}\n` +
`${LINE} 🎉 @everyone\n` +
`${LINE} এখন সবাই মেসেজ করতে পারবে\n` +
`${BOX_BOT}\n` +
`${THIN}\n` +
`🤖 Bot by ${BOSS}`;
}

function buildAdminOnlyNotice() {
    return `${BOX_TOP}\n` +
`${LINE} ⛔ অ্যাক্সেস নেই ⛔\n` +
`${BOX_MID}\n` +
`${LINE}\n` +
`${LINE} শুধু এডমিন ব্যবহার করতে পারবে\n` +
`${BOX_BOT}\n` +
`${THIN}\n` +
`🤖 Bot by ${BOSS}`;
}

// ================= ARG PARSER =================

function parseTime(args) {
    if (!args[0]) return { perma: true, ms: null, txt: "পার্মানেন্ট" };

    const x = args[0].toLowerCase();
    const m = x.match(/^(\d+)m$/);
    const h = x.match(/^(\d+)h$/);

    if (m) return { perma: false, ms: m[1] * 60000, txt: `${m[1]} মিনিট` };
    if (h) return { perma: false, ms: h[1] * 3600000, txt: `${h[1]} ঘন্টা` };

    return { perma: true, ms: null, txt: "পার্মানেন্ট" };
}

// ================= EXPORT =================

module.exports = {
    config: {
        name: "textoff",
        version: "4.0.0",
        hasPermssion: 1,
        credits: BOSS,
        description: "Text Off System",
        commandCategory: "group",
        usages: "textoff | textoff 30m | textoff 2h",
        cooldowns: 3
    },

    run: async function({ api, event, args }) {
        const { threadID, senderID } = event;

        const info = await api.getThreadInfo(threadID);
        const admins = info.adminIDs.map(i => i.id);

        if (!admins.includes(senderID))
            return api.sendMessage(buildAdminOnlyNotice(senderID), threadID);

        const t = parseTime(args);
        const end = t.perma ? null : Date.now() + t.ms;

        const msg = await api.sendMessage(
            buildTextOffNotice(end, t.perma),
            threadID
        );

        if (!t.perma) {
            setTimeout(async () => {
                try {
                    await api.sendMessage(buildTextOnNotice(), threadID);
                } catch {}
            }, t.ms);
        }
    }
};
