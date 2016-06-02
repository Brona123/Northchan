var pageRendered = new ReactiveVar(false);

Template.section.onCreated(function () {
	pageRendered.set(false);
	currentInputTypeTemplate = new ReactiveVar("embed");

	this.autorun(function() {
		const sectionMatcher = {
			"name" : FlowRouter.getParam("section")
		};
		Meteor.subscribe("sections", sectionMatcher, {});

		const threadsOptions = {
			"sectionName" : FlowRouter.getParam("section")
		};
		Meteor.subscribe("threads", {}, threadsOptions);

		const messageOptions = {
			"sectionName" : FlowRouter.getParam("section"),
			fields : { threadId : 1}
		};
		Meteor.subscribe("messages", {}, messageOptions);

		Meteor.subscribe("polls");
	});
});

Template.section.onRendered(function() {
	pageRendered.set(true);

	this.find('#threadList')._uihooks = {
		insertElement: function(node, next) {
			pageRendered.set(false);
			$(node).hide().insertBefore(next).fadeIn();
			pageRendered.set(true);
		}
	};
});

Template.section.helpers({
	sectionViewCount() {
		const currentSection = Sections.findOne();

		if (currentSection && currentSection.currentlyViewing)
			return currentSection.currentlyViewing.length;
	},
	threads() {
		if (!FlowRouter.subsReady()) return;

		if (Session.get("settings").reactive) {
			return Threads.find({}, {sort : {"currentlyViewing" : -1, "sortableTime" : -1}});
		} else {
			return Threads.find({}, {sort : {"sortableTime" : -1}});			
		}
	},
	sectionName() {
		if (!FlowRouter.subsReady()) return;
		
		const currentSection = Sections.findOne();

		if (currentSection)
			return currentSection.name;
	}
});

// Function stolen from
// http://stackoverflow.com/questions/1740700/how-to-get-hex-color-value-rather-than-rgb-value
function rgb2hex(rgb) {
    if (rgb.search("rgb") == -1) {
        return rgb;
    } else {
        rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
        function hex(x) {
            return ("0" + parseInt(x).toString(16)).slice(-2);
        }
        return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]); 
    }
}