const fs = require("fs-extra");
const path = require("path");

const BAN_FILE = path.join(__dirname, "bannedUsers.json");

// =========================
// INIT
// =========================
if (!global.data.userBanned) global.data.userBanned = new Map();

// =========================
// LOAD
// =========================
function loadBan() {
  try {
    if (!fs.existsSync(BAN_FILE)) fs.writeFileSync(BAN_FILE, "{}");

    const data = JSON.parse(fs.readFileSync(BAN_FILE));

    global.data.userBanned.clear();
    for (let id in data) {
      global.data.userBanned.set(id, data[id]);
    }

    console.log("✅ BAN LOADED:", global.data.userBanned.size);
  } catch {
    fs.writeFileSync(BAN_FILE, "{}");
  }
}

// =========================
// SAVE
// =========================
function saveBan() {
  const obj = Object.fromEntries(global.data.userBanned);
  fs.writeFileSync(BAN_FILE, JSON.stringify(obj, null, 2));
}

loadBan();

// =========================
// CONFIG
// =========================
module.exports.config = {
  name: "ban",
  version: "4.0.0",
  hasPermssion: 2,
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "Mirai Stable Ban System",
  commandCategory: "group",
  cooldowns: 3
};

// =========================
// AUTO BLOCK
// =========================
module.exports.handleEvent = async ({ event, api }) => {
  const { senderID, threadID } = event;

  const data = global.data.userBanned.get(senderID);
  if (!data) return;

  // expire check
  if (data.expire && Date.now() > data.expire) {
    global.data.userBanned.delete(senderID);
    saveBan();
    return;
  }

  return api.sendMessage(
    `⛔ তুমি Ban করা আছো\n📝 কারণ: ${data.reason}`,
    threadID
  );
};

// =========================
// COMMAND
// =========================
module.exports.run = async ({ event, api, args }) => {
  const { threadID, messageID, messageReply, mentions } = event;

  const cmd = (event.body || "").split(" ")[0].toLowerCase();

  // 🔥 TARGET FIX
  let targetID =
    messageReply?.senderID ||
    Object.keys(mentions || {})[0] ||
    args[0];

  if (!targetID)
    return api.sendMessage("⚠️ UID / Reply / Mention দিন", threadID, messageID);

  if (!/^\d+$/.test(targetID))
    return api.sendMessage("❌ সঠিক UID দিন!", threadID, messageID);

  // =========================
  // BAN
  // =========================
  if (cmd === "/ban" || cmd === "ban") {
    let time = args[1];
    let reason = args.slice(2).join(" ") || "No reason";

    let expire = null;

    if (time) {
      let m = time.match(/(\d+)([mhd])/);
      if (m) {
        let v = +m[1];
        let t = m[2];

        expire =
          t === "m" ? Date.now() + v * 60000 :
          t === "h" ? Date.now() + v * 3600000 :
          Date.now() + v * 86400000;
      }
    }

    global.data.userBanned.set(targetID, {
      reason,
      expire,
      by: event.senderID,
      time: Date.now()
    });

    saveBan();

    return api.sendMessage(
`╔═══════ BAN ═══════╗
👤 UID: ${targetID}
📝 Reason: ${reason}
⏳ Time: ${time || "Permanent"}
╚══════════════════╝`,
      threadID,
      messageID
    );
  }

  // =========================
  // UNBAN
  // =========================
  if (cmd === "/unban" || cmd === "unban") {
    if (!global.data.userBanned.has(targetID))
      return api.sendMessage("⚠️ এই ইউজার banned না", threadID, messageID);

    global.data.userBanned.delete(targetID);
    saveBan();

    return api.sendMessage(
`🟢 UNBANNED

UID: ${targetID}
✔️ সফল`,
      threadID,
      messageID
    );
  }
};
