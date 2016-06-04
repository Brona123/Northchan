import { rateLimiterTimeouts } from "/imports/api/rate-limiting/server/rate-limiting.js";
import { checkRateLimits } from "/imports/api/rate-limiting/server/rate-limiting.js";

Meteor.publish("messages", function(matcher, options) {
	const matcherPattern = {
		sectionId : Match.Maybe(String),
		threadId : Match.Maybe(String)
	}
	check(matcher, matcherPattern);
	check(options, Object);
	checkRateLimits(this, "messages");

	if (options.sectionName) {
		let section = Sections.findOne({name : options.sectionName});

		return Messages.find({sectionId : section._id}, options);
	} else if (options.threadName) {
		let thread = Threads.findOne({name : options.threadName});

		return Messages.find({threadId : thread._id}, options);
	} else {
		return Messages.find(matcher, options);
	}
});