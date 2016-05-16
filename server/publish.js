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

pbl("messages", (threadName) => {
	check(threadName, String);
	
	let thread = Threads.findOne({"name" : threadName});

	if (!thread) {
		return;
	} else {
		return Messages.find({"threadId" : thread._id});
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

// Admin publications
pbl("adminAccountsListing", () => {
	return Meteor.users.find({});
});

pbl("adminAllRoles", () => {
	return Meteor.roles.find({});
});
