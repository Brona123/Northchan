Sections.after.remove(function(userId, doc) {
	console.log("REMOVED SECTION, REMOVING THREADS");
	Threads.remove({"sectionId" : doc._id});
});

Threads.after.remove(function(userId, doc) {
	console.log("REMOVED THREAD, REMOVING MESSAGES");
	Messages.remove({"threadId" : doc._id});
});

Messages.before.insert(function(userId, doc) {
	let date = new Date();

	doc.timestamp = date;
	doc.sortableTime = date.getTime();
});