module.exports.config = {
	name: "kick",
	version: "1.1.0",
	hasPermssion: 1,
	credits: "MR JUWEL",
	description: "Tag/reply দিয়ে একসাথে একাধিক ইউজার কিক করা যায়",
	commandCategory: "System",
	usages: "[tag/reply]",
	cooldowns: 3,
};

module.exports.languages = {
	"en": {
		"error": "Error! Something went wrong.",
		"needBotAdmin": "Bot needs admin permission!",
		"needTagOrReply": "Please reply to a message or tag someone!",
		"noPermission": "You need to be group admin!"
	}
};

module.exports.run = async function ({ api, event, getText, Threads }) {
	try {

		let targetIDs = [];

		// 👉 Reply system (single)
		if (event.type === "message_reply") {
			targetIDs.push(event.messageReply.senderID);
		}

		// 👉 Tag system (MULTIPLE SUPPORT)
		let mention = Object.keys(event.mentions || {});
		if (mention.length > 0) {
			targetIDs = targetIDs.concat(mention);
		}

		if (targetIDs.length === 0)
			return api.sendMessage(getText("needTagOrReply"), event.threadID, event.messageID);

		const threadData = await Threads.getData(event.threadID);
		const threadInfo = threadData.threadInfo || (await api.getThreadInfo(event.threadID));

		const admins = threadInfo.adminIDs || [];

		const isUserAdmin = admins.some(a => a.id == event.senderID);
		const isBotAdmin = admins.some(a => a.id == api.getCurrentUserID());

		if (!isBotAdmin)
			return api.sendMessage(getText("needBotAdmin"), event.threadID, event.messageID);

		if (!isUserAdmin)
			return api.sendMessage(getText("noPermission"), event.threadID, event.messageID);

		// ❗ নিজেকে কিক করা বন্ধ
		targetIDs = targetIDs.filter(id => id != api.getCurrentUserID());

		// 👉 একসাথে কিক
		for (let id of targetIDs) {
			api.removeUserFromGroup(id, event.threadID, (err) => {
				if (err) console.log(err);
			});
		}

		return api.sendMessage(
			`✅ ${targetIDs.length} জন ইউজারকে গ্রুপ থেকে কিক করা হয়েছে!`,
			event.threadID,
			event.messageID
		);

	} catch (err) {
		console.log(err);
		return api.sendMessage(getText("error"), event.threadID, event.messageID);
	}
};
