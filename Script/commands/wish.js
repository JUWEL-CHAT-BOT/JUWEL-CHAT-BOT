module.exports.config = {
  name: "wish",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "Happy birthday wish for your friends",
  commandCategory: "JUWEL ",
  usages: "@tag",
  dependencies: {
    axios: "latest",
    "fs-extra": "latest",
    canvas: "latest"
  },
  cooldowns: 0
};

// Global store for scheduled wishes (in-memory)
let scheduledWishes = {};

module.exports.wrapText = (ctx, text, maxWidth) => {
  return new Promise(resolve => {
    if (ctx.measureText(text).width < maxWidth) return resolve([text]);
    if (ctx.measureText("W").width > maxWidth) return resolve(null);

    const words = text.split(" ");
    const lines = [];
    let line = "";

    while (words.length > 0) {
      let split = false;
      while (ctx.measureText(words[0]).width >= maxWidth) {
        const word = words[0];
        words[0] = word.slice(0, -1);
        if (split) {
          words[1] = word.slice(-1) + words[1];
        } else {
          split = true;
          words.splice(1, 0, word.slice(-1));
        }
      }

      if (ctx.measureText(line + words[0]).width < maxWidth) {
        line += words.shift() + " ";
      } else {
        lines.push(line.trim());
        line = "";
      }

      if (words.length === 0) {
        lines.push(line.trim());
      }
    }
    return resolve(lines);
  });
};

/**
 * Generate the wish image and message body for a given target and wisher.
 * NOTE: Users is now passed explicitly instead of relying on global.client.users
 */
async function createWish(targetID, wisherName, api, Users) {
  const { loadImage, createCanvas } = require("canvas");
  const fs = require("fs-extra");
  const axios = require("axios");

  // make sure cache folder exists
  const cacheDir = __dirname + "/cache";
  fs.ensureDirSync(cacheDir);

  // give each call a unique filename so concurrent wishes don't clash
  const uniqueTag = Date.now() + "_" + targetID;
  const bgPath = `${cacheDir}/background_${uniqueTag}.png`;
  const avtPath = `${cacheDir}/Avtmot_${uniqueTag}.png`;

  const targetName = await Users.getNameUser(targetID);

  const bgURLs = ["https://i.postimg.cc/k4RS69d8/20230921-195836.png"];
  const bgURL = bgURLs[Math.floor(Math.random() * bgURLs.length)];

  let avtData = (await axios.get(
    `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
    { responseType: "arraybuffer" }
  )).data;
  // FIX: don't force "utf-8" on binary data, it corrupts the image
  fs.writeFileSync(avtPath, Buffer.from(avtData));

  let bgData = (await axios.get(bgURL, { responseType: "arraybuffer" })).data;
  fs.writeFileSync(bgPath, Buffer.from(bgData));

  let bgImage = await loadImage(bgPath);
  let avtImage = await loadImage(avtPath);
  let canvas = createCanvas(bgImage.width, bgImage.height);
  let ctx = canvas.getContext("2d");

  ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
  ctx.font = "400 32px Arial";
  ctx.fillStyle = "#1878F3";
  ctx.textAlign = "start";

  // FIX: call wrapText directly off module.exports instead of "this"
  const nameLines = await module.exports.wrapText(ctx, targetName, 1160);
  if (nameLines) {
    ctx.fillText(nameLines.join("\n"), 120, 727);
  }

  ctx.beginPath();
  ctx.drawImage(avtImage, 70, 270, 400, 400);

  const imageBuffer = canvas.toBuffer();
  fs.writeFileSync(bgPath, imageBuffer);
  fs.removeSync(avtPath);

  // Build the wish message
  const body =
    "┏┓┏┓\n" +
    "┃┗┛ 𝒂𝒑𝒑𝒚_🎂🎆🎉\n" +
    "┃┏┓┃ 🄱🄸🅁🅃🄷🄳🄰🅈🎉🎆\n" +
    "┗┛┗┛ Birthday Wishes For You..💐💗\n" +
    "🥰 " + targetName + " 😘\n\n" +
    "_𝐇𝐚𝐩𝐩𝐲 𝐛𝐢𝐫𝐭𝐡𝐝𝐚𝐲 🎂_\n" +
    "অনেক অনেক শুভ কামনা, দোয়া ও ভালবাসা রইল তোমার জন্য ❤\n" +
    "তোমার জীবনের প্রতিটা ক্ষণ আনন্দময় হোক এই কামনা করি...\n" +
    "শুভ জন্মদিন 🎂🎂🎂\n" +
    "🌷🌷\n\n" +
    "_𝐇𝐚𝐩𝐩𝐲 𝐁𝐢𝐫𝐭𝐡𝐝𝐚𝐲 𝐖𝐢𝐬𝐡𝐞𝐬 𝐟𝐨𝐫 𝐔😍_\n" +
    "𝐈 𝐰𝐢𝐬𝐡 𝐮 𝐦𝐚𝐧𝐲 𝐦𝐨𝐫𝐞 𝐡𝐚𝐩𝐩𝐲 𝐫𝐞𝐭𝐮𝐫𝐧𝐬 𝐨𝐟 𝐭𝐡𝐞 𝐝𝐚𝐲 💞\n\n" +
    "🖤 আশা করি সারাজীবন এমনই থাকবা, সবসময় ভালো থাকো এই কামনা করি\n" +
    "❤ জন্মদিনে শুধু এটাই কাম‍্য যাতে ভবিষ্যতে অনেক অনেক সুখী হও ❤\n" +
    "শুভ জন্মদিন 🫂 ❤️‍🩹\n\n" +
    "𝐌𝐚𝐤𝐢𝐧𝐠 𝐭𝐡𝐢𝐬 𝐰𝐢𝐬𝐡:" + wisherName;

  return {
    body: body,
    attachment: fs.createReadStream(bgPath),
    bgPath: bgPath // returned so caller can clean it up after sending
  };
}

/**
 * Calculate milliseconds until next midnight (00:00).
 */
function getDelayToMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0); // tomorrow 00:00
  return midnight.getTime() - now.getTime();
}

/**
 * Format milliseconds into HH:MM:SS remaining.
 */
function formatTimeRemaining(ms) {
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return `${hours} ঘন্টা ${minutes} মিনিট ${seconds} সেকেন্ড`;
}

/**
 * Create a framed notice message.
 */
function createNotice(targetName, delayMs) {
  const timeStr = formatTimeRemaining(delayMs);
  const lines = [
    `  🎉 নোটিশ  🎉`,
    `  ${targetName} কে উইশ করা হবে আজ রাত ১২ টায় 🕛`,
    `  বাকি সময়: ${timeStr}`,
    `  ❤️ শুভ হোক সবকিছু`
  ];
  const width = Math.max(...lines.map(l => l.length)) + 4; // padding
  const border = "─".repeat(width - 2);

  let frame = "┌" + border + "┐\n";
  for (const line of lines) {
    const pad = width - line.length - 2;
    const leftPad = Math.floor(pad / 2);
    const rightPad = pad - leftPad;
    frame += "│" + " ".repeat(leftPad) + line + " ".repeat(rightPad) + "│\n";
  }
  frame += "└" + border + "┘";
  return frame;
}

module.exports.run = async function ({
  args,
  Users,
  Threads,
  api,
  event,
  Currencies
}) {
  try {
    // Determine target: mention > reply > sender
    let targetID = Object.keys(event.mentions)[0];
    if (!targetID && event.messageReply) {
      targetID = event.messageReply.senderID;
    }
    if (!targetID) {
      targetID = event.senderID;
    }

    const wisherName = await Users.getNameUser(event.senderID);
    const targetName = await Users.getNameUser(targetID);

    // If target is the sender himself, wish immediately (original behaviour)
    if (targetID === event.senderID) {
      const wishData = await createWish(targetID, wisherName, api, Users);
      return api.sendMessage(
        { body: wishData.body, attachment: wishData.attachment },
        event.threadID,
        () => {
          // cleanup background file after sending
          const fs = require("fs-extra");
          if (fs.existsSync(wishData.bgPath)) fs.unlinkSync(wishData.bgPath);
        },
        event.messageID
      );
    }

    // Otherwise, schedule the wish at midnight
    const delay = getDelayToMidnight();

    // Send the framed notice immediately
    const notice = createNotice(targetName, delay);
    await api.sendMessage(notice, event.threadID, event.messageID);

    // Create a unique ID for this scheduled task
    const taskId = Date.now() + "_" + targetID + "_" + event.threadID;

    // Schedule the actual wish
    scheduledWishes[taskId] = setTimeout(async () => {
      try {
        const wishData = await createWish(targetID, wisherName, api, Users);
        await api.sendMessage(
          { body: wishData.body, attachment: wishData.attachment },
          event.threadID,
          () => {
            const fs = require("fs-extra");
            if (fs.existsSync(wishData.bgPath)) fs.unlinkSync(wishData.bgPath);
          }
        );
      } catch (err) {
        console.error("Failed to send scheduled wish:", err);
      } finally {
        delete scheduledWishes[taskId];
      }
    }, delay);

    // Optionally, store the task ID in the thread data for persistence (advanced)
    // This simple version uses in-memory storage only.
  } catch (err) {
    console.error("wish command error:", err);
    return api.sendMessage(
      "❌ কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন।\n" + err.message,
      event.threadID,
      event.messageID
    );
  }
};
