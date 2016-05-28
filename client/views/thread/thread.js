var pageRendered = new ReactiveVar(false);

Template.thread.onCreated(() => {
	pageRendered.set(false);
});

Template.thread.onRendered(function () {
	const template = Template.instance();
	const textArea = template.find('#messagelist');

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
	threadId() {
		return this._id;
	}
});

Template.thread.helpers({
	threadName() {
		return this.name;
	},
	messages() {
		return Messages.find({}, {sort : {sortableTime: 1}});
	},
	viewerCount() {
		let currentThread = Threads.findOne();

		if (currentThread)
			return currentThread.currentlyViewing.length;
	},
	deviceSpecificClass() {
		if (Meteor.Device.isDesktop()) {
			return "desktopThreadRouteRootContainer";
		} else if (Meteor.Device.isPhone()) {
			return "phoneThreadRouteRootContainer";
		} else if (Meteor.Device.isTablet()) {
			return "tabletThreadRouteRootContainer";
		}
	},
	isReadOnly() {
		return Session.get("settings").readonly ? "readonly" : "";
	}
});

Template.thread.events({
	'load img': function(e, t) {
		const textArea = t.find('#messagelist');

		if (Session.get("settings").autoscroll)
				textArea.scrollTop = textArea.scrollHeight;
	},
	'loadeddata video': function(e, t) {
		const textArea = t.find('#messagelist');

		if (Session.get("settings").autoscroll)
				textArea.scrollTop = textArea.scrollHeight;
	}
});