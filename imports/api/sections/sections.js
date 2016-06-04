import "./methods.js";

Sections = new Mongo.Collection("sections");

Sections.allow({
	remove: (userId, doc) => {
		return Roles.userIsInRole(userId, ['superadmin']);
	}
});

export { Sections };