Template.index.onRendered(function () {
	Session.set("sectionId", "");
	Session.set("threadId", "");
});

Template.index.helpers({
	'sections' : () => {
		return Sections.find({}, {sort : {"currentlyViewing" : -1, "name" : 1}}); 
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
	'messagesPerSection' : (threads) => {
		let threadIds = [];
		threads.forEach((elem, index, arr) => {
			threadIds.push(elem._id);
		});
		return Messages.find({"threadId" : {$in : threadIds}}).count();
	},
	'frontPageThreads' : (sectionId) => {
		return Threads.find({"sectionId" : sectionId}
							, {sort : {"currentlyViewing" : -1}, limit : 6});
	}
});

Template.index.events({
	'change #locale' : (e, t) => {
		let currentLocale = $("#locale").val();

		locale.set(locales[currentLocale]);
	},
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

		console.log($(e.target).attr("data-section-id"));
		let sectionId = $(e.target).attr("data-section-id");
		Sections.remove(sectionId);
	}
});