var pageRendered = new ReactiveVar(false);

Template.section.onCreated(function() {
	pageRendered.set(false);
	currentInputTypeTemplate = new ReactiveVar("embed");
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
	'sectionViewCount': function () {
		let currentSection = Sections.findOne();

		if (currentSection)
			return currentSection.currentlyViewing.length;
	},
	'threads' : () => {
		if (Session.get("settings").reactive) {
			return Threads.find({}, {sort : {"currentlyViewing" : -1, "name" : 1}});
		} else {
			return Threads.find({}, {sort : {"name" : 1}});			
		}
	},
	'sectionName': () => {
		let currentSection = Sections.findOne();

		if (currentSection)
			return currentSection.name;
	}
});

// TODO jos threadin nimen perässä on väli, subscription kusee
Template.section.events({
	'click button[name="deleteThread"]': function(e, t) {
		e.preventDefault();

		let threadId = $(e.target).attr("data-thread-id");

		Threads.remove(threadId);
	}
});

// Function stolen from
// http://stackoverflow.com/questions/1740700/how-to-get-hex-color-value-rather-than-rgb-value
function rgb2hex(rgb) {
     if (  rgb.search("rgb") == -1 ) {
          return rgb;
     } else {
          rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
          function hex(x) {
               return ("0" + parseInt(x).toString(16)).slice(-2);
          }
          return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]); 
     }
}