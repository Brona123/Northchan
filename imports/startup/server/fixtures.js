Fixtures = new Mongo.Collection("fixtures");

export const storeFixtures = function storeFixtures() {
	if (Fixtures.findOne()) {
		return;
	}
	
	console.log("Starting to insert fixtures...");

	for (let i = 0; i < 15; i++) {
		let sectionId = Meteor.call("createSection", {
			name : `asd${Math.random().toString(36).substring(7)}`
		});

		Meteor._sleepForMs(50);
		for (let j = 0; j < 3; j++) {

			let threadId = Meteor.call("createThread", {
				sectionId : sectionId,
				name : `asd${Math.random().toString(36).substring(7)}`,
				threadText : `dsa${Math.random().toString(36).substring(7)}`
			});

			Meteor._sleepForMs(50);
			for (let k = 0; k < 3; k++) {
				Meteor.call("insertMessage", {
					sectionId : sectionId,
					threadId : threadId,
					msg : `gxdfg${Math.random().toString(36).substring(7)}`
				});
			}
		}
	}

	Fixtures.insert({"fixturesInserted" : true});
	console.log("Fixtures inserted!");
}