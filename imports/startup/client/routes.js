// Meteor Atmosphere imports
import { FlowRouter } from "meteor/kadira:flow-router";
import { BlazeLayout } from "meteor/kadira:blaze-layout";

// Layout and page imports
import "/imports/ui/layouts/root.js";
import "/imports/ui/pages/index/index.js";
import "/imports/ui/pages/section/section.js";
import "/imports/ui/pages/thread/thread.js";



// Shorthand for subscribing
const sbc = Meteor.subscribe;

FlowRouter.notFound = {
	action: function() {
		BlazeLayout.render("root", { "main" : "notFound"});
	}
}

FlowRouter.subscriptions = function() {
	this.register("currentConnections", sbc("currentConnections"));
	this.register("selfBanned", sbc("selfBanned"));
}

FlowRouter.triggers.enter(() => {
	Meteor.call("clearThreadView");
	Meteor.call("clearSectionView");
});

FlowRouter.route('/', {
	action(params, queryParams) {
		BlazeLayout.render("root", { "main": "beforeIndex"});
	},
	triggersExit() {
		// Unbinding infinite scrolling
		let scrollEvent = Meteor.Device.isDesktop() ? "scroll" : "touchMove";
		// TODO mobile scroll event ei pelitä
		$(window).unbind(scrollEvent);
	}
});

FlowRouter.route("/account-listing", {
	subscriptions(params, queryParams) {
		this.register("adminAccountsListing", sbc("adminAccountsListing"));
		this.register("adminAllRoles", sbc("adminAllRoles"));
		this.register("adminBannedUsers", sbc("adminBannedUsers"));
	},
	action(params, queryParams) {
		if (!Roles.userIsInRole(Meteor.user(), ['superadmin'])) {
			BlazeLayout.render("root", { "main": "unauthorized"});
		} else {
			BlazeLayout.render("root", { "main": "accountListing"});
		}
	}
});

FlowRouter.route("/:section", {
	action(params, queryParams) {
		Session.set("sectionId", params.section);
		Session.set("threadId", "");

		Meteor.call("setCurrentSection", params.section);
		BlazeLayout.render("root", { "main": "beforeSection"});
		
		document.title = params.section;
	}
});

FlowRouter.route("/:section/:threadslug", {
	action(params, queryParams) {
		Session.set("sectionId", params.section);
		Session.set("threadId", params.threadslug);

		Meteor.call("setCurrentSection", params.section);
		Meteor.call("setCurrentThread", params.threadslug);
		BlazeLayout.render("root", { "main": "beforeThread"});

		document.title = params.threadslug;
	}
});