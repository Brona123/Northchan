import { rateLimiterTimeouts } from "/imports/api/rate-limiting/server/rate-limiting.js";
import { checkRateLimits } from "/imports/api/rate-limiting/server/rate-limiting.js";

Meteor.publish("adminAllRoles", function() {
	checkRateLimits(this, "adminAllRoles");
	
	return Meteor.roles.find({});
});