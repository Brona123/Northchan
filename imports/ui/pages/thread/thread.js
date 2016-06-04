import "./thread.html";
import "/imports/ui/components/message-container.js";
import "/imports/ui/components/input-message.js";

import { Sections } from "/imports/api/sections/sections.js";
import { Threads } from "/imports/api/threads/threads.js";
import { Messages } from "/imports/api/messages/messages.js";
import { Session } from "meteor/session";

let pageRendered = new ReactiveVar(false);

Template.thread.onCreated(function () {
	pageRendered.set(false);

	this.autorun(function() {
		const sectionMatcher = {
			"name" : FlowRouter.getParam("section")
		}
		Meteor.subscribe("sections", sectionMatcher, {});

		const threadMatcher = {
			"slug" : FlowRouter.getParam("threadslug")
		}
		Meteor.subscribe("threads", threadMatcher, {});

		const messageOptions = {
			"threadName" : FlowRouter.getParam("threadslug")
		};
		Meteor.subscribe("messages", {}, messageOptions);
	});
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
	sectionId() {
		const sectionName = FlowRouter.getParam("section");
		const section = Sections.findOne({"name" : sectionName});

		if (section)
			return section._id;
	},
	threadId() {
		const threadSlug = FlowRouter.getParam("threadslug");
		const thread = Threads.findOne({"slug" : threadSlug});

		if (thread)
			return thread._id;
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