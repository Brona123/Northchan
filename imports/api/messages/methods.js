import { nonEmptyString } from "/imports/api/utils/utils.js";
import { legitDownloadUrl } from "/imports/api/utils/utils.js";
import { legitEmbedUrl } from "/imports/api/utils/utils.js";

Meteor.methods({
	insertMessage(messageObject) {
		const pattern = {
			sectionId : Match.Where(nonEmptyString),
			threadId : Match.Where(nonEmptyString),
			msg : Match.Where(nonEmptyString),
			references : Match.Maybe([Number]),
			downloadUrl : Match.Maybe(Match.Where(legitDownloadUrl)),
			embedLink : Match.Maybe(Match.Where(legitEmbedUrl)),
			livestream : Match.Maybe(String),
			chatIncluded : Match.Maybe(Boolean),
			pollId : Match.Maybe(String)
		}

		check(messageObject, pattern);
		
		let hashedIP = -1;
		if (Meteor.isServer)
			//hashedIP = SHA256(this.connection.clientAddress);

		messageObject.from = hashedIP;

		const msgId = Messages.insert(messageObject);
		return msgId;
	},
	rateMessageUpsert(id, doc) {
		check(id, String);
		// TODO unsafe function accepting objects as parameters
		check(doc, Object);

		if (Meteor.isServer) {
			const cIP = this.connection.clientAddress;

			// If client has already liked or disliked, deny action
			if (Messages.findOne({"_id" : id, "action_already" : cIP})) {
				return;
			}

			Messages.upsert(id, doc);

			Messages.upsert(id, {$push : {"action_already" : cIP}});
		}
	}
});