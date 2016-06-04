Meteor.methods({
	banUser(id, reason, messageContent, modId) {
		check(id, String);
		check(reason, String);
		check(messageContent, String);
		check(modId, String);

		if (Roles.userIsInRole(Meteor.userId(), ['superadmin','moderator'])) {
			BannedUsers.upsert(id, {"reason" : reason
									, "message" : messageContent
									, "bannedBy" : modId});
		}
	}
});