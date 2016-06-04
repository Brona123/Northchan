var selectedPerson = new ReactiveVar();

Template.accountListing.helpers({
	allAccounts() {
		return Meteor.users.find({}, {sort : {"roles" : -1, "name" : 1}});
	},
	JSONStringify(json) {
		return JSON.stringify(json);
	},
	selectedUser() {
		return selectedPerson.get();
	},
	userRoles(selectedUser) {
		return Roles.getRolesForUser(selectedUser);
	},
	allRoles() {
		return Roles.getAllRoles().fetch();
	},
	bannedUsers() {
		return BannedUsers.find();
	},
	userName(id) {
		return Meteor.users.findOne(id).username;
	}
});

Template.accountListing.events({
	'click button[name="modifyRole"]': (e, t) => {
		const userId = $(e.target).attr("data-userid");

		selectedPerson.set(Meteor.users.findOne(userId));
	},
	'click button[name="removeRole"]': (e, t) => {
		const role = $(e.target).attr("data-role");
		const userId = $(e.target).attr("data-userid");

		Roles.removeUsersFromRoles(userId, role);
	},
	'click button[name="addRole"]': (e, t) => {
		const role = $(e.target).attr("data-role");
		const userId = $(e.target).attr("data-userid");

		Roles.addUsersToRoles(userId, role);
	},
	'click button[name="unban"]': (e, t) => {
		const userId = $(e.target).attr("data-userid");

		BannedUsers.remove(userId);
	}
});