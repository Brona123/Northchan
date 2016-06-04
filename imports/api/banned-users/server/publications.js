import { rateLimiterTimeouts } from "/imports/api/rate-limiting/server/rate-limiting.js";
import { checkRateLimits } from "/imports/api/rate-limiting/server/rate-limiting.js";

Meteor.publish("selfBanned", function() {
	checkRateLimits(this, "selfBanned");

	let id = SHA256(this.connection.clientAddress);

	return BannedUsers.find(id);
});

Meteor.publish("adminBannedUsers", function() {
	checkRateLimits(this, "adminBannedUsers");

	return BannedUsers.find({});
});