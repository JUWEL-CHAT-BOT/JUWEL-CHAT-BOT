module.exports.config = {
  name: "restart",
  version: "1.5.0",
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
`╔════════════════════╗
   ⚡ 𝗙𝗔𝗦𝗧 𝗥𝗘𝗦𝗧𝗔𝗥𝗧
╚════════════════════╝

🔄 𝗦𝗧𝗔𝗧𝗨𝗦: 𝗦𝗧𝗔𝗥𝗧𝗜𝗡𝗚...
📊 𝗣𝗥𝗢𝗚𝗥𝗘𝗦𝗦: 0%
[░░░░░░░░░░]

━━━━━━━━━━━━━━━━━━`,
    threadID,
    messageID
  );

  const interval = setInterval(() => {
    percent += Math.floor(Math.random() * 35) + 15;

    if (percent >= 100) percent = 100;

    api.editMessage(
`╔════════════════════╗
   ⚡ 𝗙𝗔𝗦𝗧 𝗥𝗘𝗦𝗧𝗔𝗥𝗧
╚════════════════════╝

🔄 𝗦𝗧𝗔𝗧𝗨𝗦: 𝗥𝗨𝗡𝗡𝗜𝗡𝗚...
📊 𝗣𝗥𝗢𝗚𝗥𝗘𝗦𝗦: ${percent}%
[${bar(percent)}]

━━━━━━━━━━━━━━━━━━`,
      msg.messageID
    );

    if (percent === 100) {
      clearInterval(interval);

      setTimeout(() => {
        api.editMessage(
`╔════════════════════╗
   ✅ 𝗥𝗘𝗦𝗧𝗔𝗥𝗧 𝗖𝗢𝗠𝗣𝗟𝗘𝗧𝗘
╚════════════════════╝

🤖 𝗕𝗢𝗧 𝗢𝗡𝗟𝗜𝗡𝗘 𝗔𝗚𝗔𝗜𝗡 ⚡
🚀 𝗥𝗘𝗔𝗗𝗬 𝗧𝗢 𝗨𝗦𝗘

━━━━━━━━━━━━━━━━━━`,
          msg.messageID
        );

        setTimeout(() => {
          process.exit(2);
        }, 1000);
      }, 500);
    }
  }, 500);
};
