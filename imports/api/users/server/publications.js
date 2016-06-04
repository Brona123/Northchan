import { rateLimiterTimeouts } from "/imports/api/rate-limiting/server/rate-limiting.js";
import { checkRateLimits } from "/imports/api/rate-limiting/server/rate-limiting.js";

Meteor.publish("adminAccountsListing", function() {
	checkRateLimits(this, "adminAccountsListing");

	return Meteor.users.find({});
});