import { nonEmptyString } from "/imports/api/utils/utils.js";
import { legitDownloadUrl } from "/imports/api/utils/utils.js";
import { legitEmbedUrl } from "/imports/api/utils/utils.js";

Meteor.methods({
	setCurrentThread(threadSlug) {
		check(threadSlug, String);

		const clientId = this.connection ? SHA256(this.connection.clientAddress) : -1;
		const thread = Threads.findOne({"slug" : threadSlug});

		if (thread) {
			Threads.update({"slug" : threadSlug}, {$push : {"currentlyViewing" : clientId}});
		}
	},
	// TODO dont create message here, make the api user do it themselves
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
			hashedIP = this.connection ? SHA256(this.connection.clientAddress) : -1;

		threadObject.from = hashedIP;
		threadObject.currentlyViewing = [];

		const threadId = Threads.insert(threadObject);
		console.log("method: " + threadId);

		/*
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
		*/

		return threadId;
	},
	clearThreadView() {
		const clientId = this.connection ? SHA256(this.connection.clientAddress) : -1;
		const previousThread = Threads.findOne({"currentlyViewing" : clientId});
		
		if (previousThread) {
			Threads.update({"currentlyViewing" : clientId}, {$pull : {"currentlyViewing" : clientId}});
		}
	}
});