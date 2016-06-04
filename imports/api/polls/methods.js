Meteor.methods({
	vote(pollId, option) {
		check(pollId, String);
		check(option, String);

		const poll = Polls.findOne(pollId);

		if (Meteor.isServer) {
			const cIP = this.connection.clientAddress;

			// If client has already voted, deny action
			if (Polls.findOne({"_id" : pollId, "alreadyVoted" : cIP})) {
				return;
			}

			poll.options.forEach((elem, index, array) => {
				if (elem.option === option) {
					elem.voteCount++;
				}
			});

			Polls.upsert(pollId, {$set : {"options" : poll.options}});
			Polls.upsert(pollId, {$push : {"alreadyVoted" : cIP}});
		}
	}
});