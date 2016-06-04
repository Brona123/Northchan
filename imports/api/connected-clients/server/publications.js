import { rateLimiterTimeouts } from "/imports/api/rate-limiting/server/rate-limiting.js";
import { checkRateLimits } from "/imports/api/rate-limiting/server/rate-limiting.js";

Meteor.publish("currentConnections", function () {
	checkRateLimits(this, "currentConnections");

	return ConnectedClients.find({}, {$fields : {"_id" : 0}});
});