Meteor.users.allow({
	update: (userId, doc) => {
		return Roles.userIsInRole(userId, ['superadmin']);
	}
});