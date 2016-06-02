const templateRendered = new ReactiveVar(false);

Template.threadContainer.onCreated(function() {
	templateRendered.set(false);
});

Template.threadContainer.onRendered(function() {
	templateRendered.set(true);
});

Template.threadContainer.helpers({
	firstLines(initialText) {
		if (!FlowRouter.subsReady()) return;

		if (!initialText) {
			return;
		}

		if (initialText.length < 140) {
			return initialText;
		} else {
			return initialText.substr(0, 140) + " ...";
		}
	},
	truncateHeader(header) {
		if (!FlowRouter.subsReady()) return;
		if (!header) return;

		if (header.length < 20) {
			return header;
		} else {
			return header.substr(0, 20) + " ...";
		}
	},
	pollHtml(pollId) {
		if (templateRendered.get()) {
			const ctx = document.getElementById(pollId).getContext("2d");

			if (ctx) {
				const poll = Polls.findOne(pollId);

				if (!poll) return;

				const data = [];

				poll.options.forEach((elem, index, array) => {
					data.push({
						label : elem.option,
						value : elem.voteCount,
						color : elem.bgColor
					});
				});

				const options = {
					animation : false,
					tooltipTemplate: "<%= label %> - <%= value %>",
					showToolTips: true,
					onAnimationComplete: function() {
						this.showTooltip(this.segments, true);
					},
					tooltipEvents: [],
					responsive: true,
					maintainAspectRatio: true
				}

				new Chart(ctx).Pie(data, options);
			}
		}
	},
	pollTitle(pollId) {
		if (!FlowRouter.subsReady()) return;

		const poll = Polls.findOne(pollId);

		if (poll)
			return poll.pollTitle;
	},
	messageCount(threadId) {
		const messages = Messages.find({"threadId" : threadId});

		if (messages)
			return messages.count();
	}
});

Template.threadContainer.events({
	'click button[name="deleteThread"]': function(e, t) {
		e.preventDefault();

		const threadId = $(e.target).attr("data-thread-id");

		Threads.remove(threadId);
	}
});