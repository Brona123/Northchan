import { rateLimiterTimeouts } from "/imports/api/rate-limiting/server/rate-limiting.js";
import { checkRateLimits } from "/imports/api/rate-limiting/server/rate-limiting.js";
import { Sections } from "/imports/api/sections/sections.js";

Meteor.publish("threads", function(matcher, options) {
	const matcherPattern = {
		sectionId : Match.Maybe(Object),
		threadId : Match.Maybe(String),
		slug : Match.Maybe(String)
	}
	check(matcher, matcherPattern);
	check(options, Object);
	checkRateLimits(this, "threads");

	if (options.calculateLimit) {
		const threadsTotal = Sections.find().count() * options.calculateLimit.threadsPerSection;
		options.limit = threadsTotal;

		console.log("threads limited to " + threadsTotal);
		return Threads.find(matcher, options);		
	} else if (options.sectionName) {
		const section = Sections.findOne({"name" : options.sectionName});

		return Threads.find({sectionId : section._id});
	} else {
		return Threads.find(matcher, options);
	}
});