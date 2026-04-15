const fs = require("fs-extra");
const axios = require("axios");

module.exports.config = {
  name: "helpall",
  version: "2.1.0",
  hasPermssion: 0,
  credits: "MR JUWEL",
  description: "Beautiful all command list (no prefix)",
  commandCategory: "system",
  usages: "[No args]",
  cooldowns: 5
};

// 🔥 MAIN FUNCTION
async function sendHelp(api, event) {
  const { commands } = global.client;
  const { threadID, messageID } = event;

  const allCommands = [...commands.keys()]
    .filter(cmd => cmd && cmd.trim() !== "")
    .map(cmd => cmd.trim())
    .sort();

  const finalText = `
╔══════════════════════╗
      🌸 𝐀𝐋𝐋 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒 🌸
╚══════════════════════╝

╭━━━━━━━━━━━━━━━━━━━━╮
${allCommands.map(cmd => `┃ 🔹 ${cmd}`).join("\n")}
╰━━━━━━━━━━━━━━━━━━━━╯

╔══════════════════════╗
         🔰 𝐁𝐎𝐓 𝐈𝐍𝐅𝐎 🔰
╚══════════════════════╝

╭━━━━━━━━━━━━━━━━━━━━╮
┃ 🤖 𝐍𝐚𝐦𝐞   : 𓆩꯭𝆺𝅥😻⃞𝐑⃞𝐈⃞𝐘⃞𝐀⃞༢࿐
┃ 👑 𝐎𝐰𝐧𝐞𝐫 : 𓆩꯭𝆺𝅥😻⃞𝐌⃞𝆠፝֟𝐑᭄ღ倫 𝐉⃞𝐔⃞𝐖⃞𝐄⃞𝐋༢࿐
┃ 📦 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 : ${allCommands.length}
╰━━━━━━━━━━━━━━━━━━━━╯

✨ 𝐓𝐘𝐏𝐄 𝐇𝐄𝐋𝐏 𝐀𝐍𝐘𝐓𝐈𝐌𝐄 ✨
`;

  const imgPath = __dirname + "/cache/helpallbg.jpg";
  const bg = "https://i.imgur.com/i64Kpz3.jpeg";

  try {
    const res = await axios({
      url: encodeURI(bg),
      method: "GET",
      responseType: "stream",
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const writer = fs.createWriteStream(imgPath);
    res.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage(
        {
          body: finalText,
          attachment: fs.createReadStream(imgPath)
        },
        threadID,
        () => fs.unlinkSync(imgPath),
        messageID
      );
    });

    writer.on("error", () => {
      api.sendMessage(finalText, threadID, messageID);
    });

  } catch {
    api.sendMessage(finalText, threadID, messageID);
  }
}

// 🔥 PREFIX COMMAND
module.exports.run = async function ({ api, event }) {
  return sendHelp(api, event);
};

// 🔥 NO PREFIX TRIGGER
module.exports.handleEvent = async function ({ api, event }) {
  const msg = (event.body || "").toLowerCase();

  if (msg === "Helpall" || msg === "helpall" || msg === "allcmd") {
    return sendHelp(api, event);
  }
};
