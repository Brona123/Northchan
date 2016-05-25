Meteor.methods({
	'setCurrentSection': function(sectionName) {
		check(sectionName, String);

		let clientId = SHA256(this.connection.clientAddress);

		let section = Sections.findOne({"name" : sectionName});

		if (!section) {
			return;
		} else {
			Sections.update({"name" : sectionName}, {$push : {"currentlyViewing" : clientId}});
		}
	},
	'setCurrentThread': function(threadSlug) {
		check(threadSlug, String);

		let clientId = SHA256(this.connection.clientAddress);

		let thread = Threads.findOne({"slug" : threadSlug});

		if (!thread) {
			return;
		} else {
			Threads.update({"slug" : threadSlug}, {$push : {"currentlyViewing" : clientId}});
		}
	},
	'clearCurrentView': function() {
		let clientId = SHA256(this.connection.clientAddress);

		clearViews(clientId);
	},
	'clearConnectionView': function(conn) {
		// TODO maybe just send clientaddress?
		check(conn, Object);

		let clientId = SHA256(conn.clientAddress);

		clearViews(clientId);
	},
	'getId': function() {
		return SHA256(this.connection.clientAddress);
	}
});

function clearViews(clientId) {
	let previousSection = Sections.findOne({"currentlyViewing" : clientId});
	if (previousSection) {
		Sections.update({"currentlyViewing" : clientId}, {$pull : {"currentlyViewing" : clientId}});
	}

	let previousThread = Threads.findOne({"currentlyViewing" : clientId});
	if (previousThread) {
		Threads.update({"currentlyViewing" : clientId}, {$pull : {"currentlyViewing" : clientId}});
	}
}