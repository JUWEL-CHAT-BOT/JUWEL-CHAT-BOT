const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const moment = require("moment-timezone");

module.exports.config = {
  name: "setbd",
  version: "3.0.0",
  hasPermssion: 0,
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "Premium Auto Birthday System",
  commandCategory: "utility",
  usages: "setbd DD/MM/YYYY",
  cooldowns: 5
};

const dataPath = path.join(__dirname, "birthdayData.json");
if (!fs.existsSync(dataPath)) fs.writeJsonSync(dataPath, {}, { spaces: 2 });

// =====================================
// AUTO BIRTHDAY SYSTEM
// =====================================
module.exports.onLoad = async function ({ api }) {
  setInterval(async () => {
    try {
      const data = fs.readJsonSync(dataPath);
      const now = moment.tz("Asia/Dhaka");
      const today = now.format("DD/MM");
      const hour = now.format("HH");
      const minute = now.format("mm");

      if (hour !== "00" || minute !== "00") return;

      for (const uid in data) {
        const user = data[uid];
        if (!user.birthday) continue;

        const [day, month] = user.birthday.split("/");

        if (`${day}/${month}` === today) {
          const msg =
`┓｡･ﾟﾟ･｡｡ﾟ💖
┃┗┛ ᵃᵖᵖʸ💜
┃┏┓┃ ᵇᶤʳᵗʰ✿
┗┛┗┛ ᵈᵃʸ*ﾟ✾

🎂 Happy Birthday ${user.name} 🎂

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
              api.sendMessage({ body: msg, attachment: fs.createReadStream(imgPath) }, threadID);
            }
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

          } catch {
            for (const threadID of user.threads) api.sendMessage(msg, threadID);
          }
        }
      }

    } catch (e) {
      console.log(e);
    }
  }, 60000);
};

// =====================================
// COMMAND SYSTEM
// =====================================
module.exports.run = async function ({ api, event, args, Users, Threads }) {
  const data = fs.readJsonSync(dataPath);

  let uid = event.senderID;
  let name = await Users.getNameUser(uid);

  if (event.mentions && Object.keys(event.mentions).length > 0) {
    uid = Object.keys(event.mentions)[0];
    name = event.mentions[uid];
  } else if (event.messageReply) {
    uid = event.messageReply.senderID;
    name = await Users.getNameUser(uid);
  }

  if (!args[0]) {
    return api.sendMessage(
`╭━━━━━━━━━━━━━━━━━━╮
┃ 🎂 BIRTHDAY SYSTEM
╰━━━━━━━━━━━━━━━━━━╯
📌 SET BIRTHDAY: setbd DD/MM/YYYY
💡 Mention/Reply someone to set their birthday too`,
      event.threadID
    );
  }

  if (args[0].toLowerCase() === "delete") {
    delete data[uid];
    fs.writeJsonSync(dataPath, data, { spaces: 2 });
    return api.sendMessage(`❌ ${name} এর Birthday Delete করা হয়েছে`, event.threadID);
  }

  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(args[0])) 
    return api.sendMessage("❌ ভুল ফরম্যাট\n➤ DD/MM/YYYY", event.threadID);

  const [day, month, year] = args[0].split("/").map(Number);
  const birth = moment(`${year}-${month}-${day}`, "YYYY-MM-DD");
  if (!birth.isValid()) return api.sendMessage("❌ ভুল জন্ম তারিখ", event.threadID);

  const birthdayDay = birth.format("dddd");
  const fbLink = `https://www.facebook.com/${uid}`;

  // সকল গুপে save
  const allThreads = await Threads.getAll().catch(() => []);
  const threadIDs = allThreads.map(t => t.threadID);

  data[uid] = {
    name,
    birthday: args[0],
    threads: threadIDs
  };

  fs.writeJsonSync(dataPath, data, { spaces: 2 });

  // ✅ SAVED MESSAGE
  return api.sendMessage(
`╔══════════════════════╗
      ✅ BIRTHDAY SAVED
╚══════════════════════╝

👤 Name
➤ ${name}

🎂 Birthday
➤ ${args[0]}

📅 Birthday Day
➤ ${birthdayDay}

🌐 Facebook Link
➤ ${fbLink}

⏰ Auto Wish
➤ Enabled Successfully

🔔 Reminder
➤ Enabled Successfully

╔══════════════════════╗
     M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐
╚══════════════════════╝`,
    event.threadID
  );
};
