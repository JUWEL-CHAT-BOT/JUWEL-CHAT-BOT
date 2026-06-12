module.exports.config = {
  name: "textoff",
  version: "3.0.0",
  hasPermssion: 1,
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "Full Text Off System (Pro)",
  commandCategory: "group",
  usages: "textoff | textoff 30m | textoff 2h",
  cooldowns: 3
};

// ───── STORAGE ─────
const textOff = {};
const pendingKick = {};

// ───── HELPERS ─────
function msToHuman(ms) {
  if (!ms) return "Permanent";
  let s = Math.floor(ms / 1000);
  let h = Math.floor(s / 3600);
  let m = Math.floor((s % 3600) / 60);
  let sec = s % 60;

  let out = [];
  if (h) out.push(h + "h");
  if (m) out.push(m + "m");
  if (!h && sec) out.push(sec + "s");
  return out.join(" ");
}

function parse(args) {
  if (!args[0]) return { perma: true, ms: null, txt: "Permanent" };

  let x = args[0].toLowerCase();
  let m = x.match(/^(\d+)m$/);
  let h = x.match(/^(\d+)h$/);

  if (m) return { perma: false, ms: m[1] * 60000, txt: m[1] + " Minutes" };
  if (h) return { perma: false, ms: h[1] * 3600000, txt: h[1] + " Hours" };

  return { perma: true, ms: null, txt: "Permanent" };
}

// ───── RUN ─────
module.exports.run = async function ({ api, event, args }) {
  const { threadID, senderID } = event;

  let info = await api.getThreadInfo(threadID);
  let admins = info.adminIDs.map(a => a.id);

  if (!admins.includes(senderID))
    return api.sendMessage("⛔ Only admin can use this", threadID);

  let t = parse(args);
  let end = t.perma ? null : Date.now() + t.ms;

  textOff[threadID] = {
    active: true,
    end,
    owner: senderID,
    time: t.txt
  };

  await api.sendMessage(
`╔══════════════╗
🔇 TEXT OFF ON
╠══════════════╣
⏳ Time: ${t.txt}
👑 Owner: Active
╚══════════════╝`,
    threadID
  );

  // AUTO UNLOCK
  if (!t.perma) {
    setTimeout(async () => {
      delete textOff[threadID];

      let msg = await api.sendMessage(
        "✅ TEXT ON RESTORED\nEveryone can chat now 🟢",
        threadID
      );

      setTimeout(() => {
        api.unsendMessage(msg.messageID);
      }, 120000);

    }, t.ms);
  }
};

// ───── EVENT LISTENER ─────
module.exports.handleEvent = async function ({ api, event }) {
  const { threadID, senderID, messageID } = event;
  if (!textOff[threadID]?.active) return;

  let info = await api.getThreadInfo(threadID);
  let admins = info.adminIDs.map(a => a.id);

  let botID = api.getCurrentUserID();

  // allowed users
  if (
    admins.includes(senderID) ||
    senderID === botID ||
    senderID === textOff[threadID].owner
  ) return;

  let user = await api.getUserInfo(senderID);
  let name = user[senderID]?.name || "User";

  let warn = await api.sendMessage(
`╔══════════════╗
⚠️ WARNING
╠══════════════╣
👤 ${name}
🚫 Text Off Active
⏳ Delete message or kick in 10s
╚══════════════╝`,
    threadID,
    messageID
  );

  if (!pendingKick[threadID]) pendingKick[threadID] = {};

  if (pendingKick[threadID][senderID]?.timer)
    clearTimeout(pendingKick[threadID][senderID].timer);

  pendingKick[threadID][senderID] = {
    warnID: warn.messageID,
    timer: setTimeout(async () => {

      let kickText =
`╔══════════════╗
🥾 KICKED
╠══════════════╣
👤 ${name}
🚫 Rule Break
╚══════════════╝`;

      try {
        await api.editMessage(kickText, warn.messageID);
      } catch {
        await api.sendMessage(kickText, threadID);
      }

      setTimeout(() => {
        api.removeUserFromGroup(senderID, threadID);
      }, 2000);

      delete pendingKick[threadID][senderID];

    }, 10000)
  };
};

// ───── UNSEND DETECT ─────
module.exports.onMessageUnsend = async function ({ api, event }) {
  const { threadID, senderID, messageID } = event;

  if (!pendingKick[threadID]?.[senderID]) return;

  const data = pendingKick[threadID][senderID];

  if (data.warnID) {
    try {
      await api.unsendMessage(data.warnID);
    } catch {}
  }

  clearTimeout(data.timer);
  delete pendingKick[threadID][senderID];
};
