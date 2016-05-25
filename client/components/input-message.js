var charactersTyped = new ReactiveVar("");

Template.inputMessage.events({
	'submit #sendMessage': function(e, t) {
		e.preventDefault();

		let threadId = $("#sendMessage").attr("data-thread-id");
		let message = $("textarea[name='msg']").val();
		let file = $("input[name='msgFile']").prop('files')[0];
		let embedLink = getVideoEmbedLink($("input[name='embed']").val());
		let replies = parseReplies(message);
		let msgCount = Metadata.findOne().msgCount;

		if (replies)
			storeReplies(replies, msgCount);

		let messageObject = {
			threadId : threadId,
			msg : message,
		}

		if (file) {
			insertMessageWithFile(file, messageObject);
		} else {
			if (embedLink) {
				messageObject.embedLink = embedLink;
			}

			Meteor.call("insertMessage", messageObject);
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

Template.inputMessage.helpers({
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

function insertMessageWithFile(file, messageObject) {
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
			let properFileDownloadUrl = `http://files.northchan.com/${fileFolder}${fileName}`;
			
			messageObject.downloadUrl = properFileDownloadUrl;

			Meteor.call("insertMessage", messageObject);
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