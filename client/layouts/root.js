function getDeviceClass() {
	if (Meteor.Device.isDesktop()) {
		return "desktop";
	} else if (Meteor.Device.isTablet()) {
		return "tablet";
	} else if (Meteor.Device.isPhone()) {
		return "phone";
	}
}

Template.root.onRendered(function() {
	console.log("ROOT RENDERED");
	
	Tracker.autorun(function() {
		const theme = Session.get("pageTheme");

		if (theme) {
			$('body').removeClass();
			$('body').addClass(theme.class);
			$('body').addClass(getDeviceClass());
		}
	});
});

Template.root.events({
	'change #theme': function(e, t) {
		const theme = $('#theme').val();

		themes.forEach((elem, index, arr) => {
			if (elem.name === theme) {
				Session.update("pageTheme", elem);
			}
		});
	},
	'submit #accountActionForm': function(e, t) {
		e.preventDefault();

		const accountName = $("input[name='accountName']").val().trim();
		const accountPassword = $("input[name='accountPassword']").val().trim();

		const options = {
			username : accountName,
			password : accountPassword
		}

		if ($("input[name='registering']").prop("checked")) {
			Accounts.createUser(options, (error) => {
				if (error) {
					alert("Error: " + error);
				} else {
					$('#accountModal').modal('hide');
				}
			});
		} else {
			Meteor.loginWithPassword(accountName, accountPassword, (error) => {
				if (error) {
					alert("Error: " + error);
				} else {
					$('#accountModal').modal('hide');
				}
			});
		}
	},
	'click #logoutButton': (e, t) => {
		Meteor.logout();
	},
	'click input[name="autoscroll"]': (e, t) => {
		const settings = Session.get("settings");
		settings.autoscroll = !settings.autoscroll;

		Session.update("settings", settings);
	},
	'click input[name="readonly"]': (e, t) => {
		const settings = Session.get("settings");
		settings.readonly = !settings.readonly;

		Session.update("settings", settings);
	},
	'click input[name="reactive"]': (e, t) => {
		const settings = Session.get("settings");
		settings.reactive = !settings.reactive;

		Session.update("settings", settings);
	},
	'click input[name="lightweight"]': (e, t) => {
		const settings = Session.get("settings");
		settings.lightweight = !settings.lightweight;

		console.log("Lightweight " + settings.lightweight);
		Session.update("settings", settings);
	}
});

Template.root.helpers({
	connectedClientAmount() {
		if (ConnectedClients.find()) 
			return ConnectedClients.find().count();
	},
	currentSection() {
		return Session.get("sectionId");
	},
	currentThread() {
		return Session.get("threadId");
	},
	themes() {
		return themes;
	},
	isSelected(name) {
		if (Session.get("pageTheme").name === name) {
			return "selected";
		}
	},
	autoscrollToggled() {
		return Session.get("settings").autoscroll;
	},
	readonlyToggled() {
		return Session.get("settings").readonly;
	},
	reactiveToggled() {
		return Session.get("settings").reactive;
	},
	lightweightToggled() {
		return Session.get("settings").lightweight;
	}
});