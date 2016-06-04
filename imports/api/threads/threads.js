import "./methods.js";

Threads = new Mongo.Collection("threads");

Threads.allow({
	remove: (userId, doc) => {
		return Roles.userIsInRole(userId, ['superadmin', 'moderator']);
	}
});

export { Threads };