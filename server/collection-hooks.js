Sections.after.remove(function(userId, doc) {
	console.log("REMOVED SECTION, REMOVING THREADS");
	Threads.remove({"sectionId" : doc._id});
});

Threads.after.remove(function(userId, doc) {
	console.log("REMOVED THREAD, REMOVING MESSAGES");
	Messages.remove({"threadId" : doc._id});
});

Threads.before.insert((userId, doc) => {
	doc.slug = slugify(doc.name);
});

Messages.before.insert(function(userId, doc) {
	let date = new Date();

	doc.count = Metadata.findOne("msgCount").msgCount;
	doc.timestamp = date;
	doc.sortableTime = date.getTime();
});

Messages.after.insert(function(userId, doc) {
	Metadata.upsert({"_id" : "msgCount"}, {$inc : {"msgCount" : 1}});
});

// function stolen from 
// http://stackoverflow.com/questions/1053902/how-to-convert-a-title-to-a-url-slug-in-jquery
function slugify(str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = "ãàáäâåẽèéëêìíïîõòóöôùúüûñç·/_,:;";
  var to   = "aaaaaaeeeeeiiiiooooouuuunc------";
  for (var i=0, l=from.length ; i<l ; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

  return str;
}