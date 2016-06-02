let currentInputTypeTemplate;
let charactersTyped = new ReactiveVar("");

Template.inputMessage.onCreated(function() {
	currentInputTypeTemplate = new ReactiveVar("embed");
});

Template.inputMessage.events({
	'submit #sendMessage': function(e, t) {
		e.preventDefault();

		const sectionId = $("#sendMessage").attr("data-section-id");
		const threadId = $("#sendMessage").attr("data-thread-id");
		const message = $("textarea[name='msg']").val();
		const references = parseReferences(message);

		console.log(sectionId);
		let messageObject = {
			sectionId : sectionId,
			threadId : threadId,
			msg : message,
		}

		if (references)
			messageObject.references = references;

		if ($("input[name='file']").prop('files') && $("input[name='file']").prop('files')[0]) {
			const file = $("input[name='file']").prop('files')[0];

			uploadFile(file, (properFileDownloadUrl) => {
				messageObject.downloadUrl = properFileDownloadUrl;

				Meteor.call("insertMessage", messageObject);
			});
		} else {
			if ($("input[name='embedLink']").val()) {
				const embedLink = getVideoEmbedLink($("input[name='embedLink']").val());

				messageObject.embedLink = embedLink;
			}

			Meteor.call("insertMessage", messageObject);
		}

		const form = $("#sendMessage")[0];
		form.reset();
		charactersTyped.set(0);
	},
	'click #hideInputFieldArea': function(e, t) {
		$(".inputFieldArea").toggle();
		//$(".inputArea").toggleClass("col-xs-12");
		//$(".inputArea").toggleClass("col-xs-2");
		//$("#messagelist").toggleClass("maximized");
		$(e.target).toggleClass("glyphicon-chevron-down");
		$(e.target).toggleClass("glyphicon-chevron-up");
	},
	'change .btn-file :file': function(e, t) {
		const fileName = $(".btn-file :file").val().split("\\").pop();
		$("#filePath").val(fileName);
	},
	'keyup #sendMessage textarea[name="msg"]' : function(e, t) {
		const currentCharacters = $("#sendMessage textarea[name='msg']").val().length;
		const maxCharacters = $("#sendMessage textarea[name='msg']").attr("maxlength");

		charactersTyped.set(currentCharacters + " / " + maxCharacters);
	},
	'change #inputTypeSelection': (e, t) => {
		const inputType = $('#inputTypeSelection').val();

		currentInputTypeTemplate.set(inputType);
	}
});

Template.inputMessage.helpers({
	'uploadProgress': () => {
		const uploader = currentUploader.get();

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
	},
	'selectedInput': () => {
		return currentInputTypeTemplate.get();
	}
});

function parseReferences(msg) {
	// If message doesn't have references, return empty array
	if (msg.match(/#\d/) === null) {
		return [];
	}

	// Match all strings beginning with '#'
	// and continuing with a digit
	const matcher = msg.match(/#\d+/g);

	const references = [];
	matcher.forEach((e, i, a) => {
		// Filter out the '#' char and push digits
		// to replies array
		references.push(+e.substring(1, e.length));
	});

	// Return only unique references
	// so ppl can't spam reference one message
	return $.unique(references);
}