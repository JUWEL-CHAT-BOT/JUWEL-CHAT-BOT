const fs = require("fs-extra");
const axios = require("axios");

module.exports.config = {
  name: "helpall",
  version: "3.1.0",
  hasPermssion: 0,
  credits: "乛 MR ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "Categorized all command list with serial numbers",
  commandCategory: "system",
  usages: "[No args]",
  cooldowns: 5
};

// ── 𝐁𝐨𝐥𝐝 𝐒𝐞𝐫𝐢𝐟 𝐅𝐨𝐧𝐭 (কমান্ডের নামের জন্য) ──
function toBold(text) {
  const map = {
    'A':'𝐀','B':'𝐁','C':'𝐂','D':'𝐃','E':'𝐄','F':'𝐅','G':'𝐆','H':'𝐇','I':'𝐈','J':'𝐉',
    'K':'𝐊','L':'𝐋','M':'𝐌','N':'𝐍','O':'𝐎','P':'𝐏','Q':'𝐐','R':'𝐑','S':'𝐒','T':'𝐓',
    'U':'𝐔','V':'𝐕','W':'𝐖','X':'𝐗','Y':'𝐘','Z':'𝐙',
    'a':'𝐚','b':'𝐛','c':'𝐜','d':'𝐝','e':'𝐞','f':'𝐟','g':'𝐠','h':'𝐡','i':'𝐢','j':'𝐣',
    'k':'𝐤','l':'𝐥','m':'𝐦','n':'𝐧','o':'𝐨','p':'𝐩','q':'𝐪','r':'𝐫','s':'𝐬','t':'𝐭',
    'u':'𝐮','v':'𝐯','w':'𝐰','x':'𝐱','y':'𝐲','z':'𝐳'
  };
  return text.split('').map(c => map[c] || c).join('');
}

// ── 𝙼𝚘𝚗𝚘𝚜𝚙𝚊𝚌𝚎 𝙱𝚘𝚕𝚍 (ক্যাটাগরি হেডিং) ──
function toCategoryFont(text) {
  const map = {
    'A':'𝙰','B':'𝙱','C':'𝙲','D':'𝙳','E':'𝙴','F':'𝙵','G':'𝙶','H':'𝙷','I':'𝙸','J':'𝙹',
    'K':'𝙺','L':'𝙻','M':'𝙼','N':'𝙽','O':'𝙾','P':'𝙿','Q':'𝚀','R':'𝚁','S':'𝚂','T':'𝚃',
    'U':'𝚄','V':'𝚅','W':'𝚆','X':'𝚇','Y':'𝚈','Z':'𝚉',
    'a':'𝚊','b':'𝚋','c':'𝚌','d':'𝚍','e':'𝚎','f':'𝚏','g':'𝚐','h':'𝚑','i':'𝚒','j':'𝚓',
    'k':'𝚔','l':'𝚕','m':'𝚖','n':'𝚗','o':'𝚘','p':'𝚙','q':'𝚚','r':'𝚛','s':'𝚜','t':'𝚝',
    'u':'𝚞','v':'𝚟','w':'𝚠','x':'𝚡','y':'𝚢','z':'𝚣'
  };
  return text.split('').map(c => map[c] || c).join('');
}

// ── 𝐁𝐨𝐥𝐝 𝐍𝐮𝐦𝐛𝐞𝐫 ──
function toBoldNumber(num) {
  const b = {'0':'𝟎','1':'𝟏','2':'𝟐','3':'𝟑','4':'𝟒','5':'𝟓','6':'𝟔','7':'𝟕','8':'𝟖','9':'𝟗'};
  return num.toString().split('').map(d => b[d] || d).join('');
}

// ── 🎯 আপনার বটের জন্য কাস্টম ক্যাটাগরি ম্যাপিং ──
// নিচে প্রতিটি ক্যাটাগরিতে আপনার কমান্ডের নাম হুবহু মিলিয়ে দিয়েছি
const CATEGORY_MAP = {

  "⚙️ SYSTEM / CONFIG": [
    "help", "helpall", "menu", "prefix", "config", "console", "cache",
    "load", "install", "restart", "uptime", "cmd", "cmdsstore", "shortcut",
    "theme", "settings", "setupbot", "setprefix", "viewcode", "file", "uid",
    "tid", "info", "activity", "status", "console", "shortcut"
  ],

  "🔒 ADMIN ONLY": [
    "0admin", "admin", "adminupdate", "addadmin", "addbotadmin", "admeallbox",
    "antijoin", "antikick", "antilink", "antiout", "antigali", "autoban",
    "ban", "banlist", "blacklist", "block", "botautoban", "boxadmin",
    "ceoremove", "ck", "ckbot", "ckuser", "listadmin", "listbox", "listfriend",
    "lock", "miraistore", "offbot", "onlyadmin", "out", "outall", "owner",
    "pending", "protect", "react", "reload", "rules", "setadabox", "setbd",
    "setbot", "setemoji", "setexp", "setjoin", "setmrjuwel", "setname",
    "setpp", "setprofile", "setriya", "spamban", "suspend", "unsend",
    "welcome", "warn", "warnings", "delmsg", "kick", "kickall", "adduser",
    "approve", "groupimage", "groupname", "boxname", "boxinfo", "newbox",
    "leave", "addadmin", "0admin", "admin", "setadabox", "settings"
  ],

  "🎵 MEDIA / AUDIO": [
    "mp3", "music", "sing", "sing2", "song", "say", "text_voice",
    "textvoice", "voice", "audio", "tts", "autovoice", "text"
  ],

  "🎬 VIDEO / DOWNLOAD": [
    "video", "video1", "video2", "video3", "video4", "youtube", "autodl",
    "4k", "download", "fbcover", "fbkick", "fblink", "getlink", "tiktok"
  ],

  "🖼️ IMAGE / PHOTO": [
    "album", "art", "avatar", "avt", "pic", "girl", "girl pp", "girl2",
    "boy pp", "wallpaper", "imgu", "imgur", "imgurall", "anime", "animegirl",
    "animegirl", "anem i", "megi", "gif", "sticker", "photo"
  ],

  "🎮 GAME / FUN": [
    "quiz", "game", "casino", "truth", "dare", "slot", "joke", "fun",
    "hug", "hug2", "kiss", "slap", "slap2", "love", "love1", "crush",
    "crush1", "married", "married1", "pair", "pair1", "pair2", "pairing",
    "roast", "sad", "attitude", "gali", "ch or", "chor", "toilet", "bo om",
    "boom", "fire", "war", "baby", "bro", "broken", "cute", "hot", "hot2",
    "hot3", "18+", "xxx", "sex", "women", "girl pp", "boy pp"
  ],

  "💰 ECONOMY / BDT": [
    "bkashf", "give", "daily", "balance", "bank", "work", "pay", "coin",
    "cash", "money", "bts", "cpt", "ar", "x"
  ],

  "🕌 ISLAMIC": [
    "allah", "islam", "islamick", "sura", "salam", "shayri", "ramadan",
    "nastik", "wish", "shotic", "shoti"
  ],

  "📢 GROUP / SOCIAL": [
    "tag", "mention", "group", "groupimage", "groupname", "boxname", "boxinfo",
    "inbox", "in", "join", "adduser", "addadmin", "welcome", "notice",
    "noti1", "noti2", "notification", "post", "react", "autoreact",
    "autoreplybot", "autoseen", "send sms", "sms", "stak", "stalk",
    "profile", "userinfo", "ffinfo", "numinfo", "tid", "uid", "linkadd a",
    "linkcaption", "linknickname", "linkpp", "linkstori", "linksupport",
    "shortcut", "supportgc"
  ],

  "🎭 TEXT / FONT / STYLE": [
    "font", "bigtext", "caption", "text", "textpro", "text off", "edit",
    "emojimix", "mix", "prompt", "gptgen", "gemini", "google", "search",
    "translate", "en", "ar", "bn", "hi", "russian", "russia", "japan",
    "copy", "random", "top", "listfriend", "bestfriend", "birthday",
    "bday", "bio", "couple", "coupledp", "fork", "f p", "fp"
  ],

  "🛠️ UTILITY / TOOLS": [
    "age", "alert", "allbox", "alluser", "gethu", "github", "goru",
    "hack", "jail", "nokia", "pet", "poli", "profile", "sigma", "t",
    "x", "zuck", "nastik", "judge", "acp", "acp", "bc", "ck", "c k"
  ]
};

// ── 🔍 ক্যাটাগরি ফাইন্ডার (fallback সহ) ──
function getDisplayCategory(cmdName, cmdConfig) {
  const lower = cmdName.toLowerCase().trim();

  // ১. কাস্টম ম্যাপে খুঁজি (exact match আগে)
  for (const [cat, list] of Object.entries(CATEGORY_MAP)) {
    if (list.some(c => c.toLowerCase() === lower)) return cat;
  }
  // ২. partial match
  for (const [cat, list] of Object.entries(CATEGORY_MAP)) {
    if (list.some(c => lower.includes(c.toLowerCase()) || c.toLowerCase().includes(lower))) {
      return cat;
    }
  }

  // ৩. Admin Only auto detect
  if (cmdConfig?.hasPermssion === 2 || cmdConfig?.hasPermssion === 3) {
    return "🔒 ADMIN ONLY";
  }

  // ৪. commandCategory fallback
  const cat = cmdConfig?.commandCategory;
  if (cat && typeof cat === 'string' && cat.trim() !== '') {
    return "📦 " + cat.toUpperCase();
  }

  return "📦 OTHERS";
}

// ── 🔥 Main Function ──
async function sendHelp(api, event) {
  const { commands } = global.client;
  const { threadID, messageID } = event;

  const categories = {};

  for (const [name, cfg] of commands.entries()) {
    if (!name || !name.trim()) continue;
    const cmdName = name.trim();
    const cat = getDisplayCategory(cmdName, cfg);
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(cmdName);
  }

  // ক্যাটাগরি prioritized order
  const order = [
    "⚙️ SYSTEM / CONFIG",
    "🔒 ADMIN ONLY",
    "🎵 MEDIA / AUDIO",
    "🎬 VIDEO / DOWNLOAD",
    "🖼️ IMAGE / PHOTO",
    "🎮 GAME / FUN",
    "💰 ECONOMY / BDT",
    "🕌 ISLAMIC",
    "📢 GROUP / SOCIAL",
    "🎭 TEXT / FONT / STYLE",
    "🛠️ UTILITY / TOOLS"
  ];

  const sortedCats = Object.keys(categories).sort((a, b) => {
    const ia = order.indexOf(a), ib = order.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  let globalSerial = 1;
  let totalCount = 0;
  const sections = [];

  for (const cat of sortedCats) {
    const cmds = categories[cat].sort();
    const catHeading = toCategoryFont(cat);
    let body = `╭──〔 ${catHeading} 〕──╮\n`;
    for (const cmd of cmds) {
      const serial = toBoldNumber(globalSerial).padStart(3, ' ');
      body += `│ ${serial} ཐི༏ཋྀ ${toBold(cmd)}\n`;
      globalSerial++;
      totalCount++;
    }
    body += `╰──────────────────────╯`;
    sections.push(body);
  }

  const commandList = sections.join("\n\n");

  const finalText = `
╔══════════════════════╗
║   ✿ 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐋𝐈𝐒𝐓 ✿
╚══════════════════════╝

${commandList}

╔══════════════════════╗
║  ✦ 𝐓𝐨𝐭𝐚𝐥: ${toBoldNumber(totalCount)} 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 ✦
╚══════════════════════╝
`;

  const imgPath = __dirname + "/cache/helpallbg.jpg";
  const bg = "https://i.imgur.com/SHmIpOn.jpeg";

  try {
    const res = await axios({
      url: encodeURI(bg),
      method: "GET",
      responseType: "stream",
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    const writer = fs.createWriteStream(imgPath);
    res.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage(
        { body: finalText, attachment: fs.createReadStream(imgPath) },
        threadID,
        () => { try { fs.unlinkSync(imgPath); } catch(e) {} },
        messageID
      );
    });

    writer.on("error", () => {
      api.sendMessage(finalText, threadID, messageID);
    });

  } catch (error) {
    console.error("Error:", error);
    api.sendMessage(finalText, threadID, messageID);
  }
}

module.exports.run = async function ({ api, event }) {
  return sendHelp(api, event);
};

module.exports.handleEvent = async function ({ api, event }) {
  const msg = (event.body || "").toLowerCase().trim();
  if (msg === "helpall" || msg === "allcmd") {
    return sendHelp(api, event);
  }
};
