var pageRendered = new ReactiveVar(false);

Template.thread.onCreated(function () {
	pageRendered.set(false);
});

Template.thread.onRendered(function () {
	let template = Template.instance();
	let textArea = template.find('#messagelist');

	this.find('#messagelist')._uihooks = {
		insertElement: function(node, next) {
			$(node).hide().insertBefore(next).fadeIn();

			if (Session.get("settings").autoscroll)
				textArea.scrollTop = textArea.scrollHeight;
		}
	};
	
	if (Session.get("settings").autoscroll)
		textArea.scrollTop = textArea.scrollHeight;

	pageRendered.set(true);
});

Template.beforeThread.helpers({
	'threadId': function () {
		return this._id;
	}
});

Template.thread.helpers({
	'threadName': function() {
		return this.name;
	},
	'messages': () => {
		return Messages.find({}, {sort : {sortableTime: 1}});
	},
	'viewerCount': function() {
		let currentThread = Threads.findOne();

		if (currentThread)
			return currentThread.currentlyViewing.length;
	},
	'deviceSpecificClass': () => {
		if (Meteor.Device.isDesktop()) {
			return "desktopThreadRouteRootContainer";
		} else if (Meteor.Device.isPhone()) {
			return "phoneThreadRouteRootContainer";
		} else if (Meteor.Device.isTablet()) {
			return "tabletThreadRouteRootContainer";
		}
	},
	'isReadOnly': () => {
		return Session.get("settings").readonly ? "readonly" : "";
	}
});

Template.thread.events({
	'load img': function(e, t) {
		console.log("IMAGE LOADED");
		let textArea = t.find('#messagelist');

		if (Session.get("settings").autoscroll)
				textArea.scrollTop = textArea.scrollHeight;
	},
	'loadeddata video': function(e, t) {
		console.log("VIDEO LOADED");
		let textArea = t.find('#messagelist');

		if (Session.get("settings").autoscroll)
				textArea.scrollTop = textArea.scrollHeight;
	}
});