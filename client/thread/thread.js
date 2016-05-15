var autoScrolling = true;
var currentUploader = new ReactiveVar();
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

			if (autoScrolling)
				textArea.scrollTop = textArea.scrollHeight;
			
		}
	};
	
	if (autoScrolling)
		textArea.scrollTop = textArea.scrollHeight;

	$('[data-toggle="tooltip"]').tooltip();
	// TODO tooltip initialisaatio uuden postin ohessa
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
	'properHTML': function(downloadUrl) {
		if (!downloadUrl) return;

		return correspondingFileHtml(downloadUrl);
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
			console.log("REACTIVE CANVAS INSIDE");
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
					maintainAspectRatio: false
				}

				pollChart = new Chart(ctx).Pie(data, options);
			}
		}
		console.log("REACTIVE CANVAS");
	},
	'pollOptions': function (pollId) {
		let poll = Polls.findOne(pollId);

		if (poll)
			return poll.options;
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
	'click #autoscroll': function(e, t) {
		autoScrolling = $(e.target).prop("checked");
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
		console.log($(e.target).attr("data-option"));
		console.log($(e.target).attr("data-pollId"));
		
		let pollId = $(e.target).attr("data-pollId");
		let option = $(e.target).attr("data-option");

		Meteor.call("vote", pollId, option);
	}
});

Template.input.events({
	'submit #sendMessage': function(e, t) {
		e.preventDefault();

		let threadId = this._id;
		let message = $("textarea[name='msg']").val();
		let file = $("input[name='msgFile']").prop('files')[0];
		let embedLink = getVideoEmbedLink($("input[name='embed']").val());

		// TODO embed parsetus perus linkistä embed linkiksi
		// youtube/vimeo etc.. 
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
	},
	'click #hideInputArea': function(e, t) {
		$(".inputArea").toggleClass("minimized");
		$(".inputArea").toggleClass("col-xs-12");
		$(".inputArea").toggleClass("col-xs-2");
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

		console.log(currentCharacters + " / " + maxCharacters);
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
		console.log("sdfg");
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

function correspondingFileHtml(downloadUrl) {
	if (downloadUrl.endsWith(".mp4")) {
		return "<div class='file minimized'> <video src='" + downloadUrl + "' /> </div>";
	} else if (downloadUrl.endsWith(".png") || downloadUrl.endsWith(".jpg")) {
		return "<div class='file minimized'> <img src='" + downloadUrl + "'> </div>";
	} else if (downloadUrl.endsWith(".mp3")) {
		return "<div class='file'><audio src='" + downloadUrl + "' controls /> </div>";
	}
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
	var html =  '<section class="messageContainer ' + pageTheme.get().message + '">'
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
    	html += correspondingFileHtml(msg.downloadUrl);
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
			Meteor.call("insertMessageWithFile"
						, threadId
						, message
						, downloadUrl
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
	let trimmed = msg.replace(/\s/g, "");
	let splitted = trimmed.split("#");

	var replies = [];
	splitted.forEach((e, i, a) => {
		let matcher = e.match(/\d+/);

		if (matcher) {
			let msgCount = matcher[0];
			replies.push(+msgCount);
		}
	});

	return $.unique(replies);
}

function prependZero(str) {
	if (str < 10) {
		return "0" + str;
	} else {
		return str;
	}
}