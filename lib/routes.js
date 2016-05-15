// Shorthand for subscribing
let sbc = Meteor.subscribe;

Router.configure({
	layoutTemplate: "main",
	loadingTemplate: "loading",
	waitOn: function() {
		return sbc("currentConnections");
	}
});

Router.onBeforeAction(function() {
	Meteor.call("clearCurrentView");
	this.next();
});

Router.route("/", {
	name: "beforeIndex",
	waitOn: () => {
		return [sbc("sections"),
				sbc("sectionThreadStubs"),
				sbc("threadMessageStubs"),
				sbc("polls")];
	},
	onRun: function() {
		$('body').addClass(pageTheme.get().background);
		this.next();
	},
	onAfterAction: function() {
		document.title = "Northchan";
	}
});

Router.route("/unauthorized", {
	name: "unauthorized"
});

Router.route("/account-listing", {
	onBeforeAction: function() {
		if (!Roles.userIsInRole(Meteor.user(), ['superadmin'])) {
			this.render('unauthorized');
		} else {
			this.render('accountListing');
		}
	},
	waitOn: function() {
		if (Roles.userIsInRole(Meteor.user(), ['superadmin'])) {
			return [sbc("adminAccountsListing"),
					sbc("adminAllRoles")];
		}
	}
});

Router.route("/:section", {
	name: "beforeSection",
	waitOn: function() {
		Session.set("sectionId", this.params.section);
		Session.set("threadId", "");
		return [sbc("threads", this.params.section),
				sbc("sections"),
				sbc("polls")
				/*sbc("files")*/];
	},
	data: function() {
		return Sections.findOne({"name" : this.params.section});
	},
	onBeforeAction: function() {
		Meteor.call("setCurrentSection", this.params.section);
		this.next();
	},
	onAfterAction: function() {
		document.title = this.params.section;
	}
});

Router.route("/:section/:thread", {
	name : "beforeThread",
	waitOn: function() {
		Session.set("sectionId", this.params.section);
		Session.set("threadId", this.params.thread);
		return [sbc("thread", this.params.thread),
				sbc("messages", this.params.thread),
				/*sbc("files")*/,
				sbc("msgCount"),
				sbc("polls")];
	},
	data: function() {
		return Threads.findOne({"name" : this.params.thread});
	},
	onBeforeAction: function() {
		Meteor.call("setCurrentSection", this.params.section);
		Meteor.call("setCurrentThread", this.params.thread);
		this.next();
	},
	onAfterAction: function() {
		document.title = this.params.thread;
	}
});