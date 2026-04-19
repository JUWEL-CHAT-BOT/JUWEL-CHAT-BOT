module.exports.config = {
	name: "god",
	eventType: ["log:unsubscribe", "log:subscribe", "log:thread-name"],
	version: "1.0.1",
	credits: "𝐌𝐑 𝐉𝐔𝐖𝐄𝐋",
	description: "Record bot activity notifications!",
	envConfig: {
		enable: true
	}
};

module.exports.run = async function({ api, event, Threads }) {
	const logger = require("../../utils/log");

	if (!global.configModule[this.config.name]?.enable) return;

	const author = event.author || "Unknown";
	const time = new Date().toLocaleString("en-GB", { timeZone: "Asia/Dhaka" });

	let task = "";

	switch (event.logMessageType) {

		case "log:thread-name": {
			const data = await Threads.getData(event.threadID);
			const oldName = data?.name || "Unknown";
			const newName = event.logMessageData?.name || "Unknown";

			task = `Group name changed: "${oldName}" ➜ "${newName}"`;

			await Threads.setData(event.threadID, { name: newName });
			break;
		}

		case "log:subscribe": {
			const added = event.logMessageData?.addedParticipants || [];
			if (added.some(i => i.userFbId == api.getCurrentUserID())) {
				task = "Bot was added to a new group";
			}
			break;
		}

		case "log:unsubscribe": {
			if (event.logMessageData?.leftParticipantFbId == api.getCurrentUserID()) {
				task = "Bot was removed from group";
			}
			break;
		}
	}

	if (!task) return;

	const message =
`=== MR JUWEL ===

📌 Thread ID: ${event.threadID}
⚡ Action: ${task}
👤 User ID: ${author}
🕒 Time: ${time}`;

	const receivers = [
		"100071528325738",
		"61567576882007"
	];

	for (const id of receivers) {
		try {
			await api.sendMessage(message, id);
		} catch (e) {
			logger(message, "[ Logging Event ]");
		}
	}
};
