const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "setpp",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "Reply photo and set bot profile picture",
  commandCategory: "admin",
  usages: "Reply to an image",
  cooldowns: 5
};

module.exports.run = async function ({ api, event }) {
  try {
    const reply = event.messageReply;

    if (!reply || !reply.attachments || reply.attachments.length === 0) {
      return api.sendMessage(
        "❌ কোনো ছবিতে রিপ্লাই করে setpp কমান্ড দিন।",
        event.threadID,
        event.messageID
      );
    }

    const attachment = reply.attachments[0];

    if (attachment.type !== "photo") {
      return api.sendMessage(
        "❌ শুধু ছবিতে রিপ্লাই করুন।",
        event.threadID,
        event.messageID
      );
    }

    const imgPath = path.join(__dirname, "cache", `avatar_${Date.now()}.jpg`);

    const response = await axios({
      url: attachment.url,
      method: "GET",
      responseType: "stream"
    });

    const writer = fs.createWriteStream(imgPath);
    response.data.pipe(writer);

    writer.on("finish", async () => {
      try {
        await api.changeAvatar(
          fs.createReadStream(imgPath)
        );

        fs.unlinkSync(imgPath);

        api.sendMessage(
          "✅ বটের প্রোফাইল পিকচার সফলভাবে পরিবর্তন করা হয়েছে।",
          event.threadID,
          event.messageID
        );
      } catch (e) {
        console.log(e);
        api.sendMessage(
          "❌ আপনার FCA/Mirai ভার্সনে changeAvatar সাপোর্ট নেই।",
          event.threadID,
          event.messageID
        );
      }
    });

    writer.on("error", (err) => {
      console.log(err);
      api.sendMessage(
        "❌ ছবি ডাউনলোড করা যায়নি।",
        event.threadID,
        event.messageID
      );
    });

  } catch (err) {
    console.log(err);
    api.sendMessage(
      "❌ একটি ত্রুটি হয়েছে।",
      event.threadID,
      event.messageID
    );
  }
};
