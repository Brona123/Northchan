import { rateLimiterTimeouts } from "/imports/api/rate-limiting/server/rate-limiting.js";
import { checkRateLimits } from "/imports/api/rate-limiting/server/rate-limiting.js";

Meteor.publish("sections", function(matcher, options) {
	check(matcher, Object);
	check(options, Match.Maybe(Object));
	checkRateLimits(this, "sections");

	return Sections.find(matcher, options);
});