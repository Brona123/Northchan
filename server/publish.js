let pbl = Meteor.publish;

pbl("files", () => {
	//return Files.find();
	return "";
});

pbl("canvas", () => {
	return Canvas.find();
});

pbl("sections", () => {
	return Sections.find();
});

pbl("currentSection", (sectionName) => {
	check(sectionName, String);
	
	return Sections.find({"name" : sectionName});
});

pbl("sectionThreadStubs", () => {
	return Threads.find({});
});

pbl("threadMessageStubs", () => {
	return Messages.find({});
});

pbl("threads", (sectionName) => {
	check(sectionName, String);

	let section = Sections.findOne({"name" : sectionName}, );

	if (!section) {
		return;
	} else {
		return Threads.find({"sectionId" : section._id});
	}
});

pbl("thread", function (threadName) {
	check(threadName, String);

	this.onStop(function() {
		Threads.upsert({"name" : threadName}
						, {$inc : {"viewCount" : -1}});
	});

	if (!threadName) {
		return;
	} else {
		Threads.upsert({"name" : threadName}
						, {$inc : {"viewCount" : 1}});
		return Threads.find({"name" : threadName});
	}
});

pbl("messages", function (threadName) {
	check(threadName, String);
	
	let thread = Threads.findOne({"name" : threadName});

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

pbl("msgCount", () => {
	return Metadata.find();
});

pbl("currentConnections", () => {
	return ConnectedClients.find("connectedClients", {$fields : {"count" : 1}});
});

pbl("polls", () => {
	return Polls.find({}, {$fields : {"alreadyVoted" : 0}});
});

pbl("selfBanned", function () {
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
