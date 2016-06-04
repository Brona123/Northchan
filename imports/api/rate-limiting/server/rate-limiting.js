import { BannedUsers } from "/imports/api/banned-users/banned-users.js";
import { debugLog } from "/imports/api/utils/utils.js";

RateLimiting = new Mongo.Collection("rate_limiting");

export const rateLimiterTimeouts = [];

export const checkRateLimits = function(context, name) {
	if (!Meteor.isProduction) return;
	
	if (BannedUsers.findOne(SHA256(context.connection.clientAddress))) {
		return;
	}
	
	debugLog(`RATE LIMIT ${name}`);
	const subLimit = 50;
	const timeLimit = 1000;
	const clientAddress = context.connection.clientAddress;

	if (RateLimiting.findOne(clientAddress)) {
		if (RateLimiting.findOne(clientAddress)[name] > subLimit) {
			BannedUsers.upsert(SHA256(clientAddress)
								, {"reason" : "Banned for spamming subscriptions"
									, "message" : "null"
									, "bannedBy" : "System"});
			return;
		}
	}

	const publications = {};
	publications[name] = 1;
	RateLimiting.upsert(clientAddress, {$inc : publications});

	if (!rateLimiterTimeouts[name]) {
		rateLimiterTimeouts[name] = Meteor.setTimeout(() => {
			publications[name] = 0;
			RateLimiting.upsert(clientAddress, {$set : publications});
			rateLimiterTimeouts[name] = undefined;
		}, timeLimit);
	}
}

export { RateLimiting };