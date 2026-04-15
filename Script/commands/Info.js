module.exports.config = {
  name: "info",
  version: "1.2.6",
  hasPermssion: 0,
  credits: "MR JUWEL",
  description: "Bot information command",
  commandCategory: "For users",
  hide: true,
  usages: "",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, args, Users, Threads }) {
  const { threadID } = event;

  const request = global.nodemodule["request"];
  const fs = global.nodemodule["fs-extra"];
  const os = require("os");

  const { configPath } = global.client;
  delete require.cache[require.resolve(configPath)];
  const config = require(configPath);

  const { commands } = global.client;

  const threadSetting = (await Threads.getData(String(threadID))).data || {};
  const prefix = threadSetting.hasOwnProperty("PREFIX")
    ? threadSetting.PREFIX
    : config.PREFIX;

  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  const totalUsers = global.data.allUserID.length;
  const totalThreads = global.data.allThreadID.length;

  // ================= SYSTEM INFO (NEW FEATURES) =================
  const totalMem = (os.totalmem() / 1024 / 1024).toFixed(2);
  const freeMem = (os.freemem() / 1024 / 1024).toFixed(2);
  const usedMem = (totalMem - freeMem).toFixed(2);

  const cpuModel = os.cpus()[0].model;
  const platform = os.platform();

  const restartTime = new Date(Date.now() - process.uptime() * 1000);

  const latestVersion = "1.2.6";
  const isUpToDate =
    latestVersion === module.exports.config.version
      ? "🟢 Updated"
      : "🔴 Update Available";

  // ================= ORIGINAL MSG (UNCHANGED) =================
  const msg = `╭⭓ ⪩ 𝐁𝐎𝐓𝐓 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍 ⪨
│
├─ 🤖 𝗕𝗼𝘁 𝗡𝗮𝗺𝗲 :⎯꯭𓆩꯭𝆺𝅥😻⃞𝐑⃞𝐈⃞𝐘𝐀⃞༢࿐
├─ ☢️ 𝗣𝗿𝗲𝗳𝗶𝘅 : ${config.PREFIX}
├─ ♻️ 𝗣𝗿𝗲𝗳𝗶𝘅 𝗕𝗼𝘅 : ${prefix}
├─ 🔶 𝗠𝗼𝗱𝘂𝗹𝗲𝘀 : ${commands.size}
├─ 🔰 𝗣𝗶𝗻𝗴 : ${Date.now() - event.timestamp}ms
│
╰───────⭓

╭⭓ ⪩ 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢 ⪨
│
├─ 👑 𝗡𝗮𝗺𝗲 :⎯꯭𓆩꯭𝆺𝅥😻⃞𝐌⃞𝆠፝֟𝐑᭄ღ倫 𝐉⃞𝐔⃞𝐖⃞𝐄⃞𝐋༢࿐
├─ 📲 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 :
│ fb.com/mrjuwel2025
├─ 💌 𝗠𝗲𝘀𝘀𝗲𝗻𝗴𝗲𝗿 :
│ https://www.facebook.com/share/1DKK1FYumD/
├─ 📞 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 :
│ +8801943488192
│
╰───────⭓

╭⭓ ⪩ 𝗔𝗖𝗧𝗜𝗩𝗜𝗧𝗜𝗘𝗦 ⪨
│
├─ ⏳ 𝗔𝗰𝘁𝗶𝘃𝗲 𝗧𝗶𝗺𝗲 : ${hours}h ${minutes}m ${seconds}s
├─ 📣 𝗚𝗿𝗼𝘂𝗽𝘀 : ${totalThreads}
├─ 🧿 𝗧𝗼𝘁𝗮𝗹 𝗨𝘀𝗲𝗿𝘀 : ${totalUsers}
╰───────⭓

❤️ 𝗧𝗵𝗮𝗻𝗸𝘀 𝗳𝗼𝗿 𝘂𝘀𝗶𝗻𝗴 🌺
 ⎯꯭𓆩꯭𝆺𝅥😻⃞𝐑⃞𝐈⃞𝐘𝐀⃞༢࿐`;

  // ================= ADD-ON PANEL =================
  const extraInfo = `
╭⭓ ⪩ 𝗦𝗬𝗦𝗧𝗘𝗠 𝗣𝗘𝗥𝗙𝗢𝗥𝗠𝗔𝗡𝗖𝗘 ⪨
│
├─ 🧠 RAM Total : ${totalMem} MB
├─ 📉 RAM Used : ${usedMem} MB
├─ 🧊 RAM Free : ${freeMem} MB
├─ ⚙️ CPU : ${cpuModel}
├─ 💻 Platform : ${platform}
╰───────⭓

╭⭓ ⪩ 𝗦𝗘𝗥𝗩𝗘𝗥 𝗦𝗧𝗔𝗧𝗨𝗦 ⪨
│
├─ 🔄 Restart : ${restartTime.toLocaleString()}
├─ ⏱️ Uptime : ${Math.floor(process.uptime())}s
├─ 📊 Status : 🟢 Running
╰───────⭓

╭⭓ ⪩ 𝗨𝗣𝗗𝗔𝗧𝗘 𝗦𝗧𝗔𝗧𝗨𝗦 ⪨
│
├─ 📌 Version : ${module.exports.config.version}
├─ 📡 Status : ${isUpToDate}
╰───────⭓
`;

  const finalMsg = msg + extraInfo;

  const imgLinks = [
    "https://i.imgur.com/mRKeGX0.jpeg",
  ];

  const imgLink = imgLinks[Math.floor(Math.random() * imgLinks.length)];

  const path = __dirname + "/cache";
  if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });

  const filePath = path + "/info.jpg";

  const callback = () => {
    try {
      api.sendMessage(
        {
          body: finalMsg,
          attachment: fs.createReadStream(filePath),
        },
        threadID,
        () => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      );
    } catch (e) {
      api.sendMessage(finalMsg, threadID);
    }
  };

  request(encodeURI(imgLink))
    .pipe(fs.createWriteStream(filePath))
    .on("close", callback)
    .on("error", () => api.sendMessage(finalMsg, threadID));
};
