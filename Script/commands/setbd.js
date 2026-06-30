const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const moment = require("moment-timezone");

module.exports.config = {
  name: "setbd",
  version: "6.0.0",
  hasPermssion: 0,
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "Auto Birthday Set & Wish (Just command, no date needed)",
  commandCategory: "utility",
  usages: "setbd [mention/reply/uid]",
  cooldowns: 5
};

const dataPath = path.join(__dirname, "birthdayData.json");
if (!fs.existsSync(dataPath)) fs.writeJsonSync(dataPath, {}, { spaces: 2 });

// =====================================
// AUTO BIRTHDAY WISH (রাত ১২টা)
// =====================================
module.exports.onLoad = async function ({ api }) {
  setInterval(async () => {
    try {
      const data = fs.readJsonSync(dataPath);
      const now = moment.tz("Asia/Dhaka");
      const today = now.format("DD/MM");
      const hour = now.format("HH");
      const minute = now.format("mm");

      // ঠিক রাত ১২:০০
      if (hour !== "00" || minute !== "00") return;

      for (const uid in data) {
        const user = data[uid];
        if (!user.birthday) continue;

        // আজকের তারিখের সাথে মিললে উইশ করবে
        if (user.birthday === today) {
          const mentionTag = `@${user.name}`;
          const msg =
`┓｡･ﾟﾟ･｡｡ﾟ💖
┃┗┛ ᵃᵖᵖʸ💜
┃┏┓┃ ᵇᶤʳᵗʰ✿
┗┛┗┛ ᵈᵃʸ*ﾟ✾

🎂 Happy Birthday ${mentionTag} 🎂

🎂💚ღ𝑴𝒂𝒏𝒚 𝑴𝒂𝒏𝒚 𝑯𝒂𝒑𝒑𝒚
𝑹𝒆𝒕𝒖𝒓𝒏 𝑶𝒇𝒇 𝑻𝒉𝒆 𝑫𝒂𝒚ღ🎂👑

ღসুন্দর!!এই!!ভূবনে!সুন্দরতম!!জীবন!!হোক! তোমার
ღপূরন!হোক!প্রতিটি!স্বপ্ন!প্রতিটি!আশা!বেচে! থাক!হাজার!বছর!!

💞,•°\`\`°•,,•°\`\`°•,.,•°\`°•„•°\`\`°•,

༆-তোমার༆༊᭄●জীবনের༆
༊প্রতিটা༆༊ক্ষণ༆༊᭄●
༆༊═❥᭄●আনন্দময়ツহোকツএইツশুভ কামনা༆করি༊᭄● 💐🌺

༆🎂࿇⃝࿇🎂࿐༆🎂࿇⃝࿇🎂࿐

༊═❥᭄●তুমিツসবツসময়ツহাসিখুশী༆༊᭄ থাকিও●༊᭄

🥀༊═❥᭄●তোমার জন্মদিনেরツঅনেক অনেকツশুভেচ্ছাツরইলো༆

🥳 🥳★★🅼︎🅰︎🅽︎🆈︎★★
🥳 ☆☆🅼︎🅰︎🅽︎🆈︎✩✩
🥳✵✵🅗︎🅐︎🅟︎🅟︎🅨︎✵✵
🥳❁🆁︎🅴︎🆃︎🆄︎🆁︎
🥳✰ 🅾︎🅵︎ 🆃︎🅷︎🅴︎✰✰

❥͜͡┈──╌❊⊱┈──╌❊❥͜͜͡͡⃟❥͜͜͡͡➳
┊┊┊┊┊┊┊❤️
┊┊┊┊┊┊🥳💙
┊┊┊┊┊🥳💛
┊┊┊┊🥳💜
┊┊┊🥳💚
┊┊🥳🤍
┊🥳🤍
🥳💖

╔══════════════════════╗
      🎂 AUTO BIRTHDAY WISH
╚══════════════════════╝`;

          const imgPath = path.join(__dirname, "cache", `${uid}.jpg`);
          const profileUrl = `https://graph.facebook.com/${uid}/picture?width=720&height=720`;

          try {
            const response = await axios({ url: profileUrl, method: "GET", responseType: "stream" });
            const writer = fs.createWriteStream(imgPath);
            response.data.pipe(writer);
            await new Promise((resolve, reject) => { writer.on("finish", resolve); writer.on("error", reject); });

            for (const threadID of user.threads) {
              api.sendMessage({
                body: msg,
                attachment: fs.createReadStream(imgPath),
                mentions: [{ tag: user.name, id: uid }]
              }, threadID);
            }
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
          } catch {
            for (const threadID of user.threads) {
              api.sendMessage({
                body: msg,
                mentions: [{ tag: user.name, id: uid }]
              }, threadID);
            }
          }
        }
      }
    } catch (e) {
      console.log("❌ Birthday error:", e);
    }
  }, 60000); // প্রতি ১ মিনিটে চেক
};

// =====================================
// COMMAND: setbd (শুধু কমান্ড, ডেট লাগবে না)
// =====================================
module.exports.run = async function ({ api, event, args, Users, Threads }) {
  const data = fs.readJsonSync(dataPath);

  let uid = event.senderID;
  let name = await Users.getNameUser(uid);

  // মেনশন / রিপ্লে / UID ডিটেক্ট
  if (event.mentions && Object.keys(event.mentions).length > 0) {
    uid = Object.keys(event.mentions)[0];
    name = event.mentions[uid];
  } else if (event.messageReply) {
    uid = event.messageReply.senderID;
    name = await Users.getNameUser(uid);
  } else if (args[0] && /^\d+$/.test(args[0])) {
    uid = args[0];
    name = await Users.getNameUser(uid) || "Unknown";
  }

  // ===== ডিলিট কমান্ড =====
  if (args[0] && args[0].toLowerCase() === "delete") {
    if (!data[uid]) {
      return api.sendMessage("❌ এই ইউজারের কোনো জন্মদিন সংরক্ষিত নেই।", event.threadID);
    }
    delete data[uid];
    fs.writeJsonSync(dataPath, data, { spaces: 2 });
    return api.sendMessage(`✅ ${name} এর জন্মদিন ডিলিট করা হয়েছে।`, event.threadID);
  }

  // ===== ইতিমধ্যে সেট থাকলে =====
  if (data[uid]) {
    return api.sendMessage(
`❌ ${name} এর জন্মদিন ইতিমধ্যে সেট করা আছে।
📅 তারিখ: ${data[uid].birthday}
🔄 আপডেট করতে: setbd delete দিয়ে ডিলিট করে আবার সেট করুন।`,
      event.threadID
    );
  }

  // ===== বর্তমান তারিখ (আজকের) সেট =====
  const today = moment.tz("Asia/Dhaka").format("DD/MM");

  // সব থ্রেডের তালিকা
  const allThreads = await Threads.getAll().catch(() => []);
  const threadIDs = allThreads.map(t => t.threadID);

  // ডেটা সেভ
  data[uid] = {
    name: name,
    birthday: today,
    threads: threadIDs
  };

  fs.writeJsonSync(dataPath, data, { spaces: 2 });

  // কনফর্মেশন মেসেজ
  return api.sendMessage(
`╔══════════════════════╗
      ✅ BIRTHDAY SAVED
╚══════════════════════╝

👤 Name: ${name}
🎂 Birthday: ${today} (আজকের তারিখ)
⏰ Auto Wish: আজকের রাত ১২:০০ টায় (বাংলাদেশ সময়)
📸 Profile Photo: হ্যাঁ (সাথে দেখাবে)

📌 মনে রাখবেন: আপনি যাকে সেট করলেন, আজকের রাত ১২টায় ওই ইউজারকে মেনশন + ফটো সহ উইশ যাবে।

╔══════════════════════╗
     M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐
╚══════════════════════╝`,
    event.threadID
  );
};
