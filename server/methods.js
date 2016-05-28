Meteor.methods({
	setCurrentSection(sectionName) {
		check(sectionName, String);

		const clientId = SHA256(this.connection.clientAddress);

		const section = Sections.findOne({"name" : sectionName});

		if (section) {
			Sections.update({"name" : sectionName}, {$push : {"currentlyViewing" : clientId}});
		}
	},
	setCurrentThread(threadSlug) {
		check(threadSlug, String);

		const clientId = SHA256(this.connection.clientAddress);

		const thread = Threads.findOne({"slug" : threadSlug});

		if (thread) {
			Threads.update({"slug" : threadSlug}, {$push : {"currentlyViewing" : clientId}});
		}
	},
	clearCurrentView() {
		const clientId = SHA256(this.connection.clientAddress);

		clearViews(clientId);
	},
	clearConnectionView(conn) {
		// TODO maybe just send clientaddress?
		check(conn, Object);

		const clientId = SHA256(conn.clientAddress);

		clearViews(clientId);
	},
	getId() {
		return SHA256(this.connection.clientAddress);
	}
});

function clearViews(clientId) {
	const previousSection = Sections.findOne({"currentlyViewing" : clientId});
	if (previousSection) {
		Sections.update({"currentlyViewing" : clientId}, {$pull : {"currentlyViewing" : clientId}});
	}

	const previousThread = Threads.findOne({"currentlyViewing" : clientId});
	if (previousThread) {
		Threads.update({"currentlyViewing" : clientId}, {$pull : {"currentlyViewing" : clientId}});
	}
}