function getDeviceClass() {
	if (Meteor.Device.isDesktop()) {
		return "desktop";
	} else if (Meteor.Device.isTablet()) {
		return "tablet";
	} else if (Meteor.Device.isPhone()) {
		return "phone";
	}
}

Template.main.onRendered(function() {
	Tracker.autorun(function() {
		let theme = Session.get("pageTheme");
		console.log("CHANGED THEME");

		if (theme) {
			$('body').removeClass();
			$('body').addClass(theme.background);
			$('body').addClass(getDeviceClass());
		}
	});
});

Template.main.events({
	'change #theme': function(e, t) {
		let theme = $('#theme').val();

		themes.forEach((elem, index, arr) => {
			if (elem.name === theme) {
				Session.update("pageTheme", elem);
			}
		});
	},
	'submit #accountActionForm': function(e, t) {
		e.preventDefault();

		let accountName = $("input[name='accountName']").val().trim();
		let accountPassword = $("input[name='accountPassword']").val().trim();

		let options = {
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
		let settings = Session.get("settings");
		settings.autoscroll = !settings.autoscroll;

		Session.update("settings", settings);
	},
	'click input[name="readonly"]': (e, t) => {
		let settings = Session.get("settings");
		settings.readonly = !settings.readonly;

		Session.update("settings", settings);
	},
	'click input[name="reactive"]': (e, t) => {
		let settings = Session.get("settings");
		settings.reactive = !settings.reactive;

		Session.update("settings", settings);
	}
});

Template.main.helpers({
	'connectedClientAmount' : () => {
		if (ConnectedClients.findOne()) 
			return ConnectedClients.findOne().count;
	},
	'currentSection' : () => {
		return Session.get("sectionId");
	},
	'currentThread': () => {
		return Session.get("threadId");
	},
	'themes': () => {
		return themes;
	},
	'isSelected': (name) => {
		if (Session.get("pageTheme").name === name) {
			return "selected";
		}
	},
	'autoscrollToggled': () => {
		return Session.get("settings").autoscroll;
	},
	'readonlyToggled': () => {
		return Session.get("settings").readonly;
	},
	'reactiveToggled': () => {
		return Session.get("settings").reactive;
	}
});

/*
Template.message.events({
	'submit #messageForm': function (event) {
		event.preventDefault();
		var msg = event.target.message.value;

		Messages.insert({"message" : msg});
	},
	'change #fileUpload': function(event, template) {
		FS.Utility.eachFile(event, function(file) {
	        Files.insert(file, function (err, fileObj) {
	          	if (err){
	            	
	          	} else {
	            	console.log("File upload done!");
	          	}
	        });
	    });
	},
	'dropped #filedrop': function(e, t) {
		e.preventDefault();

		console.log("FILE DROPPED");

		FS.Utility.eachFile(event, function(file) {
			console.log(file);
	        Files.insert(file, function (err, fileObj) {
	        	console.log('Inserted file ');
	        	console.log(fileObj);
	        });
	    });
	},
	'click .fileref': function(e, t) {
		e.preventDefault();

		let id = $(e.currentTarget).attr('id');
		let file = Files.findOne(id);

		let controller = Iron.controller();
		controller.render("content", {to : "content"
									, data : function(){ return file; }});
		
	}
});

Template.message.helpers({
	'messages' : function () {
		return Messages.find().fetch();
	},
	'files' : function () {
		console.log(Files.find().fetch());
		return Files.find().fetch();
	},
	'log' : function(data) {
		console.log(data);
	}
});
*/