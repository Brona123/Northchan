Meteor.methods({
	setCurrentSection(sectionName) {
		check(sectionName, String);

		const clientId = this.connection ? SHA256(this.connection.clientAddress) : -1;
		const section = Sections.findOne({"name" : sectionName});

		if (section) {
			Sections.update({"name" : sectionName}, {$push : {"currentlyViewing" : clientId}});
		}
	},
	createSection(sectionObject) {
		const pattern = {
			name : String,
			background : Match.Maybe(String)
		}

		check(sectionObject, pattern);

		sectionObject.currentlyViewing = [];

		const sectionId = Sections.insert(sectionObject);
		return sectionId;
	},
	clearSectionView() {
		const clientId = this.connection ? SHA256(this.connection.clientAddress) : -1;
		const previousSection = Sections.findOne({"currentlyViewing" : clientId});
		
		if (previousSection) {
			Sections.update({"currentlyViewing" : clientId}, {$pull : {"currentlyViewing" : clientId}});
		}
	}
});