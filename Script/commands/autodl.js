const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { alldown } = require("shaon-videos-downloader");

module.exports = {
config: {
name: "autodl",
version: "3.1.0",
hasPermssion: 0,
credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
description: "Advanced Auto Video Downloader",
commandCategory: "media",
usages: "paste link",
cooldowns: 5
},

run: async function () {},

handleEvent: async function ({ api, event, Users }) {
try {

const body = event.body || "";

if (!body.startsWith("https://")) return;

//━━━━━━━━━━ USER INFO ━━━━━━━━━━//

const senderID = event.senderID;

const userName =
global.data.userName.get(senderID) ||
"Unknown User";

const mention = [{
tag: userName,
id: senderID
}];

const startTime = Date.now();

//━━━━━━━━━━ COOLDOWN FEATURE ━━━━━━━━━━//

const COOLDOWN_TIME = 5 * 60 * 1000;

const adminIDs = Array.isArray(global.config.ADMINBOT)
? global.config.ADMINBOT.map(String)
: [];

const isAdmin = adminIDs.includes(String(senderID));

const dbPath = path.join(
__dirname,
"cache",
"autodl-count.json"
);

if (!fs.existsSync(dbPath)) {
fs.writeFileSync(
dbPath,
JSON.stringify(
{
total: 0,
users: {}
},
null,
2
)
);
}

const preDb = JSON.parse(fs.readFileSync(dbPath));

if (!preDb.users[senderID]) {
preDb.users[senderID] = {
name: userName,
totalDownload: 0,
totalTime: 0,
lastDownload: null,
cooldownUntil: 0
};

fs.writeFileSync(dbPath, JSON.stringify(preDb, null, 2));
}

if (!isAdmin) {
const now = Date.now();
const cooldownUntil = preDb.users[senderID].cooldownUntil || 0;

if (now < cooldownUntil) {
const remaining = cooldownUntil - now;
const minutes = Math.floor(remaining / 60000);
const seconds = Math.floor((remaining % 60000) / 1000);

api.setMessageReaction(
"⏰",
event.messageID,
() => {},
true
);

return api.sendMessage(
`┏━━━〔 ⏰ DOWNLOAD COOLDOWN ⏰ 〕━━━┓

👤 USER : ${userName}

━━━━━━━━━━━━━━━━━━

❌ ৫ মিনিটের আগে আর ভিডিও
ডাউনলোড দিতে পারবে না

🕒 বাকি সময় :
${minutes} মিনিট ${seconds} সেকেন্ড

⌛ কুলডাউন শেষ হলে আবার
ভিডিও ডাউনলোড দিতে পারবে

┗━━━━━━━━━━━━━━━━━━┛`,
event.threadID,
event.messageID
);
}
}

//━━━━━━━━━━ PLATFORM DETECT ━━━━━━━━━━//

let platform = "Unknown";
let emoji = "🎬";

if (
body.includes("facebook.com") ||
body.includes("fb.watch")
) {
platform = "Facebook";
emoji = "📘";
}

else if (body.includes("tiktok.com")) {
platform = "TikTok";
emoji = "🎵";
}

else if (
body.includes("youtube.com") ||
body.includes("youtu.be")
) {
platform = "YouTube";
emoji = "▶️";
}

else if (body.includes("instagram.com")) {
platform = "Instagram";
emoji = "📸";
}

else if (body.includes("likee.video")) {
platform = "Likee";
emoji = "❤️";
}

else if (body.includes("pinterest.com")) {
platform = "Pinterest";
emoji = "📌";
}

//━━━━━━━━━━ REACTION ━━━━━━━━━━//

api.setMessageReaction(
"⏳",
event.messageID,
() => {},
true
);

//━━━━━━━━━━ LOADING MESSAGE ━━━━━━━━━━//

const loading = await api.sendMessage(

`┏━━━〔 ⚡ AUTO DOWNLOADER ⚡ 〕━━━┓

${emoji} PLATFORM : ${platform}

━━━━━━━━━━━━━━━━━━

⬜⬜⬜⬜ 10%
🔍 Detecting Link...

┗━━━━━━━━━━━━━━━━━━┛`,
event.threadID
);

//━━━━━━━━━━ LOADING STEP 2 ━━━━━━━━━━//

setTimeout(() => {
api.editMessage(

`┏━━━〔 ⚡ AUTO DOWNLOADER ⚡ 〕━━━┓

${emoji} PLATFORM : ${platform}

━━━━━━━━━━━━━━━━━━

🟩⬜⬜⬜ 30%
📥 Fetching Video Info...

┗━━━━━━━━━━━━━━━━━━┛`,
loading.messageID
);
}, 1500);

//━━━━━━━━━━ GET DATA ━━━━━━━━━━//

const data = await alldown(body);

if (!data || !data.url) {

api.setMessageReaction(
"❌",
event.messageID,
() => {},
true
);

return api.editMessage(
"❌ Unable To Download This Video!",
loading.messageID
);
}

//━━━━━━━━━━ LOADING STEP 3 ━━━━━━━━━━//

api.editMessage(

`┏━━━〔 ⚡ AUTO DOWNLOADER ⚡ 〕━━━┓

${emoji} PLATFORM : ${platform}

━━━━━━━━━━━━━━━━━━

🟩🟩🟩⬜ 70%
🚀 Downloading Video...

┗━━━━━━━━━━━━━━━━━━┛`,
loading.messageID
);

//━━━━━━━━━━ VIDEO INFO ━━━━━━━━━━//

let title =
data.title ||
data.caption ||
data.desc ||
data.video_title ||
`${platform} Video`;

let duration =
data.duration ||
data.length ||
"Unknown";

let quality =
data.quality ||
data.resolution ||
"HD";

//━━━━━━━━━━ CLEAN TITLE ━━━━━━━━━━//

title = title
.replace(/\n/g, " ")
.replace(/\s+/g, " ")
.trim();

//━━━━━━━━━━ FILE PATH ━━━━━━━━━━//

const fileName = `autodl_${senderID}.mp4`;

const filePath = path.join(
__dirname,
"cache",
fileName
);

//━━━━━━━━━━ DOWNLOAD VIDEO ━━━━━━━━━━//

const response = await axios({
url: data.url,
method: "GET",
responseType: "stream"
});

const writer = fs.createWriteStream(filePath);

response.data.pipe(writer);

writer.on("finish", async () => {

//━━━━━━━━━━ FILE SIZE ━━━━━━━━━━//

const stats = fs.statSync(filePath);

const fileSize =
(stats.size / 1024 / 1024).toFixed(2) + " MB";

//━━━━━━━━━━ DOWNLOAD TIME ━━━━━━━━━━//

const endTime = Date.now();

const totalTime =
((endTime - startTime) / 1000).toFixed(1);

//━━━━━━━━━━ DATABASE ━━━━━━━━━━//

if (!fs.existsSync(dbPath)) {

fs.writeFileSync(
dbPath,

JSON.stringify(
{
total: 0,
users: {}
},
null,
2
)
);
}

const db = JSON.parse(
fs.readFileSync(dbPath)
);

if (!db.users[senderID]) {

db.users[senderID] = {
name: userName,
totalDownload: 0,
totalTime: 0,
lastDownload: null,
cooldownUntil: 0
};
}

db.total += 1;

db.users[senderID].totalDownload += 1;

db.users[senderID].totalTime += Number(totalTime);

db.users[senderID].lastDownload =
new Date().toLocaleString(
"en-BD",
{
timeZone: "Asia/Dhaka"
}
);

if (!isAdmin) {
db.users[senderID].cooldownUntil = Date.now() + COOLDOWN_TIME;
}

fs.writeFileSync(
dbPath,
JSON.stringify(db, null, 2)
);

//━━━━━━━━━━ FINAL LOADING ━━━━━━━━━━//

api.editMessage(

`┏━━━〔 ⚡ AUTO DOWNLOADER ⚡ 〕━━━┓

${emoji} PLATFORM : ${platform}

━━━━━━━━━━━━━━━━━━

🟩🟩🟩🟩 100%
✅ Upload Complete

┗━━━━━━━━━━━━━━━━━━┛`,
loading.messageID
);

api.setMessageReaction(
"✅",
event.messageID,
() => {},
true
);

//━━━━━━━━━━ FINAL MESSAGE ━━━━━━━━━━//

return api.sendMessage(
{
body:

`╔═══════════════✦══════════════╗
『 AUTO DOWNLOADER 』
╚═══════════════✦══════════════╝

╭━━━━━━━━━━━━━━━━━━╮
┃ 👤 REQUEST BY :
┃ ${userName}
┣━━━━━━━━━━━━━━━━━━┫
┃ 🎬 YOUR DOWNLOAD :
┃ ${db.users[senderID].totalDownload} Videos
┣━━━━━━━━━━━━━━━━━━┫
┃ 🌍 TOTAL DOWNLOAD :
┃ ${db.total} Videos
┣━━━━━━━━━━━━━━━━━━┫
┃ 🕒 LAST DOWNLOAD :
┃ ${db.users[senderID].lastDownload}
┣━━━━━━━━━━━━━━━━━━┫
┃ ⚡ TOTAL USER TIME :
┃ ${db.users[senderID].totalTime.toFixed(1)} Seconds
┣━━━━━━━━━━━━━━━━━━┫
┃ ${emoji} PLATFORM :
┃ ${platform}
┣━━━━━━━━━━━━━━━━━━┫
┃ 🎬 TITLE :
┃ ${title}
┣━━━━━━━━━━━━━━━━━━┫
┃ ⏱️ DURATION :
┃ ${duration}
┣━━━━━━━━━━━━━━━━━━┫
┃ ⚡ DOWNLOAD TIME :
┃ ${totalTime} Seconds
┣━━━━━━━━━━━━━━━━━━┫
┃ 📺 QUALITY :
┃ ${quality}
┣━━━━━━━━━━━━━━━━━━┫
┃ 👑 AUTHOR :
┃ 𝐌𝐑 𝐉𝐔𝐖𝐄𝐋
┣━━━━━━━━━━━━━━━━━━┫
┃ 📦 FILE SIZE :
┃ ${fileSize}
┣━━━━━━━━━━━━━━━━━━┫
┃ ⚡ STATUS :
┃ DOWNLOADED SUCCESSFULLY ✅
╰━━━━━━━━━━━━━━━━━━╯

⎯͢🩷ꤪ⁽𝐌ꤪ𝆠፝֟𝐑₎ꜛ⪼─⃞⤹𐙚
𝐉𝆠፝֟🅤𝆠፝֟𝐖𝆠፝֟🅔𝆠፝֟𝐋༢ꜛ國🩷ꤪ🪽`,

mentions: mention,
attachment: fs.createReadStream(filePath)
},

event.threadID,

() => {
if (fs.existsSync(filePath)) {
fs.unlinkSync(filePath);
}
},

event.messageID
);
});

//━━━━━━━━━━ ERROR ━━━━━━━━━━//

writer.on("error", () => {

api.setMessageReaction(
"❌",
event.messageID,
() => {},
true
);

return api.sendMessage(
"❌ File Write Error!",
event.threadID,
event.messageID
);
});

} catch (e) {

console.log(e);

return api.sendMessage(
`❌ Error:\n${e.message}`,
event.threadID,
event.messageID
);
}

}
};
