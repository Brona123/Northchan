const pbl = Meteor.publish;
const rateLimiterTimeouts = [];

pbl("sections", function(matcher, options) {
	check(matcher, Object);
	check(options, Match.Maybe(Object));
	checkRateLimits(this, "sections");

	return Sections.find(matcher, options);
});

pbl("threads", function(matcher, options) {
	const matcherPattern = {
		sectionId : Match.Maybe(String),
		threadId : Match.Maybe(String),
		slug : Match.Maybe(String)
	}
	check(matcher, matcherPattern);
	check(options, Object);
	checkRateLimits(this, "threads");

	if (options.calculateLimit) {
		const threadsTotal = Sections.find().count() * options.calculateLimit.threadsPerSection;
		options.limit = threadsTotal;

		return Threads.find(matcher, options);		
	} else if (options.sectionName) {
		const section = Sections.findOne({"name" : options.sectionName});

		return Threads.find({sectionId : section._id});
	} else {
		return Threads.find(matcher, options);
	}
});

pbl("messages", function(matcher, options) {
	const matcherPattern = {
		sectionId : Match.Maybe(String),
		threadId : Match.Maybe(String)
	}
	check(matcher, matcherPattern);
	check(options, Object);
	checkRateLimits(this, "messages");

	if (options.sectionName) {
		let section = Sections.findOne({name : options.sectionName});

		return Messages.find({sectionId : section._id}, options);
	} else if (options.threadName) {
		let thread = Threads.findOne({name : options.threadName});

		return Messages.find({threadId : thread._id}, options);
	} else {
		return Messages.find(matcher, options);
	}
});

pbl("msgCount", function () {
	checkRateLimits(this, "msgCount");

	return Metadata.find();
});

pbl("currentConnections", function () {
	checkRateLimits(this, "currentConnections");

	return ConnectedClients.find({}, {$fields : {"_id" : 0}});
});

pbl("polls", function () {
	checkRateLimits(this, "polls");

	return Polls.find({}, {$fields : {"alreadyVoted" : 0}});
});

pbl("selfBanned", function () {
	checkRateLimits(this, "selfBanned");

	let id = SHA256(this.connection.clientAddress);

	return BannedUsers.find(id);
});

// Admin publications
pbl("adminAccountsListing", () => {
	return Meteor.users.find({});
});

pbl("adminAllRoles", () => {
	return Meteor.roles.find({});
});

pbl("adminBannedUsers", () => {
	return BannedUsers.find({});
});

function checkRateLimits(context, name) {
	if (BannedUsers.findOne(SHA256(context.connection.clientAddress))) {
		return;
	}
	
	debugLog(`RATE LIMIT ${name}`);
	const subLimit = 50;
	const timeLimit = 1000;
	const clientAddress = context.connection.clientAddress;

	if (RateLimiting.findOne(clientAddress)) {
		if (RateLimiting.findOne(clientAddress)[name] > subLimit) {
			BannedUsers.upsert(SHA256(clientAddress)
								, {"reason" : "Banned for spamming subscriptions"
									, "message" : "null"
									, "bannedBy" : "System"});
			return;
		}
	}

	const publications = {};
	publications[name] = 1;
	RateLimiting.upsert(clientAddress, {$inc : publications});

	if (!rateLimiterTimeouts[name]) {
		rateLimiterTimeouts[name] = Meteor.setTimeout(() => {
			publications[name] = 0;
			RateLimiting.upsert(clientAddress, {$set : publications});
			rateLimiterTimeouts[name] = undefined;
		}, timeLimit);
	}
}
