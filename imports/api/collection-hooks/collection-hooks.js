import { Sections } from "/imports/api/sections/sections.js";
import { Threads } from "/imports/api/threads/threads.js";
import { Messages } from "/imports/api/messages/messages.js";
import { Metadata } from "/imports/api/metadata/metadata.js";
import { debugLog } from "/imports/api/utils/utils.js";
import { slugify } from "/imports/api/utils/utils.js";

Sections.after.remove((userId, doc) => {
	debugLog("REMOVED SECTION, REMOVING THREADS");
	Threads.remove({"sectionId" : doc._id});
});

Threads.after.remove((userId, doc) => {
	debugLog(`REMOVED THREAD ${doc.name}, REMOVING MESSAGES`);
	Messages.remove({"threadId" : doc._id});
});

Threads.before.insert((userId, doc) => {
	const date = new Date();

	doc.timestamp = date;
	doc.sortableTime = date.getTime();
	// Creating a new String object to avoid modifying original name
	doc.slug = slugify(String(doc.name));
});

Messages.before.insert((userId, doc) => {
	const date = new Date();

	Metadata.upsert("msgCount", {$inc : {"msgCount" : 1}});
	doc.count = Metadata.findOne("msgCount").msgCount;
	doc.timestamp = date;
	doc.sortableTime = date.getTime();
});

Messages.after.insert((userId, doc) => {
	if (doc.references && doc.references.length > 0) {
		Messages.update({"count" : {$in : doc.references}}
						, {$push : {"replies" : doc.count}}
						, {multi : true});
	}
});