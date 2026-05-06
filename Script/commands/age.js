module.exports = {
  config: {
    name: "age",
    version: "2.5",
    author: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
    hasPermission: 0,
    commandCategory: "utility",
    cooldowns: 5,
    description: "Calculate age with beautiful UI",
    usage: "[DD/MM/YYYY]"
  },

  run: async function ({ api, event, args }) {
    const moment = require("moment-timezone");

    try {

      // HELP UI
      if (!args[0]) {
        return api.sendMessage(
`╔════════════════════╗
      🎂 AGE COMMAND
╚════════════════════╝

📌 ব্যবহার:
➤ age DD/MM/YYYY

📌 উদাহরণ:
➤ age 16/12/2006

✨ ফিচার:
✔ বয়স হিসাব
✔ Next Birthday countdown
✔ সুন্দর UI রিপোর্ট

╔════════════════════╗`,
          event.threadID,
          event.messageID
        );
      }

      const [day, month, year] = args[0].split("/").map(Number);

      if (!day || day < 1 || day > 31)
        return api.sendMessage("❌ ভুল দিন", event.threadID);

      if (!month || month < 1 || month > 12)
        return api.sendMessage("❌ ভুল মাস", event.threadID);

      if (!year || year > new Date().getFullYear())
        return api.sendMessage("❌ ভুল সাল", event.threadID);

      const now = moment.tz("Asia/Dhaka");
      const birth = moment.tz(`${year}-${month}-${day}`, "YYYY-MM-DD", "Asia/Dhaka");

      if (birth.isAfter(now)) {
        return api.sendMessage("❌ ভবিষ্যতের তারিখ দেওয়া যাবে না", event.threadID);
      }

      // AGE CALC
      const duration = moment.duration(now.diff(birth));
      const years = duration.years();
      const months = duration.months();
      const days = duration.days();

      const totalDays = Math.floor(duration.asDays());

      // NEXT BIRTHDAY
      let nextBirthday = moment.tz(
        `${now.year()}-${month}-${day}`,
        "YYYY-MM-DD",
        "Asia/Dhaka"
      );

      if (nextBirthday.isBefore(now)) {
        nextBirthday = nextBirthday.add(1, "year");
      }

      const diffDays = nextBirthday.diff(now, "days");
      const diffHours = nextBirthday.diff(now, "hours") % 24;
      const diffMinutes = nextBirthday.diff(now, "minutes") % 60;

      const msg =
`╔════════════════════╗
        🎂 AGE RESULT
╚════════════════════╝

👤 জন্ম তারিখ : ${day}/${month}/${year}

🧓 বয়স:
➤ ${years} বছর
➤ ${months} মাস
➤ ${days} দিন

📊 মোট সময়:
➤ ${totalDays} দিন

🎉 Next Birthday:
⏳ বাকি: ${diffDays} দিন ${diffHours} ঘন্টা ${diffMinutes} মিনিট

╔════════════════════╗
     ✨ Thank You ✨
╚════════════════════╝`;

      return api.sendMessage(msg, event.threadID, event.messageID);

    } catch (e) {
      console.log(e);
      api.sendMessage("❌ কিছু সমস্যা হয়েছে", event.threadID);
    }
  }
};
