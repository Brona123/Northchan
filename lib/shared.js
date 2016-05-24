Meteor.methods({
	rateMessageUpsert: function(id, doc) {
		check(id, String);
		// TODO unsafe function accepting objects as parameters
		check(doc, Object);

		if (Meteor.isServer) {
			let cIP = this.connection.clientAddress;

			// If client has already liked or disliked, deny action
			if (Messages.findOne({"_id" : id, "action_already" : cIP})) {
				return;
			}

			Messages.upsert(id, doc);

			Messages.upsert(id, {$push : {"action_already" : cIP}});
		}
	},
	storeReplies: function(replies, msgCount) {
		check(replies, [Number]);
		check(msgCount, Number);

		// Sometimes error
		// The dollar ($) prefixed field '$in'
		// in 'count.$in' is not valid for storage
		console.log("storeReplies:");
		console.log(replies);
		console.log(msgCount);
		Messages.upsert({"count" : {"$in" : replies}}
						, {$push : {"replies" : msgCount}}
						, {multi : true});
	},
	insertMessage: function(messageObject) {
		const pattern = {
			threadId : String,
			msg : String,
			downloadUrl : Match.Maybe(Match.Where(legitDownloadUrl)),
			embedLink : Match.Maybe(Match.Where(legitEmbedUrl)),
			livestream : Match.Maybe(String),
			chatIncluded : Match.Maybe(Boolean),
			pollId : Match.Maybe(String)
		}

		check(messageObject, pattern);
		
		var hashedIP = -1;
		if (Meteor.isServer)
			hashedIP = SHA256(this.connection.clientAddress);

		messageObject.from = hashedIP;

		Messages.insert(messageObject);
	},
	createThread: function(threadObject) {
		console.log("CREATE THREAD:::");
		console.log(threadObject.pollTitle);
		console.log(threadObject.options);

		const pattern = {
			sectionId : String,
			name : String,
			threadText : String,
			downloadUrl : Match.Maybe(Match.Where(legitDownloadUrl)),
			embedLink : Match.Maybe(Match.Where(legitEmbedUrl)),
			pollTitle : Match.Maybe(String),
			options : Match.Maybe([Object]), // TODO Unsafe check
			livestream : Match.Maybe(String),
			chatIncluded : Match.Maybe(Boolean)
		}

		check(threadObject, pattern);

		var hashedIP = -1;
		if (Meteor.isServer)
			hashedIP = SHA256(this.connection.clientAddress);

		threadObject.from = hashedIP;
		threadObject.currentlyViewing = [];

		let msgObject = {
			threadId : threadId,
			msg : threadObject.threadText
		}
		
		if (threadObject.pollTitle) {
			let optionsWithVoteCount = [];

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
	},
	createSection: function(sectionName) {
		check(sectionName, String);

		Sections.insert({"name" : sectionName, "currentlyViewing" : []});
	},
	vote: function(pollId, option) {
		check(pollId, String);
		check(option, String);

		let poll = Polls.findOne(pollId);

		if (Meteor.isServer) {
			let cIP = this.connection.clientAddress;

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
	banUser: function(id, reason, messageContent, modId) {
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

	if (string.match(regex)) {
		return true;
	} else {
		return null;
	}
}

function legitEmbedUrl(string) {
	if (string.match("youtube.com") || string.match("youtu.be")) {
		return string.match(/(^|=|\/)([0-9A-Za-z_-]{11})(\/|&|$|\?|#)/) ? true : null;
	} else if (string.match("vimeo.com")) {
		return string.match(/^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/) ? true : null;
	} else if (string.match("twitch.tv")) {
		return string.match("/https://player.twitch.tv/?video=v/") ? true : null;
	} else {
		return null;
	}
}