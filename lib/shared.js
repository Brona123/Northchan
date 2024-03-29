Meteor.methods({
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
	},
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
	createThread(threadObject) {
		const pattern = {
			sectionId : Match.Where(nonEmptyString),
			name : Match.Where(nonEmptyString),
			threadText : Match.Where(nonEmptyString),
			downloadUrl : Match.Maybe(Match.Where(legitDownloadUrl)),
			embedLink : Match.Maybe(Match.Where(legitEmbedUrl)),
			pollTitle : Match.Maybe(String),
			options : Match.Maybe([Object]), // TODO Unsafe check
			livestream : Match.Maybe(String),
			chatIncluded : Match.Maybe(Boolean)
		}

		check(threadObject, pattern);

		let hashedIP = -1;
		if (Meteor.isServer)
			//hashedIP = SHA256(this.connection.clientAddress);

		threadObject.from = hashedIP;
		threadObject.currentlyViewing = [];

		const msgObject = {
			sectionId : threadObject.sectionId,
			msg : threadObject.threadText
		}
		
		if (threadObject.pollTitle) {
			const optionsWithVoteCount = [];

			threadObject.options.forEach((elem, index, array) => {
				optionsWithVoteCount.push({
					"option" : elem.option,
					"bgColor" : elem.bgColor,
					"voteCount" : 0
				});
			});

			const pollId = Polls.insert({"pollTitle" : threadObject.pollTitle
									, "options" : optionsWithVoteCount
									, "alreadyVoted" : []});

			threadObject.pollId = pollId;
			msgObject.pollId = pollId;
		}

		const threadId = Threads.insert(threadObject);
		msgObject.threadId = threadId;

		if (threadObject.downloadUrl)
			msgObject.downloadUrl = threadObject.downloadUrl;

		if (threadObject.embedLink)
			msgObject.embedLink = threadObject.embedLink;

		if (threadObject.livestream)
			msgObject.livestream = threadObject.livestream;

		if (threadObject.chatIncluded)
			msgObject.chatIncluded = threadObject.chatIncluded;

		Meteor.call("insertMessage", msgObject);

		return threadId;
	},
	createSection(sectionObject) {
		const pattern = {
			name : String,
			background : Match.Maybe(String)
		}

		check(sectionObject, pattern);

		sectionObject.currentlyViewing = [];

		const sectionId = Sections.insert(sectionObject);
		return sectionId;
	},
	vote(pollId, option) {
		check(pollId, String);
		check(option, String);

		const poll = Polls.findOne(pollId);

		if (Meteor.isServer) {
			const cIP = this.connection.clientAddress;

			// If client has already voted, deny action
			if (Polls.findOne({"_id" : pollId, "alreadyVoted" : cIP})) {
				return;
			}

			poll.options.forEach((elem, index, array) => {
				if (elem.option === option) {
					elem.voteCount++;
				}
			});

			Polls.upsert(pollId, {$set : {"options" : poll.options}});
			Polls.upsert(pollId, {$push : {"alreadyVoted" : cIP}});
		}
	},
	banUser(id, reason, messageContent, modId) {
		check(id, String);
		check(reason, String);
		check(messageContent, String);
		check(modId, String);

		if (Roles.userIsInRole(Meteor.userId(), ['superadmin','moderator'])) {
			BannedUsers.upsert(id, {"reason" : reason
									, "message" : messageContent
									, "bannedBy" : modId});
		}
	}
});

function legitDownloadUrl(string) {
	const regex = "http://files.northchan.com/";

	return string.match(regex) ? true : null;
}

function legitEmbedUrl(string) {
	if (string.match("youtube.com") || string.match("youtu.be")) {
		const youtubeRegex = /(\/\/www.youtube.com\/embed\/)/;

		return string.match(youtubeRegex) ? true : null;
	} else if (string.match("vimeo.com")) {
		const vimeoRegex = /(\/\/player.vimeo.com\/video\/)/;

		return string.match(vimeoRegex) ? true : null;
	} else if (string.match("twitch.tv")) {
		const twitchRegex = /(\/\/player.twitch.tv\/?video=v\d+&autoplay=false)/;
		
		return string.match(twitchRegex) ? true : null;
	} else {
		return null;
	}
}

function nonEmptyString(string) {
	check(string, String);
	return string.length > 0;
}