const pbl = Meteor.publish;
const rateLimiterTimeouts = [];

pbl("sections", function () {
	checkRateLimits(this, "sections");

	return Sections.find();
});

pbl("currentSection", function (sectionName) {
	check(sectionName, String);
	checkRateLimits(this, "currentSection");
	
	return Sections.find({"name" : sectionName});
});

pbl("sectionThreadStubs", function () {
	checkRateLimits(this, "sectionThreadStubs");

	return Threads.find({});
});

pbl("threadMessageStubs", function () {
	checkRateLimits(this, "threadMessageStubs");

	return Messages.find({});
});

pbl("threads", function (sectionName) {
	check(sectionName, String);
	checkRateLimits(this, "threads");

	let section = Sections.findOne({"name" : sectionName});

	if (!section) {
		return;
	} else {
		return Threads.find({"sectionId" : section._id});
	}
});

pbl("thread", function (threadSlug) {
	check(threadSlug, String);
	checkRateLimits(this, "thread");

	return Threads.find({"slug" : threadSlug});
});

pbl("messages", function (threadSlug) {
	check(threadSlug, String);
	checkRateLimits(this, "messages");
	
	let thread = Threads.findOne({"slug" : threadSlug});

	if (!thread) {
		return;
	} else {

		if (Roles.userIsInRole(this.userId, 'superadmin,moderator')) {
			return Messages.find({"threadId" : thread._id});
		} else {
			return Messages.find({"threadId" : thread._id}
								, {$fields : {"from" : 0}});
		}
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
	console.log(`RATE LIMIT ${name}`);
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
