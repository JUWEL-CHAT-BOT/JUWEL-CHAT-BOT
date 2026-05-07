module.exports.config = {
	name: "god",
	eventType: ["log:unsubscribe", "log:subscribe", "log:thread-name"],
	version: "2.0.0",
	credits: "乛 M𝆠፝֟R ཐི༏ཋྀ JU𝆠፝֟W𝆠፝֟ELꜛཐི༏ཋྀ࿐",
	description: "Advanced Group Logger",
	envConfig: {
		enable: true
	}
};

module.exports.run = async function ({ api, event }) {

	if (!global.configModule?.[this.config.name]?.enable) return;

	const time = new Date().toLocaleString("en-GB", {
		timeZone: "Asia/Dhaka"
	});

	let msg = "";

	try {

		// ================= GROUP NAME CHANGE =================

		if (event.logMessageType == "log:thread-name") {

			const oldName = event.body || "Unknown";
			const newName = event.logMessageData?.name || "Unknown";

			msg =
`╭━━━〔 🏷️ GROUP NAME UPDATE 〕━━━╮
┃ 📌 New Name: ${newName}
┃ ⚡ Changed By: ${event.author || "Unknown"}
╰━━━━━━━━━━━━━━━━━━━╯
🕒 ${time}`;
		}

		// ================= BOT ADDED =================

		if (event.logMessageType == "log:subscribe") {

			const added = event.logMessageData?.addedParticipants || [];

			if (added.some(i => i.userFbId == api.getCurrentUserID())) {

				const threadInfo = await api.getThreadInfo(event.threadID);

				msg =
`╭━━━〔 🤖 BOT ADDED 〕━━━╮
┃ 📌 Group: ${threadInfo.threadName}
┃ 👥 Members: ${threadInfo.participantIDs.length}
┃ 🆔 Thread ID: ${event.threadID}
╰━━━━━━━━━━━━━━━━╯
🕒 ${time}`;
			}
		}

		// ================= MEMBER REMOVED =================

		if (event.logMessageType == "log:unsubscribe") {

			const leftID = event.logMessageData.leftParticipantFbId;

			const threadInfo = await api.getThreadInfo(event.threadID);

			const groupName = threadInfo.threadName || "Unknown Group";

			let leftName = "Unknown";
			let adminName = "Unknown";

			try {

				const userInfo = await api.getUserInfo(leftID);
				leftName = userInfo[leftID]?.name || "Unknown";

			} catch {}

			try {

				const adminInfo = await api.getUserInfo(event.author);

				adminName = adminInfo[event.author]?.name || "Unknown";

			} catch {}

			// ===== BOT REMOVED =====

			if (leftID == api.getCurrentUserID()) {

				msg =
`╭━━━〔 🚨 BOT REMOVED 〕━━━╮
┃ 📌 Group: ${groupName}
┃ ⚡ Removed By: ${adminName}
┃ 🆔 Group ID: ${event.threadID}
╰━━━━━━━━━━━━━━━━━━╯
🕒 ${time}`;

			} else {

				// ===== MEMBER KICKED =====

				msg =
`╭━━━〔 👢 MEMBER KICKED 〕━━━╮
┃ 📌 Group: ${groupName}
┃ 👤 User: ${leftName}
┃ ⚡ Kicked By: ${adminName}
┃ 🆔 UID: ${leftID}
╰━━━━━━━━━━━━━━━━━━━━╯
🕒 ${time}`;
			}
		}

		if (!msg) return;

		const inboxes = [
			"100071528325738",
			"61567576882007"
		];

		for (const id of inboxes) {
			await api.sendMessage(msg, id);
		}

	} catch (err) {
		console.log(err);
	}
};
