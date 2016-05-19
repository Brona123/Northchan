var pageRendered = new ReactiveVar(false);
var pollChart;
var charactersTyped = new ReactiveVar("");

Template.thread.onCreated(function () {
	pageRendered.set(false);
});

Template.thread.onRendered(function () {
	let template = Template.instance();
	let textArea = template.find('#messagelist');

	this.find('#messagelist')._uihooks = {
		insertElement: function(node, next) {
			$(node).hide().insertBefore(next).fadeIn();

			if (Session.get("settings").autoscroll)
				textArea.scrollTop = textArea.scrollHeight;
		}
	};
	
	if (Session.get("settings").autoscroll)
		textArea.scrollTop = textArea.scrollHeight;

	pageRendered.set(true);
});

Template.thread.helpers({
	'threadName': function() {
		return this.name;
	},
	'messages': () => {
		return Messages.find({}, {sort : {sortableTime: 1}});
	},
	'getUrl' : (fileId) => {
		let file = Files.findOne(fileId);
		
		return file.url();
	},
	'getOrigSize': (fileId) => {
		let file = Files.findOne(fileId);

		return file.size();
	},
	'getFile': (fileId) => {
		return Files.findOne(fileId);
	},
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

		//likeCount < 0 ? elem.addClass("disliked") : elem.addClass("liked") elem.text("+" + likeCount);
		
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
	'viewerCount': function() {
		let currentThread = Threads.findOne();

		if (currentThread)
			return currentThread.currentlyViewing.length;
	},
	'formatBytes': function(bytes) {

		if ((bytes / 1024) / 1024 > 1) {
			return ((bytes / 1024) / 1024).toFixed(2) + " MB";
		} else if (bytes / 1024 > 1) {
			return (bytes / 1024).toFixed(2) + " KB";
 		} else {
 			return bytes + " bytes";
 		}
	},
	'deviceSpecificClass': () => {
		if (Meteor.Device.isDesktop()) {
			return "desktopThreadRouteRootContainer";
		} else if (Meteor.Device.isPhone()) {
			return "phoneThreadRouteRootContainer";
		} else if (Meteor.Device.isTablet()) {
			return "tabletThreadRouteRootContainer";
		}
	},
	'pollHtml': function (pollId) {
		if (pageRendered.get()) {
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
	'isReadOnly': () => {
		return Session.get("settings").readonly ? "readonly" : "";
	}
});

Template.thread.events({
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
		displayRefTooltip($(e.target));
	},
	'mouseenter .replies a': function(e, t) {
		displayRefTooltip($(e.target));
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

Template.input.events({
	'submit #sendMessage': function(e, t) {
		e.preventDefault();

		let threadId = this._id;
		let message = $("textarea[name='msg']").val();
		let file = $("input[name='msgFile']").prop('files')[0];
		let embedLink = getVideoEmbedLink($("input[name='embed']").val());

		let replies = parseReplies(message);
		let msgCount = Metadata.findOne().msgCount;

		if (replies) {
			storeReplies(replies, msgCount);
		}

		if (embedLink) {
			Meteor.call("insertMessageWithEmbed", embedLink, threadId, message, msgCount);
		} else if (file) {
			insertMessageWithFile(file, threadId, message, msgCount);
		} else {
			Meteor.call("insertMessage", threadId, message, msgCount);
		}

		let form = $("#sendMessage")[0];
		form.reset();
		charactersTyped.set(0);
	},
	'click #hideInputArea': function(e, t) {
		$(".inputArea").toggleClass("minimized");
		//$(".inputArea").toggleClass("col-xs-12");
		//$(".inputArea").toggleClass("col-xs-2");
		$("#messagelist").toggleClass("maximized");
		$("#hideInputArea").toggleClass("glyphicon-chevron-down");
		$("#hideInputArea").toggleClass("glyphicon-chevron-up");


	},
	'change .btn-file :file': function(e, t) {
		let fileName = $(".btn-file :file").val().split("\\").pop();
		$("#filePath").val(fileName);
	},
	'keyup #sendMessage textarea[name="msg"]' : function(e, t) {
		let currentCharacters = $("#sendMessage textarea[name='msg']").val().length;
		let maxCharacters = $("#sendMessage textarea[name='msg']").attr("maxlength");

		charactersTyped.set(currentCharacters + " / " + maxCharacters);
	}
});

Template.input.helpers({
	'uploadProgress': () => {
		let uploader = currentUploader.get();

		if (uploader) {
			return Math.round(uploader.progress() * 100) || 0;
		}
	},
	'deviceClass': () => {
		if (Meteor.Device.isDesktop()) {
			return "desktop";
		} else if (Meteor.Device.isPhone()) {
			return "phone";
		} else if (Meteor.Device.isTablet()) {
			return "tablet";
		}
	},
	'charactersTyped': () => {
		return charactersTyped.get();
	}
});

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

function displayRefTooltip(target) {
	let msgRef = target.attr('href');
	let count = parseCount(msgRef);
	let msg = Messages.findOne({"count" : count});

	if (msg) {
		target.popover({
			placement: 'right',
			trigger: 'hover',
			html: true,
			container: 'body',
			content: messageAsHtml(msg)
		}).popover('show');
	} else {
		// TODO call method when message not published in thread
		// and referencing it
	}
}

function messageAsHtml(msg) {
	var html =  '<section class="messageContainer ' + Session.get("pageTheme").message + '">'
	      		+ '<div class="metadata">'
	        	+ '<time>' + finnishDate(msg.timestamp) + '</time>'
				+ '<a href="' + msg.count + ' class="reply" data-msg-id="' + msg._id + '">#' + msg.count + '</a>'
	      		+ '</div>'
	      		+ '<hr />'
				+ '<div class="content">';

    if (msg.embedLink) {
    	html += '<div class="embed">'
		        + '<iframe src="' + msg.embedLink + '" frameborder="0" allowfullscreen></iframe>'
		      	+ '</div>';
    } else if (msg.downloadUrl) {
    	html += '<div class="minimized">' + correspondingFileHtml(msg.downloadUrl) + '</div>';
    }

    html += '<span class="msg">' + formatMsg(msg.msg) + '</span></div>';

    if (msg.replies) {
    	html += '<hr />'
		    	+ '<section class="replies">'
		    	+ 'Replies:';

    	msg.replies.forEach((elem, index, arr) => {
    		html += '<a href="#' + elem + '">#' + elem + '</a>';
    	});
    }

    html += '</section></section>';

	return html;
}

function parseCount(ref) {
	return +ref.match(/\d+/)[0];
}

function insertMessageWithFile(file, threadId, message, msgCount) {
	let uploader = new Slingshot.Upload("fileUploads");
	
	uploader.send(file, function(error, downloadUrl) {
		currentUploader.set();

		if (error) {
			console.log(error);

			let fileInput = $("input[name='msgFile']");
			let container = $(".inputArea");
			
			fileInput.popover({
				placement: 'top',
				container : '.inputArea',
				html: true,
				content: "<div> File size too big </div>"
			}).popover('show');

			// TODO oikeaan kohtaan popover
			
			Meteor.setTimeout(() => {
				fileInput.popover('hide');
			}, 2000);
			
		} else {
			let fileName = file.name;
			let fileFolder = "files/";
			let properFileDownloadUrl = "http://files.northchan.com/" + fileFolder + fileName;
			
			Meteor.call("insertMessageWithFile"
						, threadId
						, message
						, properFileDownloadUrl
						, msgCount);
		}
	});

	currentUploader.set(uploader);
}

function storeReplies(replies, msgCount) {
	if (replies.length === 0) {
		return;
	}
	
	Meteor.call("storeReplies", replies, msgCount);
}

function parseReplies(msg) {
	// If message doesn't have references, return empty array
	if (!msg.includes("#")) {
		return [];
	}

	// Match all strings beginning with '#'
	// and continuing with a digit
	let matcher = msg.match(/#\d+/g);

	var replies = [];
	matcher.forEach((e, i, a) => {
		// Filter out the '#' char and push digits
		// to replies array
		replies.push(+e.substring(1, e.length));
	});

	// Return only unique references
	// so ppl can't spam reference one message
	return $.unique(replies);
}

function prependZero(str) {
	if (str < 10) {
		return "0" + str;
	} else {
		return str;
	}
}