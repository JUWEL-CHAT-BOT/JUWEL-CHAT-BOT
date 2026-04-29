module.exports.config = {
  name: "blacklist",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
  description: "Add/remove blacklist user",
  commandCategory: "admin",
  usages: "[add/remove] [uid]",
  cooldowns: 3
};

const fs = require("fs-extra");
const path = require("path");

const filePath = path.join(__dirname, "../events/cache/blacklist.json");

function load() {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath));
}

function save(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports.run = async function ({ api, event, args }) {
  let list = load();

  const action = args[0];
  const uid = args[1];

  if (!action || !uid) {
    return api.sendMessage("Usage: blacklist add/remove uid", event.threadID);
  }

  if (action === "add") {
    if (!list.includes(uid)) {
      list.push(uid);
      save(list);
      return api.sendMessage("✅ User added to blacklist", event.threadID);
    }
  }

  if (action === "remove") {
    list = list.filter(id => id != uid);
    save(list);
    return api.sendMessage("✅ User removed from blacklist", event.threadID);
  }
};
