Threads.after.remove(function (userId, doc){
	console.log("REMOVED THREAD, REMOVING MESSAGES");
	Messages.remove({"threadId" : doc._id});
});

Sections.after.remove(function(userId, doc){
	console.log("REMOVED SECTION, REMOVING THREADS");
	Threads.remove({"sectionId" : doc._id});
});