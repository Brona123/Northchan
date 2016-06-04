import { rateLimiterTimeouts } from "/imports/api/rate-limiting/server/rate-limiting.js";
import { checkRateLimits } from "/imports/api/rate-limiting/server/rate-limiting.js";

Meteor.publish("msgCount", function () {
	checkRateLimits(this, "msgCount");

	return Metadata.find();
});