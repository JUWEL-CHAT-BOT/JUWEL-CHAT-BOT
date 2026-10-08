module.exports.config = {
	name: "adduser",
	version: "5.2.0",
	hasPermssion: 0,
	credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
	description: "Add user to group by UID or Facebook link (bot admin only)",
	commandCategory: "group",
	usages: "[uid/link]",
	cooldowns: 5,
	usePrefix: true
};

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

//━━━━━━━━━━━━━━━
// ✅ GET UID FROM LINK
//━━━━━━━━━━━━━━━
async function getUID(url) {
	try {
		if (!url.includes("facebook.com") && !url.includes("fb.com"))
			return [null, null, true];
		if (!url.startsWith("http")) url = "https://" + url;

		const res = await axios.get(url, {
			headers: { "user-agent": "Mozilla/5.0" },
			timeout: 10000
		});
		const data = res.data;

		let uid =
			data.match(/"userID":"(\d+)"/)?.[1] ||
			data.match(/"entity_id":"(\d+)"/)?.[1] ||
			data.match(/"profile_id":"(\d+)"/)?.[1] ||
			data.match(/profile\.php\?id=(\d+)/)?.[1];

		let name =
			data.match(/<title>(.*?)<\/title>/)?.[1]?.replace(" | Facebook", "") ||
			"Facebook User";

		if (!uid) return [null, null, true];
		return [uid, name, false];
	} catch (e) {
		return [null, null, true];
	}
}

//━━━━━━━━━━━━━━━
// ✅ CHECK BOT ADMIN (config.json)
//━━━━━━━━━━━━━━━
function isBotAdmin(senderID) {
	try {
		const configPath = path.join(__dirname, "..", "..", "config.json");
		if (!fs.existsSync(configPath)) return false;

		const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
		const admins = (config.ADMINBOT || []).map(String);
		return admins.includes(String(senderID));
	} catch (e) {
		return false;
	}
}

//━━━━━━━━━━━━━━━
// ✅ SAFE getThreadInfo
//━━━━━━━━━━━━━━━
async function safeGetThreadInfo(api, threadID) {
	try {
		// Method 1: getThreadInfo
		if (typeof api.getThreadInfo === "function") {
			const info = await api.getThreadInfo(threadID);
			if (info) return info;
		}
	} catch (e) {
		console.log("[adduser] getThreadInfo failed:", e.message);
	}

	try {
		// Method 2: getThreadInfo (older) / getThreadList
		if (typeof api.getThreadList === "function") {
			const list = await api.getThreadList(50, null, ["INBOX"]);
			const t = list.find(x => x.threadID == threadID);
			if (t) return t;
		}
	} catch (e) {
		console.log("[adduser] getThreadList failed:", e.message);
	}

	return null;
}

//━━━━━━━━━━━━━━━
// ✅ MAIN RUN
//━━━━━━━━━━━━━━━
module.exports.run = async function ({ api, event, args }) {
	const { threadID, messageID, senderID } = event;
	const botID = api.getCurrentUserID();
	const send = (msg) => api.sendMessage(msg, threadID, messageID);

	// ❌ BOT ADMIN CHECK
	if (!isBotAdmin(senderID)) {
		return send(`╭━━━❌ ACCESS DENIED ❌━━━╮
┃
┃ ⚠️ শুধুমাত্র BOT ADMIN এই কমান্ড
┃ ব্যবহার করতে পারবে!
╰━━━━━━━━━━━━━━━━━━╯`);
	}

	// ❌ NO INPUT
	if (!args[0]) {
		return send(`╭━━━📌 ADDUSER SYSTEM 📌━━━╮
┃
┃ ➤ উদাহরণ:
┃ /adduser 1000xxxxxxxx
┃ /adduser https://facebook.com/xxx
╰━━━━━━━━━━━━━━━━━━╯`);
	}

	// ✅ THREAD INFO (safe)
	const loadingMsg = await api.sendMessage(
		`╭━━━⏳ PROCESSING ⏳━━━╮
┃
┃ 🔍 User Checking...
┃ 📡 Collecting UID...
┃ ⚙️ Preparing Add System...
╰━━━━━━━━━━━━━━━━━━╯`,
		threadID
	);

	const threadInfo = await safeGetThreadInfo(api, threadID);

	// ⚠️ Fallback: threadInfo না পেলেও কাজ চালু রাখবো
	let participantIDs = [];
	let adminIDs = [];
	let isBotAdminInGroup = false;

	if (threadInfo) {
		participantIDs = (threadInfo.participantIDs || []).map(String);
		adminIDs = (threadInfo.adminIDs || []).map(e => String(e.id || e));
		isBotAdminInGroup = adminIDs.includes(String(botID));
	}

	// UID / LINK
	let uid;
	let name = "Facebook User";

	if (!isNaN(args[0])) {
		uid = String(args[0]);
	} else {
		const [id, userName, fail] = await getUID(args[0]);
		if (fail || !id) {
			api.unsendMessage(loadingMsg.messageID);
			return send(`╭━━━❌ FAILED ❌━━━╮
┃
┃ ⚠️ Facebook UID বের করা যায়নি!
╰━━━━━━━━━━━━━━━━━━╯`);
		}
		uid = String(id);
		name = userName;
	}

	// ALREADY IN GROUP (শুধু info থাকলে চেক করবো)
	if (participantIDs.length > 0 && participantIDs.includes(uid)) {
		api.unsendMessage(loadingMsg.messageID);
		return send(`╭━━━⚠️ USER EXIST ⚠️━━━╮
┃
┃ 👤 ${name}
┃ 🆔 ${uid}
┃
┃ আগে থেকেই গ্রুপে আছে।
╰━━━━━━━━━━━━━━━━━━╯`);
	}

	//━━━━━━━━━━━━━━━
	// ✅ ADD USER
	//━━━━━━━━━━━━━━━
	try {
		// 🔥 Argument order try: (userID, threadID)
		await api.addUserToGroup(uid, threadID);

		api.unsendMessage(loadingMsg.messageID);

		if (!isBotAdminInGroup && threadInfo) {
			return send(`╭━━━⏳ WAITING ADMIN ⏳━━━╮
┃
┃ 👤 Name : ${name}
┃ 🆔 UID  : ${uid}
┃
┃ ✅ Join request পাঠানো হয়েছে।
┃ ⚠️ বট এডমিন নয়, তাই
┃ গ্রুপ এডমিন Approve করলে
┃ ইউজার যোগ হবে।
╰━━━━━━━━━━━━━━━━━━╯`);
		}

		return send(`╭━━━✅ USER ADDED ✅━━━╮
┃
┃ 👤 Name : ${name}
┃ 🆔 UID  : ${uid}
┃
┃ 🎉 সফলভাবে গ্রুপে এড করা হয়েছে!
╰━━━━━━━━━━━━━━━━━━╯`);

	} catch (e) {
		console.log("[adduser] addUserToGroup error:", e);

		// 🔁 Argument order swap try
		try {
			await api.addUserToGroup(threadID, uid);
			api.unsendMessage(loadingMsg.messageID);
			return send(`╭━━━✅ USER ADDED ✅━━━╮
┃
┃ 👤 Name : ${name}
┃ 🆔 UID  : ${uid}
┃
┃ 🎉 সফলভাবে গ্রুপে এড করা হয়েছে!
╰━━━━━━━━━━━━━━━━━━╯`);
		} catch (e2) {
			api.unsendMessage(loadingMsg.messageID);
			return send(`╭━━━❌ ADD FAILED ❌━━━╮
┃
┃ ⚠️ ইউজারকে এড করা যায়নি!
┃
┃ 📌 Possible Reasons:
┃ • Profile Locked
┃ • Add Option Off
┃ • Bot Blocked
┃ • Invalid UID
┃ • Bot Not Admin in Group
┃
┃ 🛠 Error: ${(e.message || "Unknown").slice(0, 100)}
╰━━━━━━━━━━━━━━━━━━╯`);
		}
	}
};
