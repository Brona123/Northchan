import { rateLimiterTimeouts } from "/imports/api/rate-limiting/server/rate-limiting.js";
import { checkRateLimits } from "/imports/api/rate-limiting/server/rate-limiting.js";

Meteor.publish("polls", function () {
	checkRateLimits(this, "polls");

	return Polls.find({}, {$fields : {"alreadyVoted" : 0}});
});