Meteor.methods({
	rateMessageUpsert: function(id, doc) {
		// TODO unsafe function accepting objects as parameters
		check(id, String);
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

		Messages.upsert({"count" : {$in : replies}}
						, {$push : {"replies" : msgCount}}
						, {multi : true});
	},
	insertMessage: function(threadId, message, msgCount) {
		check(threadId, String);
		check(message, String);
		check(msgCount, Number);

		let date = new Date();

		Messages.insert({"threadId" : threadId
    					, "msg" : message
    					, "timestamp" : date
    					, "sortableTime" : date.getTime()
    					, "count" : msgCount});
	},
	insertMessageWithFile: function(threadId, message, downloadUrl, msgCount) {
		check(threadId, String);
		check(message, String);
		check(downloadUrl, String);
		check(msgCount, Number);

		let date = new Date();

		Messages.insert({"threadId" : threadId
	    					, "msg" : message
	    					, "downloadUrl" : downloadUrl
	    					, "timestamp" : date
	    					, "sortableTime" : date.getTime()
	    					, "count" : msgCount});
	},
	insertMessageWithEmbed: function(embedLink, threadId, message, msgCount) {
		check(threadId, String);
		check(message, String);
		check(embedLink, String);
		check(msgCount, Number);

		let date = new Date();

		Messages.insert({"threadId" : threadId
	    					, "msg" : message
	    					, "embedLink" : embedLink
	    					, "timestamp" : date
	    					, "sortableTime" : date.getTime()
	    					, "count" : msgCount});
	},
	createThreadWithFile: function(sectionId, threadName, threadText, downloadUrl) {
		check(sectionId, String);
		check(threadName, String);
		check(threadText, String);
		check(downloadUrl, String);

		let threadId = Threads.insert({"sectionId" : sectionId
			        					, "name" : threadName
			        					, "initialText" : threadText
			        					, "downloadUrl" : downloadUrl
			        					, "currentlyViewing" : []});

		let msgCount = -1;
		if (Meteor.isServer)
			msgCount = Metadata.findOne().msgCount;


		Messages.insert({"threadId" : threadId
        					, "msg" : threadText
        					, "downloadUrl" : downloadUrl
        					, "timestamp" : new Date()
        					, "count" : msgCount});
	},
	createThreadWithEmbed: function(sectionId, threadName, threadText, embedLink) {
		check(sectionId, String);
		check(threadName, String);
		check(threadText, String);
		check(embedLink, String);

		let threadId = Threads.insert({"sectionId" : sectionId
			        					, "name" : threadName
			        					, "initialText" : threadText
			        					, "embedLink" : embedLink
			        					, "currentlyViewing" : []});

		let msgCount = -1;
		if (Meteor.isServer)
			msgCount = Metadata.findOne().msgCount;


		Messages.insert({"threadId" : threadId
        					, "msg" : threadText
        					, "embedLink" : embedLink
        					, "timestamp" : new Date()
        					, "count" : msgCount});
	},
	createThreadWithPoll: function(sectionId, threadName, threadText, pollTitle, options) {
		check(sectionId, String);
		check(threadName, String);
		check(threadText, String);
		check(pollTitle, String);
		check(options, Array);

		let optionsWithVoteCount = [];

		options.forEach((elem, index, array) => {
			optionsWithVoteCount.push({
				"option" : elem.option,
				"bgColor" : elem.bgColor,
				"voteCount" : 0
			});
		});

		let pollId = Polls.insert({"pollTitle" : pollTitle
									, "options" : optionsWithVoteCount
									, "alreadyVoted" : []});

		let threadId = Threads.insert({"sectionId" : sectionId
										, "name" : threadName
										, "initialText" : threadText
										, "pollId" : pollId
										, "currentlyViewing" : []});

		let msgCount = -1;
		if (Meteor.isServer)
			msgCount = Metadata.findOne().msgCount;

		Messages.insert({"threadId" : threadId
        					, "msg" : threadText
        					, "pollId" : pollId
        					, "timestamp" : new Date()
        					, "count" : msgCount});
	},
	createThreadWithLivestream: function(sectionId, threadName, threadText, channelName, chatIncluded) {
		check(sectionId, String);
		check(threadName, String);
		check(threadText, String);
		check(channelName, String);
		check(chatIncluded, Boolean);

		let threadId = Threads.insert({"sectionId" : sectionId
										, "name" : threadName
										, "initialText" : threadText
										, "livestream" : channelName
										, "chatIncluded" : chatIncluded
										, "currentlyViewing" : []});

		let msgCount = -1;
		if (Meteor.isServer)
			msgCount = Metadata.findOne().msgCount;

		Messages.insert({"threadId" : threadId
        					, "msg" : threadText
        					, "livestream" : channelName
							, "chatIncluded" : chatIncluded
        					, "timestamp" : new Date()
        					, "count" : msgCount});

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
	}
});