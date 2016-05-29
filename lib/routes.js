// Shorthand for subscribing
const sbc = Meteor.subscribe;

Router.configure({
	layoutTemplate: "main",
	loadingTemplate: "loading",
	notFoundTemplate: "notFound",
	waitOn: function() {
		return [sbc("currentConnections"),
				sbc("selfBanned")];
	},
	onBeforeAction: function() {
		Meteor.call("clearCurrentView");

		if (BannedUsers.findOne(Session.get("hashId"))) {
			this.render("banned");
		} else {
			this.next();
		}
	}
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
		$('body').addClass(Session.get("pageTheme").class);
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
					sbc("adminAllRoles"),
					sbc("adminBannedUsers")];
		}
	}
});

Router.route("/:section", {
	name: "beforeSection",
	waitOn: function() {
		Session.set("sectionId", this.params.section);
		Session.set("threadId", "");
		
		return [sbc("threads", this.params.section),
				sbc("currentSection", this.params.section),
				sbc("polls")];
	},
	data: function() {
		const section = Sections.findOne({"name" : this.params.section});
		return section ? section : undefined;
	},
	onBeforeAction: function() {
		Meteor.call("setCurrentSection", this.params.section);
		this.next();
	},
	onAfterAction: function() {
		document.title = this.params.section;
	}
});

// TODO thread slug perusteella setit
Router.route("/:section/:threadslug", {
	name : "beforeThread",
	waitOn: function() {
		Session.set("sectionId", this.params.section);
		Session.set("threadId", this.params.threadslug);

		return [sbc("thread", this.params.threadslug),
				sbc("messages", this.params.threadslug),
				sbc("msgCount"),
				sbc("polls")];
	},
	data: function() {
		const thread = Threads.findOne({"slug" : this.params.threadslug});
		return thread ? thread : undefined;
	},
	onBeforeAction: function() {
		Meteor.call("setCurrentSection", this.params.section);
		Meteor.call("setCurrentThread", this.params.threadslug);
		this.next();
	},
	onAfterAction: function() {
		document.title = this.params.threadslug;
	}
});