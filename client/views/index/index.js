Template.index.onRendered(function () {
	Session.set("sectionId", "");
	Session.set("threadId", "");
});

Template.index.helpers({
	'sections' : () => {
		if (Session.get("settings").reactive) {
			return Sections.find({}, {sort : {"currentlyViewing" : -1, "name" : 1}});
		} else {
			return Sections.find({}, {sort : {"name" : 1}});			
		}
	},
	'sectionThreadCount': () => {
		return Threads.find(); 
	},
	'threadCount': (sectionId) => {
		return Threads.find({"sectionId" : sectionId}).count();
	},
	'thread' : (sectionId) => {
		return Threads.find({"sectionId" : sectionId});
	},
	'messageCount' : (threadId) => {
		return Messages.find({"threadId" : threadId}).count();
	},
	'messagesPerSection' : (section) => {
		let threads = Threads.find({"sectionId" : section._id});
		
		let threadIds = [];

		threads.forEach((elem, index, arr) => {
			threadIds.push(elem._id);
		});

		return Messages.find({"threadId" : {$in : threadIds}}).count();
	},
	'threadsPerSection' : (section) => {
		return Threads.find({"sectionId" : section._id}).count();
	},
	'frontPageThreads' : (sectionId) => {
		let threadAmount = Meteor.Device.isDesktop() ? 6 : 4;

		return Threads.find({"sectionId" : sectionId}
							, {sort : {"currentlyViewing" : -1}
								, limit : threadAmount});
	}
});

Template.index.events({
	'submit #createSubsection': function (e, t) {
		e.preventDefault();

		let sectionName = $("input[name='sectionName'").val().trim();

		if (!Sections.findOne({"name" : sectionName})) {
			Meteor.call("createSection", sectionName);
		} else {
			alert("Section with name \"" + sectionName + "\" already exists");
		}

		let form = $("#createSubsection")[0];
		$("#createSubsection")[0].blur();
		form.reset();
	},
	'click button[name="deleteSection"]': function(e, t) {
		e.preventDefault();

		let sectionId = $(e.target).attr("data-section-id");
		Sections.remove(sectionId);
	}
});