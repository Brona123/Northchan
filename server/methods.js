Meteor.methods({
	'setCurrentSection': function(sectionName) {
		check(sectionName, String);

		let clientId = SHA256(this.connection.clientAddress);

		let section = Sections.findOne({"name" : sectionName
										, "currentlyViewing" : clientId});

		if (!section) {
			Sections.upsert({"name" : sectionName}, {$push : {"currentlyViewing" : clientId}});
		}
	},
	'setCurrentThread': function(threadName) {
		check(threadName, String);

		let clientId = SHA256(this.connection.clientAddress);

		let thread = Threads.findOne({"name" : threadName
										, "currentlyViewing" : clientId});

		if (!thread) {
			Threads.upsert({"name" : threadName}, {$push : {"currentlyViewing" : clientId}});
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