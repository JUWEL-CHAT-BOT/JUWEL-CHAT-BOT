module.exports.config = {
	name: "adduser",
	version: "2.5.0",
	hasPermssion: 0,
	credits: "MR JUWEL",
	description: "Add user to the group by link or id (UID LOCKED)",
	commandCategory: "group",
	usages: "[id/link]",
	cooldowns: 5
};

// ✅ UID LOCK SYSTEM
const ALLOWED_UID = ["100071528325738"];

const axios = require("axios");

// ✅ CLEAN getUID (fix করা)
async function getUID(url) {
	try {
		if (!url.includes("facebook.com")) {
			return ["Invalid Facebook link!", null, true];
		}

		if (!url.startsWith("http")) url = "https://" + url;

		const res = await axios.get(url);
		const data = res.data;

		const uidMatch = data.match(/"userID":"(\d+)"/);
		const nameMatch = data.match(/<title>(.*?)<\/title>/);

		const uid = uidMatch ? uidMatch[1] : null;
		const name = nameMatch ? nameMatch[1] : "Facebook user";

		if (!uid) return [null, null, true];

		return [uid, name, false];

	} catch (err) {
		return [null, null, true];
	}
}

module.exports.run = async function ({ api, event, args }) {
	const { threadID, messageID, senderID } = event;
	const botID = api.getCurrentUserID();
	const out = msg => api.sendMessage(msg, threadID, messageID);

	// ❌ UID CHECK (LOCK)
	if (!ALLOWED_UID.includes(senderID)) {
		return out("❌ আপনি এই কমান্ড ব্যবহার করতে পারবেন না!");
	}

	var { participantIDs, approvalMode, adminIDs } = await api.getThreadInfo(threadID);
	participantIDs = participantIDs.map(e => parseInt(e));

	if (!args[0]) return out("Please enter 1 id/link profile user need to add.");

	// ✅ ID দিলে
	if (!isNaN(args[0])) return adduser(args[0], undefined);

	// ✅ Link দিলে
	try {
		var [id, name, fail] = await getUID(args[0]);
		if (fail == true && id != null) return out(id);
		else if (fail == true && id == null) return out("User ID not found.");
		else {
			await adduser(id, name || "Facebook user");
		}
	} catch (e) {
		return out(`${e.name}: ${e.message}`);
	}

	// ✅ ADD USER FUNCTION
	async function adduser(id, name) {
		id = parseInt(id);

		if (participantIDs.includes(id)) {
			return out(`${name || "Member"} already in the group.`);
		}

		var admins = adminIDs.map(e => parseInt(e.id));

		try {
			await api.addUserToGroup(id, threadID);
		} catch {
			return out(`Can't add ${name || "user"} to group.`);
		}

		if (approvalMode === true && !admins.includes(botID)) {
			return out(`Add ${name || "member"} to the approved list!`);
		} else {
			return out(`✅ Added ${name || "member"} to group!`);
		}
	}
};
