BannedUsers = new Mongo.Collection("banned_users");

BannedUsers.allow({
	remove: (userId, doc) => {
		return Roles.userIsInRole(userId, ['superadmin']);
	}
});

export { BannedUsers };