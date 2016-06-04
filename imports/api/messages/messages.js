import "./methods.js";

Messages = new Mongo.Collection("messages");

Messages.allow({
	remove: (userId, doc) => {
		return Roles.userIsInRole(userId, ['superadmin', 'moderator']);
	}
});

export { Messages };