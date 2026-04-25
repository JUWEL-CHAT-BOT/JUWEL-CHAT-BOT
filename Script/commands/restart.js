module.exports.config = {
  name: "restart",
  version: "1.4.0",
  hasPermssion: 0,
  credits: "𝐌𝐑 𝐉𝐔𝐖𝐄𝐋",
  description: "Fast restart system ⚡",
  commandCategory: "Admin",
  usages: "restart",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  let percent = 0;

  const bar = (p) => {
    const total = 10;
    const filled = Math.round((p / 100) * total);
    return "█".repeat(filled) + "░".repeat(total - filled);
  };

  let msg = await api.sendMessage(
`🔄 𝗥𝗘𝗦𝗧𝗔𝗥𝗧 𝗜𝗡𝗜𝗧...

📊 Progress: 0%
[░░░░░░░░░░]`,
    threadID,
    messageID
  );

  const interval = setInterval(() => {
    // ⚡ দ্রুত increment (fast mode)
    percent += Math.floor(Math.random() * 35) + 15; // 15%–50% jump

    if (percent >= 100) percent = 100;

    api.editMessage(
`🔄 𝗥𝗘𝗦𝗧𝗔𝗥𝗧𝗜𝗡𝗚...

📊 Progress: ${percent}%
[${bar(percent)}]

⚡ Fast mode running...`,
      msg.messageID
    );

    if (percent === 100) {
      clearInterval(interval);

      setTimeout(() => {
        api.editMessage(
`✅ 𝗥𝗘𝗦𝗧𝗔𝗥𝗧 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘

🤖 Bot online again ⚡`,
          msg.messageID
        );

        setTimeout(() => {
          process.exit(2);
        }, 1000);
      }, 500);
    }
  }, 500); // ⚡ faster loop (0.5s)
};
