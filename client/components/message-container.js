var pollChart;
var templateRendered = new ReactiveVar(false);

Template.messageContainer.onCreated(function () {
	templateRendered.set(false);
});

Template.messageContainer.onRendered(function () {
	templateRendered.set(true);
});

Template.messageContainer.helpers({
	'finnishDate': (date) => {
		if (date)
			return finnishDate(date);
	},
	'styleLikes': function(likeCount) {
		if (!likeCount) {
			return "";
		}

		let elem = $("<span />");

		if (likeCount < 0) {
			elem.addClass("disliked");
			elem.text(likeCount);
		} else if (likeCount > 0) {
			elem.addClass("liked");
			elem.text("+" + likeCount);
		} else {
			elem.text("0");
		}
		
		return elem.prop('outerHTML');
	},
	'replyMsg': function(msgCount) {
		let msg = Messages.findOne({"count" : msgCount});

		if (msg) {
			let text = msg.msg;

			return "<p>" + text + "</p>";
		} else {
			return "";
		}
	},
	'formatMsg': function(msg) {
		return formatMsg(msg);
	},
	'pollHtml': function (pollId) {
		if (templateRendered.get()) {
			var ctx = document.getElementById(pollId).getContext("2d");

			if (ctx) {
				let poll = Polls.findOne(pollId);

				var data = [];

				poll.options.forEach((elem, index, array) => {
					data.push({
						label : elem.option,
						value : elem.voteCount,
						color : elem.bgColor
					});
				});

				if (pollChart) {
					pollChart.destroy();
				}

				var options = {
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

				pollChart = new Chart(ctx).Pie(data, options);
			}
		}
	},
	'pollOptions': function (pollId) {
		let poll = Polls.findOne(pollId);

		if (poll)
			return poll.options;
	},
	'cacheUrl': function() {
		console.log(currentUploader.get());
		// Can only preload images
		// currentUploader.file.type === "video/mp4"
		return currentUploader.get().url(true);
	},
	'votes': function(pollId) {
		console.log(Polls.findOne(pollId).alreadyVoted);
		return Polls.findOne(pollId).alreadyVoted;
	}
});

Template.messageContainer.events({
	'click .rate-up': function(e, t) {
		let msgId = $(e.target).attr("data-msg-id");

		Meteor.call('rateMessageUpsert'
					, msgId
					, {$inc : {likes : 1}});
	},
	'click .rate-down': function(e, t) {
		let msgId = $(e.target).attr("data-msg-id");

		Meteor.call('rateMessageUpsert'
					, msgId
					, {$inc : {likes : -1}});
	},
	'click .reply': function(e, t) {
		e.preventDefault();

		let msgId = $(e.target).attr("data-msg-id");

		let count = Messages.findOne(msgId).count;

		let textarea = $("textarea[name='msg']");
		textarea.val(textarea.val() + "#" + count + "\n");
		textarea.focus();
	},
	'click .replies a': function(e, t) {
		let id = $(e.target).attr('href');

		let elem = $(id).get(0);

		elem.scrollIntoView();
	},
	'click .reference': function(e, t) {
		let id = $(e.target).attr('href');

		let elem = $(id).get(0);

		elem.scrollIntoView();
	},
	'mouseenter .reference': function(e, t) {
		displayPopover($(e.target));
	},
	'mouseenter .replies a': function(e, t) {
		displayPopover($(e.target));
	},
	'click .content .file': function(e, t) {
		let elem = $(e.target);

		elem.parent().toggleClass("minimized");
		console.log("ELEM:");
		console.log(elem);
		elem.prop("controls", elem.prop("controls") ? false : true);
		// TODO resize figure
	},
	'click .voteBtn': function(e, t) {
		console.log($("#optionSelection").val());
		console.log($(e.target).attr("data-pollId"));
		
		let pollId = $(e.target).attr("data-pollId");
		let option = $("#optionSelection").val();

		Meteor.call("vote", pollId, option);
	},
	'click button[name="deleteMessage"]': function(e, t) {
		let msgId = $(e.target).attr("data-msg-id");
		
		Messages.remove(msgId);
	},
	'click button[name="banUser"]': function(e, t) {
		console.log($(e.target).attr("data-owner-id"));
		let id = $(e.target).attr("data-owner-id");
		let msgId = $(e.target).attr("data-msg-id");

		let msgContent = Messages.findOne(msgId).msg;
		let modId = Meteor.userId();

		// TODO UI bannin syyn antamiselle
		let reason = "U're banned!";

		Meteor.call("banUser"
					, id
					, "U're banned!"
					, msgContent
					, modId);
	}
});

function finnishDate(date) {
	return date.getDate()
				+ "."
				+ (date.getMonth() + 1)
				+ "."
				+ date.getFullYear()
				+ " "
				+ prependZero(date.getHours())
				+ ":"
				+ prependZero(date.getMinutes())
				+ ":"
				+ prependZero(date.getSeconds());
}

function formatMsg(msg) {
	let splittedMsg = msg.split("\n");
	let formattedMsg = "";

	splittedMsg.forEach((elem, index, arr) => {
		if (elem.startsWith("<")) {
			formattedMsg += ("<span class='bluetext'> &lt;" 
								+ elem.substring(1, elem.length) 
								+ " </span>\n");
		} else if (elem.startsWith(">")) {
			formattedMsg += ("<span class='greentext'> &gt;" 
								+ elem.substring(1, elem.length)
								+ " </span>\n");
		} else {
			formattedMsg += elem + "\n";
		}
	});

	let msgWithLinks = formattedMsg.replace(/(?:https?)[^\s]+/g
											, "<a href='$&'>$&</a>");
	
	let msgWithTooltips = msgWithLinks.replace(/#\d+/g
										, "<a class='reference'"
						                    + " href='$&'>"
						                    + "$&"
						                    + "</a>");

	let msgWithLineBreaks = msgWithTooltips.replace(/\n/g, "<br />");

	return msgWithLineBreaks;
}

function prependZero(str) {
	if (str < 10) {
		return "0" + str;
	} else {
		return str;
	}
}

function displayPopover(target) {
	let msgRef = target.attr('href');
	let count = parseCount(msgRef);
	let msg = Messages.findOne({"count" : count});
	let content = Blaze.toHTMLWithData(Template["messageContainer"], msg).replace(/>\s+</g,'><');

	if (msg) {
		target.popover({
			placement: 'right',
			trigger: 'hover',
			html: true,
			container: 'body',
			content: content
		}).popover('show');
	} else {
		// TODO call method when message not published in thread
		// and referencing it
	}
}

function parseCount(ref) {
	return +ref.match(/\d+/)[0];
}