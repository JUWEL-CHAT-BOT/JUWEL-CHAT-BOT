const fs = require('fs');
const request = require("request");

module.exports.config = {
  name: "noti2",
  version: "1.0.1",
  hasPermssion: 2,
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "Admin broadcast with two-way reply relay",
  commandCategory: "sandnoto",
  usages: "[msg]",
  cooldowns: 5
};

let atmDir = [];

// ---------- ATTACHMENT DOWNLOADER ----------
const getAtm = (attachments, body) => new Promise(async (resolve) => {
  const messageData = { body };
  const streams = [];

  for (const att of attachments) {
    await new Promise(async (done) => {
      try {
        const res = await request.get(att.url);
        const pathname = res.uri.pathname;
        const ext = pathname.substring(pathname.lastIndexOf('.') + 1);
        const filePath = __dirname + "/cache/" + att.filename + "." + ext;

        res.pipe(fs.createWriteStream(filePath)).on("close", () => {
          streams.push(fs.createReadStream(filePath));
          atmDir.push(filePath);
          done();
        });
      } catch (err) {
        console.log("getAtm error:", err);
        done(); // fail হলেও loop এগোবে
      }
    });
  }

  messageData.attachment = streams;
  resolve(messageData);
});

// ---------- REPLY HANDLER ----------
module.exports.handleReply = async function ({
  api,
  event,
  handleReply,
  Users,
  Threads
}) {
  const { threadID, messageID, senderID, body } = event;

  // নিজের (অ্যাডমিনের) মেসেজে রিপ্লাই ignore
  if (senderID == api.getCurrentUserID()) return;

  const senderName = await Users.getNameUser(senderID);

  switch (handleReply.type) {

    // ==== ইউজার অ্যাডমিনের নোটিশে রিপ্লাই দিচ্ছে ====
    case "sendnoti": {
      let groupName = "Unknow";
      try {
        const info = await Threads.getInfo(threadID);
        groupName = info.threadName || "Unknow";
      } catch (e) {}

      let msg =
        "== User Reply ==\n\n" +
        "『Reply』 : " + body + "\n\n\n" +
        "User Name: " + senderName + "\n" +
        "From Group: " + groupName;

      // অ্যাডমিনের কাছে পাঠানোর সময় caption
      const adminCaption =
        "== User Reply ==\n\n" +
        "『Reply』 : " + body + "\n\n\n" +
        "User Name: " + senderName + "\n" +
        "From Group: " + groupName;

      let sendData = adminCaption;

      if (event.attachments && event.attachments.length > 0) {
        sendData = await getAtm(event.attachments, adminCaption);
      }

      // ✅ অ্যাডমিনের (original) thread এ পাঠানো
      api.sendMessage(sendData, handleReply.threadID, (err, info) => {
        // temp file cleanup
        atmDir.forEach(f => { try { fs.unlinkSync(f); } catch (e) {} });
        atmDir = [];

        if (err) return console.log("sendnoti reply error:", err);

        // অ্যাডমিন আবার রিপ্লাই দিলে যেন ইউজারের কাছে যায়
        global.client.handleReply.push({
          name: this.config.name,
          type: "reply",
          messageID: info.messageID,
          messID: messageID,
          threadID: threadID // ইউজারের thread (reply ফেরত পাঠানোর জন্য)
        });
      }, messageID);

      break;
    }

    // ==== অ্যাডমিন ইউজারকে রিপ্লাই দিচ্ছে ====
    case "reply": {
      let userMsg =
        "𝐀𝐃𝐌𝐈𝐍 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍\n" +
        "•┄┅═════❁🌺❁═════┅┄•\n\n" +
        "｢𝐌𝐄𝐒𝐒𝐀𝐆𝐄｣ : " + body + "\n\n\n" +
        "｢𝗔𝗗𝗠𝗜𝗡｣ " + senderName + "\n\n" +
        "•┄┅═════❁🌺❁═════┅┄•\n" +
        "আপনি যদি এডমিন এর সঙ্গে কথা বলতে চান, তাহলে অবশ্যই এই মেসেজের রিপ্লাই দিয়ে মেসেজ করো। " +
        "আমি তা এডমিন এর কাছে পৌঁছে দিবো। সরাসরি এডমিনের সাথে কথা বলতে চাইলে নক করুন: fb.com/mrjuwel444";

      const userCaption =
        body + "\n\n" +
        "𝐀𝐃𝐌𝐈𝐍 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍\n" +
        "•┄┅═════❁🌺❁═════┅┄•\n\n" +
        "𝐀𝐃𝐌𝐈𝐍: " + senderName + "\n\n" +
        "•┄┅═════❁🌺❁═════┅┄•\n" +
        "আপনি যদি এডমিন এর সঙ্গে কথা বলতে চান, তাহলে অবশ্যই এই মেসেজের রিপ্লাই দিয়ে মেসেজ করো। " +
        "আমি তা এডমিন এর কাছে পৌঁছে দিবো। সরাসরি এডমিনের সাথে কথা বলতে চাইলে নক করুন: fb.com/mrjuwel444";

      let sendData = userMsg;

      if (event.attachments && event.attachments.length > 0) {
        sendData = await getAtm(event.attachments, userCaption);
      }

      // ✅ ইউজারের thread এ পাঠানো
      api.sendMessage(sendData, handleReply.threadID, (err, info) => {
        atmDir.forEach(f => { try { fs.unlinkSync(f); } catch (e) {} });
        atmDir = [];

        if (err) return console.log("reply error:", err);

        // ইউজার আবার রিপ্লাই দিলে যেন অ্যাডমিনের কাছে যায়
        global.client.handleReply.push({
          name: this.config.name,
          type: "sendnoti",
          messageID: info.messageID,
          threadID: handleReply.threadID // ⚠️ এখানে handleReply থেকে নিন
        });
      }, messageID);

      break;
    }
  }
};

// ---------- MAIN RUN ----------
module.exports.run = async function ({
  api,
  event,
  args,
  Users
}) {
  const { threadID, messageID, senderID, messageReply } = event;

  if (!args[0]) {
    return api.sendMessage("Please input message", threadID);
  }

  const allThreads = global.data.allThreadID || [];
  let successCount = 0;
  let failCount = 0;

  const adminName = await Users.getNameUser(senderID);
  const text = args.join(" ");

  let plainMsg =
    "𝐀𝐃𝐌𝐈𝐍 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍\n" +
    "•┄┅═════❁🌺❁═════┅┄•\n\n" +
    "𝐌𝐀𝐒𝐒𝐀𝐆𝐄: " + text + "\n\n" +
    "𝗔𝗗𝗠𝗜𝗡 𝗡𝗔𝗠𝗘: " + adminName;

  let sendData = plainMsg;

  // অ্যাডমিন যদি কোনো মেসেজে reply দিয়ে attachment সহ পাঠায়
  if (event.type == "message_reply" && messageReply && messageReply.attachments?.length > 0) {
    sendData = await getAtm(
      messageReply.attachments,
      "𝐌𝐀𝐒𝐒𝐀𝐆𝐄 𝐅𝐑𝐎𝐌 𝐀𝐃𝐌𝐈𝐍\n" +
      "•┄┅═════❁🌺❁═════┅┄•\n" +
      "𝐌𝐀𝐒𝐒𝐀𝐆𝐄: " + text + "\n\n" +
      "𝗔𝗗𝗠𝗜𝗡 𝗡𝗔𝗠𝗘: " + adminName
    );
  }

  // ✅ সব গ্রুপে পাঠানোর জন্য ঠিক করা Promise
  await new Promise((resolve) => {
    const total = allThreads.length;
    if (total === 0) return resolve();
    let done = 0;

    allThreads.forEach(tid => {
      try {
        api.sendMessage(sendData, tid, (err, info) => {
          done++;
          if (err) {
            failCount++;
          } else {
            successCount++;

            // ✅ প্রতিটি গ্রুপের জন্য handleReply পুশ — অ্যাডমিনের thread এ ফেরত আসবে
            global.client.handleReply.push({
              name: this.config.name,
              type: "sendnoti",
              messageID: info.messageID,
              messID: messageID,
              threadID: threadID // ⚠️ অ্যাডমিনের মূল thread (এখানেই রিপ্লাই আসবে)
            });
          }

          if (done === total) {
            // সব শেষ হলে temp file cleanup
            atmDir.forEach(f => { try { fs.unlinkSync(f); } catch (e) {} });
            atmDir = [];
            resolve();
          }
        });
      } catch (e) {
        console.log("send error:", e);
        done++;
        failCount++;
        if (done === total) resolve();
      }
    });
  });

  return api.sendMessage(
    `✅ Send to ${successCount} thread, ❌ not send to ${failCount} thread`,
    threadID
  );
};
