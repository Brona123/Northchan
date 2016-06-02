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

// function stolen from 
// http://stackoverflow.com/questions/1053902/how-to-convert-a-title-to-a-url-slug-in-jquery
function slugify(str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  let from = "ãàáäâåẽèéëêìíïîõòóöôùúüûñç·/_,:;";
  let to   = "aaaaaaeeeeeiiiiooooouuuunc------";
  for (let i=0, l=from.length ; i<l ; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

  return str;
}