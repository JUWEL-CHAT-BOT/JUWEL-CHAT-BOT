const moment = require("moment-timezone");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "botautoban",
    version: "3.1.0",
    hasPermssion: 0,
    credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
    description: "অন্যান্য বট শনাক্ত করে স্বয়ংক্রিয়ভাবে ব্যান করে (অ্যাডমিন সুরক্ষা সহ)",
    commandCategory: "system",
    usages: "",
    cooldowns: 0
};

// ================== বট ডিটেক্ট কীওয়ার্ড লিস্ট ==================
const botKeywords = [
    // ============= ইংরেজি কীওয়ার্ড =============
    "your keyboard level has reached level",
    "Command not found",
    "The command you used",
    "Uy may lumipad",
    "Unsend this message",
    "You are unable to use bot",
    "»» NOTICE «« Update user nicknames",
    "just removed 1 Attachments",
    "message removedcontent",
    "The current preset is",
    "Here Is My Prefix",
    "just removed 1 attachment.",
    "Unable to re-add members",
    "removed 1 message content:",
    "Here's your music, enjoy!🥰",
    "Ye Raha Aapka Music, enjoy!🥰",
    "your keyboard Power level Up",
    "your keyboard hero level has reached level",
    "Error: Cannot read properties of undefined",
    "Error in onChat: Request failed with status code 500",
    "Error: Failed to fetch list",
    "What's up?",
    "❌ Please provide a question or prompt.",
    "Hi there! How can I help you today?",
    "Hello! How can I help you today?",
    "Wait koro baby 😽",
    "Generation failed!",
    "Error: Request failed with status code 404",
    "Request failed with status code 500.",
    "An error",
    "❌ Error",
    "❌ Please provide an image URL",
    "🔍 Platform detected: TikTok",
    "🤖 𝙷𝚞𝚑! 𝚃𝚑𝚊𝚝 𝚌𝚘𝚖𝚖𝚊𝚗𝚍 𝚍𝚘𝚎𝚜𝚗'𝚝 𝚎𝚡𝚒𝚜𝚝",
    "🤖 𝗖ᴏᴍᴍᴀɴᴅ ɴᴏᴛ ғᴏᴜɴᴅ",
    "Hey senpai!",
    "Error api Response ❌",
    "ℹ️ [!] ɪғ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ɴᴏᴛ",
    "🌸 Assalamualaikum 🌸",
    "🌺 Thank you so much for using my bot in your group ❤️‍🩹",
    "😻 I hope all members enjoy! 🤗",
    "🔰 To view commands 📌",
    "𝐁𝐨𝐭 𝐎𝐰𝐧𝐞𝐫 ➢",
    "⏳𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁....",
    "✖ 𝗖𝗺𝗱 𝗡𝗼𝘁 𝗙𝗼𝘂𝗻𝗱.",
    "━━━━━━━━━━━━━━━",
    "➤ 𝗗𝗶𝗱 𝘆𝗼𝘂 𝗺𝗲𝗮𝗻 ❝ ❞",

    // ============= বাংলা কীওয়ার্ড =============
    "⚠️ একটি ত্রুটি ঘটেছে, দয়া করে পরে আবার চেষ্টা করুন।",
    "তাহলে মায়াবতী কে আমাকে দাও",
    "বেশি Bot Bot করলে leave নিবো কিন্তু😒",
    "⚠️ Sorry Boss এই আবালকে অ্যাড করলাম না",
    "এত হাই-হ্যালো কর ক্যান প্রিও",
    "⚠️ দুঃখিত, আমি ইউজারটাকে আবার অ্যাড করতে পারিনি",
    "হাঁসতে ছে নাকি আমার কষ্ট দেখে",
    "বার বার ডাকলে মাথা গরম হয়ে যায় কিন্তু😑",
    "হ্যা বলো😒, তোমার জন্য কি করতে পারি",
    "আরে Bolo আমার জান",
    "অসম্মান করছিস😰😿",
    "Hop beda😾 Boss বল boss😼",
    "বট বলে চলে যাস কেন😤🥺কী হলো উওর দে🥺",
    "বার বার Disturb করছিস কোনো😾",
    "আমারে এতো ডাকিস না আমি মজা করার mood এ নাই এখন😒",
    "দূরে যা, তোর কোনো কাজ নাই, শুধু bot bot করিস",
    "আমাকে ডেকো না,আমি ব্যাস্ত আছি",
    "কি হলো , মিস্টেক করচ্ছিস নাকি🤣",
    "বলো কি বলবা, সবার সামনে বলবা নাকি",
    "হা বলো, শুনছি আমি 😏",
    "আর কত বার ডাকবি ,শুনছি তো",
    "বলো কি করতে পারি তোমার জন্য",
    "আমি তো অন্ধ কিছু দেখি না🐸 😎",
    "তোর কি চোখে পড়ে না আমি রাহাদ জানুর সাথে ব্যাস্ত আছি😒",
    "আসসালামু আলাইকুম বলেন আপনার জন্য কি করতে পারি",
    "🌻🌺💚আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ",
    "আমি এখন বস রাহাদ এর সাথে বিজি আছি আমাকে ডাকবেন না",
    "আজকে আমার মন ভালো নেই তাই আমারে ডাকবেন না",
    "চুনা ও চুনা আমার বস রাহাদ এর হবু বউ রে কেও দেকছো",
    "ইসস এতো ডাকো কেনো লজ্জা লাগে তো",
    "আমার বস রাহাদ এর পক্ষ থেকে তোমারে এতো এতো ভালোবাসা",
    "দিন দিন কিছু মানুষের কাছে অপ্রিয় হয়ে যাইতেছি",
    "দুনিয়ার সবাই প্রেম করে.!🤧 -আর মানুষ আমার বস রাহাদ কে সন্দেহ করে",
    "আমার থেকে ভালো অনেক পাবা-🙂 -কিন্তু সব ভালো তে কি আর ভালোবাসা থাকে",
    "অবহেলা করিস না-😑😪 - যখন নিজেকে বদলে ফেলবো -😌",
    "বন্ধুর সাথে ছেকা খাওয়া গান শুনতে শুনতে-🤧 -এখন আমিও বন্ধুর 𝙴𝚇 কে অনেক 𝙼𝙸𝚂𝚂 করি",
    "৯৯টাকায় ৯৯জিবি ৯৯বছর-☺️🐸 -অফারটি পেতে এখনই আমাকে প্রোপস করুন",
    "যেই আইডির মায়ায় পড়ে ভুল্লি আমারে.!🥴- তুই কি যানিস সেই আইডিটাও আমি চালাইরে.!🙂",
    "আরে 𝗕𝗼𝗹𝗼 আমার জান ,কেমন আছো?😚",
    "আরে বোকা বট না জানু বল জানু😌",
    "এতো ডাকছিস কেন?গালি শুনবি নাকি? 🤬",
    "⎯͢⎯⃝🩵আ্ঁজ্ঁকে্ঁ ভা্ঁলো্ঁ হ্ঁয়ে্ঁ গে্ঁছি্ঁ দে্ঁই্ঁখা্ঁ কি্ঁছু্ঁ",
    "ক্ঁই্ঁলা্ঁম্‌ঁ না্ঁ",
    "😒⎯͢⎯⃝🩷🍒⎯͢⎯⃝",
    "কি'রে গ্রুপে দেখি একটাও বেডি নাই-🤦‍🥱💦",
    "𝘁𝗼𝗺𝗮𝗸𝗲 𝗱𝗲𝗸𝗵𝗶 🥺😆",
    "কি ভাবছিস তোর বউ মুরগী চোর আমি মিঁলঁনেঁরঁ ফেঁমাঁসঁ বঁটঁ থাকতে তোর মেসেজ গায়েব হবে 😂😂:",

    // ============= ইমোজি/স্পেশাল ক্যারেক্টার =============
    "😲🧸👀",
    "😲🧸😼",
    "😲🧸😚",
    "😲🧸🥴",
    "😲🧸🐸",
    "😤😤😎",
    "😤😤🚶",
    "𝗘𝗺𝗻𝗶 😒🫶🏻",
    "𝗨𝗻𝗯𝗮𝗻🥳🥳",
    "𝗠𝗼𝗻 𝗸𝗮𝗿𝗮𝗽😼",
    "𝗛𝗶𝗵𝗶🥳🥳",
    "𝗖𝗵𝗼𝗸𝗵 𝗲𝗺𝗻 𝗸𝗻 𝗽𝗿𝗼𝘁𝗶𝗯𝗼𝗻𝗱𝗵𝗶 𝗻𝗮𝗸𝗶🌚",
    "𝗧𝗼𝗶 𝗽𝗼𝗰𝗵𝗮👽",
    "𝗛𝗼 😞😴😴",
    "𝗸𝗶 𝗱𝗲𝗸𝗵𝗼𝘀 𝗯𝗼𝗹𝗼𝗱😦",
    "𝗛𝗲𝗮😦",
    "𝗬𝗼𝘂🥳🥳",
    "𝗝𝗮𝗻𝗶𝗻𝗮🐐",
    "𝗛𝗶𝗵𝗶😀",
    "😒😒 😘",
    "𝗼𝗸𝘆 𝗯𝗯𝘆😆",
    "𝗼𝗸𝘆 𝗯𝗯𝘆🐥",
    "𝐭𝐮𝐦𝐢 𝐩𝐨𝐜𝐚 🥰",
    "𝗽𝗿𝗲 𝗶𝘀 𝗮 𝗽𝗿𝗲𝗳𝗶𝘅",
    "𝗡𝗼 𝗻𝗼😦",
    "𝗩𝗮𝗹𝗼 𝘁𝘂𝗺𝗶😆",
    "𝗡𝗼𝗽𝗲𝗲🫡",
    "Yes 😀, I am here",
    "𝗔𝗺𝗶 𝗮𝗿 𝘁𝘂𝗺𝗶😟",
    "𝗔𝗹𝗹𝗮𝗵 𝗛𝗮𝗳𝗲𝗲𝘇😡",
    "𝗮𝗺𝗻𝗶😴😴",
    "𝘆𝗼𝘂 𝘁𝗼𝗼😼",
    "𝗸𝗶 𝗯𝗼𝗹𝗯𝗲 𝗯𝗼𝗹𝗼🤒",
    "𝗸𝗮𝗿 𝗷𝗼𝗻𝗻𝗼 𝗮𝘁𝗼 𝗹𝗼𝘃𝗲🦆",
    "𝘁𝗼𝗿 𝗸𝗮𝘀𝗲𝗶 𝗿𝗮𝗸🐥",
    "𝗛𝗺𝗺 𝗰𝗵𝗼𝗹 𝗹𝗮𝗺 𝘁𝗼😘",
    "𝗰𝗵𝗶𝗽𝗮𝗶😗",
    "𝗛𝘂𝗵🙂",
    "𝘀𝗲𝗻𝘁𝗶 𝗻𝗮 𝗸𝗵𝗮𝘆𝗲",
    "𝗢𝗸𝗮𝘆👋👋",
    "𝗧𝗵𝗶𝗸 𝗮𝗰𝗵𝗲🌝",
    "𝗔𝘆😾",
    "𝗲𝗳𝗴𝗵🤷",
    "𝗡𝗮😃",
    "𝗶 𝗹𝗮𝗽 𝘂 𝗯𝗯𝘆🐐",
    "𝗛𝗺𝗺🫰",
    "𝘁𝘂𝗶 𝘁𝗼 𝘃𝗹𝗼𝗶 𝘀𝘆𝘁𝗻 😡",
    "😑🦧👽",
    "𝗩𝗹𝗼🩵🩵",
    "🤦🤷‍♀️😵‍💫",
    "𝗢𝗸𝗸 𝗯𝗯𝘂🧑‍🍼",
    "𝗣𝗿𝗲𝗴𝗻𝗮𝗻𝘁👋",
    "𝗕𝗮𝗻𝗱𝗼𝗿 𝗵𝗼𝗶𝗹𝗻 𝗻𝗮𝗸𝗶😡",
    "𝗢𝗸😏",
    "𝗞𝗻😴😴",
    "𝗵𝗶𝗵𝗶😏",
    "𝗦𝗼𝗿𝗿𝘆 𝗕𝗮𝗯𝘆 𝗮𝗺𝗮𝗸𝗲 𝗮𝘁𝗮 𝗧𝗲𝗮𝗰𝗵 𝗸𝗼𝗿𝗮 𝗵𝗼𝗶 𝗻𝗶 < 🥺",

    // ============= নতুন যোগ করা কীওয়ার্ড =============
    "𝗺𝘂𝗿𝗶 𝗸𝗵𝗮𝗶😏",
    "𝗡𝗮 𝗔𝗺𝗶 𝗰𝗵𝗼𝗰𝗼𝗹𝗮𝘁𝗲 𝗞𝗵𝗮𝗶 😋🚶",
    "𝗞?🐸",
    "𝗞𝗺𝗻𝗲😛",
    "𝗘𝗺𝗻𝗶😵‍💫",
    "𝗛𝗲𝗮𝗮😊😊✨❤️‍🩹",
    "𝗞𝗶𝘀𝘀𝗲🐥",
    "𝗡𝗮𝗵 𝗴𝗲𝗹𝗲 𝗺𝘂𝗿𝗶 𝗸𝗵𝗮𝘄🫡",
    "𝗣𝗮𝗴𝗼𝗹😟",
    "𝘁𝘂𝗺𝗿 𝘃𝗮𝗶𝘆𝗮𝗿 𝘀𝗮𝘁𝗵𝗲 𝗽𝗿𝗲𝗺 𝗸𝗼𝗿𝗶😏",
    "𝘁𝘂𝗺𝗿 𝗸𝗼𝘁𝗵𝗮 𝘃𝗮𝗯𝗶 😆",
    "𝗯𝗼𝗳 𝗮𝗿 𝗹𝗼𝗴𝗲 😼",
    "𝗽𝗿𝗲𝗺 𝗸𝗼𝗿𝗶 🚶",
    "𝗖𝗵𝗶𝗽𝗮 𝗰𝗵𝗮𝗿𝗮 𝗿 𝘀𝗵𝗼𝗯 𝗷𝗮𝘆𝗴𝗮𝘆🤠",
    "𝗢𝗸🤗",
    "𝗞𝗶𝘀𝘂 𝗻𝗮 𝘁𝗼𝗵!🐤🐤",
    "𝗛𝘂𝗺👽",
    "𝗦𝗲𝗶 𝗱𝗶𝗸𝗲 𝗸𝗵𝘂𝘀𝗵𝗶🩵🩵",
    "𝗯𝗼𝘁 𝗯𝗼𝗶𝗹𝗼 𝗻𝗮 𝗽𝗮𝗸𝗵𝗶🐤🐤",
    "🙂 𝗝𝗮 𝘃𝗮𝗮𝗴😒",
    "𝗔𝗺𝗺𝘂𝗿𝗮 𝗸𝗵𝗮𝗹𝗶 𝗯𝗼𝗸𝗲😭🐐",
    "𝗦𝗼𝗿𝗿𝘆.🙁😀",
    "𝗮𝗶 𝘃𝗮𝗯𝗲 𝗻𝗵 𝗱𝗮𝗸𝗵𝗲 𝗷𝗮𝗵 𝗴𝗶𝘆𝗲 𝗿𝗶𝘀𝗵𝗶 𝗸𝗮 𝘀𝗺𝘀 𝗱𝗲🐸🦥 😃",
    "𝗩𝗮𝗹𝗼 𝗹𝗮𝗴𝗲 𝗻𝗮❤️‍🩹",
    "𝗽𝗮𝗿𝗶 𝗻𝗮😟",
    "𝗧𝘂𝗺𝗶 𝗔𝗺𝗲𝗿 𝗴𝗳 𝗻𝗵 𝗯𝗼𝗹𝗼 🙂??🐤🐤",
    "𝗼𝘄𝘄 🥺 𝗸𝗶 𝗵𝗼𝘆𝗲𝗰𝗵𝗲 𝗯𝗼𝗹𝗼 𝗮𝗺𝗮𝗸𝗲 ? 𝗺𝘂𝘀𝗶𝗰 𝘀𝘂𝗻𝗯𝗮 ?😗",
    "𝗧𝘂𝗺𝗮𝗿👽",
    "𝗸𝘁 𝗯𝗼𝗹𝗼 𝗼𝗿 𝘀𝗮𝘁𝗵𝗲🤷",
    "-𝗪𝗵𝗼𝗸 𝘁𝗵𝘂😼",
    "𝗧𝗺𝗿𝗲 𝗸𝗶𝘀𝘀 𝗱𝗶𝘀𝗶🤠",
    "𝗔𝗶𝘁𝗼 𝗕𝗼𝘀𝗲 𝗔𝗰𝗵𝗶 𝗔𝗽𝗻𝗶🐤",
    "𝗞𝗶𝗶 𝗵𝗼𝗶𝗰𝗲 😑😑",
    "𝗸𝗶 𝗵𝗼𝗹𝗼 𝗯𝗯𝘆 𝗹𝗼𝗷𝗷𝗮 𝗽𝗮𝗰𝗰𝗵𝗼 𝗸𝗻🚶",
    "𝗞𝗼 𝗮𝗺𝗿 𝗷𝗼𝗻𝗻𝗼🐤🐤",
    "== Profile ==",
    "Tên: Juwel AhmeD'z",
    "ID: 61594400795920",
    "-𝗢𝗶𝗶 আন্টি-🙆‍♂️-তোমার মেয়ে চোখ মারে-🥺🥴🐸"
];

// ================== অ্যাডমিন লিস্ট লোড (config.json চেক) ==================
function loadAdminList() {
    try {
        const configPath = path.join(__dirname, "..", "..", "config.json");
        if (fs.existsSync(configPath)) {
            const configData = fs.readJsonSync(configPath);
            return configData.ADMINBOT || [];
        }
    } catch (e) {
        console.log("⚠️ config.json পড়তে সমস্যা:", e.message);
    }
    return global.config?.ADMINBOT || [];
}

// চেক করা ইউজার অ্যাডমিন কিনা
function isAdmin(senderID) {
    const adminList = loadAdminList();
    return adminList.includes(String(senderID)) || adminList.includes(senderID);
}

// ================== ইভেন্ট হ্যান্ডলার ==================
module.exports.handleEvent = async ({ event, api, Users, Threads }) => {
    const { threadID, messageID, body, senderID } = event;

    if (!body || senderID == api.getCurrentUserID()) return;

    // ================== 🛡️ অ্যাডমিন সুরক্ষা ==================
    if (isAdmin(senderID)) {
        const adminMsg = body.toLowerCase().trim();
        const adminMatched = botKeywords.filter(word => adminMsg === word.toLowerCase() || adminMsg.includes(word.toLowerCase()));
        if (adminMatched.length > 0) {
            console.log(`🛡️ অ্যাডমিন ${senderID} কীওয়ার্ড ম্যাচ করেছে কিন্তু ব্যান করা হয়নি: ${adminMatched.join(', ')}`);
        }
        return; // অ্যাডমিন হলে কিছুই করবে না
    }

    const msg = body.toLowerCase().trim();
    const time = moment().tz("Asia/Dhaka").format("HH:mm:ss DD/MM/YYYY");
    const userName = await Users.getNameUser(senderID);

    // থ্রেডের নাম পাওয়া
    let threadName = "ব্যক্তিগত চ্যাট";
    try {
        const threadInfo = await Threads.getInfo(threadID);
        threadName = threadInfo.threadName || threadName;
    } catch (e) {}

    // কীওয়ার্ড চেক করা
    const matchedWords = botKeywords.filter(word => msg === word.toLowerCase() || msg.includes(word.toLowerCase()));

    if (matchedWords.length === 0) return;

    // ================== ইউজারকে ব্যান নোটিশ ==================
    const banNotice = {
        body: `╔════════════════╗
 ⚠️ 𝐁𝐎𝐓 𝐃𝐄𝐓𝐄𝐂𝐓𝐄𝐃 ⚠️
╚══════════════════╝

👤 **নাম:** ${userName}
🆔 **আইডি:** ${senderID}
⏰ **সময়:** ${time}

⚠️ **তুমি আমার মতো একটা 🤖 বট!**
তাই তোমাকে **ব্যান** করে দিলাম 🚫
যাতে গ্রুপে আর **SPAM** না হয় ✅

📌 **কারণ:** অন্য বট হিসেবে ডিটেক্ট
🛑 **ব্যান স্থিতি:** সক্রিয়

───────────────
🔹 **কমান্ড:** /ban list
🔹 **এডমিন:** ${global.config.ADMINBOT ? '✅ উপলব্ধ' : '❌ নেই'}

╔═══════════════════╗
 𝐂𝐑𝐄𝐃𝐈𝐓: 💋𝐌𝐑 𝐉𝐔𝐖𝐄𝐋💋
╚═══════════════════╝`
    };

    // ================== ব্যান প্রক্রিয়া ==================
    const userData = await Users.getData(senderID) || {};
    userData.banned = true;
    userData.reason = `অন্য বট হিসেবে ডিটেক্ট: ${matchedWords.join(', ')}`;
    userData.dateAdded = time;
    userData.threadID = threadID;
    userData.threadName = threadName;

    global.data.userBanned.set(senderID, {
        reason: userData.reason,
        dateAdded: time,
        threadID: threadID,
        threadName: threadName
    });

    await Users.setData(senderID, { data: userData });

    // ================== ব্যান নোটিশ পাঠানো (১ মিনিট পর অটো ডিলিট) ==================
    api.sendMessage(banNotice, threadID, (err, info) => {
        if (err) return;
        setTimeout(() => {
            api.unsendMessage(info.messageID).catch(() => {});
        }, 60000); // ৬০,০০০ ms = ১ মিনিট পর ডিলিট
    }, messageID);

    // ================== অ্যাডমিন নোটিফিকেশন ==================
    const adminIDs = global.config.ADMINBOT || [];
    for (const admin of adminIDs) {
        api.sendMessage(
`╔══════════════════╗
║   অ্যাডমিন সতর্কতা 🚨    ║
╚═══════════════════╝

▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰

📋 ব্যান রিপোর্ট:

👤 নাম: ${userName}
🆔 আইডি: ${senderID}
💬 গ্রুপ: ${threadName}
🆔 গ্রুপ আইডি: ${threadID}

⚠️ কার্যক্রম: স্বয়ংক্রিয় ব্যান
📌 কারণ: অন্য বট হিসেবে ডিটেক্ট
🔍 ডিটেক্টেড কীওয়ার্ড: ${matchedWords.join(', ')}
⏰ সময়: ${time}

📊 পরিসংখ্যান:
• মোট কীওয়ার্ড সনাক্ত: ${matchedWords.length}

▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰

⚡ দ্রুত ব্যবস্থা নিন প্রয়োজনে ⚡`,
        admin
        );
    }
};

// ================== কমান্ড রান ==================
module.exports.run = async ({ event, api }) => {
    const adminList = loadAdminList();
    return api.sendMessage(
`╔══════════════════╗
║   🤖 বট ডিটেক্ট সিস্টেম   ║
╚═══════════════════╝

▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰

✅ সিস্টেম স্ট্যাটাস:

✔️ মনিটরিং: সক্রিয়
✔️ অটো ব্যান: চালু
✔️ অ্যাডমিন সুরক্ষা: সক্রিয় 🛡️
✔️ কীওয়ার্ড ডেটাবেস: আপডেটেড

📊 পরিসংখ্যান:
• মোট কীওয়ার্ড: ${botKeywords.length}+
• সুরক্ষিত অ্যাডমিন: ${adminList.length} জন
▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰

⚡ বট নিরাপদে চলছে ⚡`,
        event.threadID
    );
};
