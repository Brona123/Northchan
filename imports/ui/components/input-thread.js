import "./input-thread.html";
import "./form-components/embed.html";
import "./form-components/file.js";
import "./form-components/livestream.html";
import "./form-components/poll.js";

import { getVideoEmbedLink } from "/imports/api/utils/utils.js";
import { uploadFile } from "/imports/api/utils/utils.js";
import { currentUploader } from "/imports/api/utils/utils.js";

let currentInputTypeTemplate;
let pageRendered = new ReactiveVar(false);

Template.inputThread.onCreated(() => {
	pageRendered.set(false);
	currentInputTypeTemplate = new ReactiveVar("embed");
});

Template.inputThread.onRendered(() => {
	pageRendered.set(true);
});

Template.inputThread.events({
	'submit #createThread': (event, t) => {
		event.preventDefault();

		pageRendered.set(false);

		const sectionId = $("input[name='sectionId']").val();
		const threadName = $("input[name='threadName']").val().trim();
		const threadText = $("textarea[name='threadInitText']").val();

		if (Threads.findOne({"name" : threadName})) {
			alert("Thread with name \"" + threadName + "\" already exists");
			return;
		}

		const threadObject = {
			sectionId : sectionId,
			name : threadName,
			threadText : threadText
		}

		const messageObject = {
			sectionId,
			msg : threadText
		}

		// TODO threadia luodessa ei messagea, threadin eka viesti thread text

		// If user created thread with file, we have to upload the
		// file first (async)
		if ($("input[name='file']").prop('files') && $("input[name='file']").prop('files')[0]) {
			const file = $("input[name='file']").prop('files')[0];

			uploadFile(file, (properFileDownloadUrl) => {
				threadObject.downloadUrl = properFileDownloadUrl;
				messageObject.downloadUrl = properFileDownloadUrl;

				Meteor.call("createThread", threadObject, (error, threadId) => {
					if (error) {
						alert(error);
					} else {
						messageObject.threadId = threadId;
						Meteor.call("insertMessage", messageObject);	
					}
				});
			});
		} else {
			// Else we can just do synchronous stuff
			if ($("input[name='pollTitle']").val()) {
				const pollTitle = $("input[name='pollTitle']").val();

				const options = [];
						
				$("input[name='pollOption']").each(function() {
					if (this.value) {
						const optClass = $(this).attr("data-opt");
						const bgColor = $("button[data-opt='" + optClass + "']").css('backgroundColor');

						options.push({
							"option" : this.value,
							"bgColor" : bgColor
						});
					}
				});

				threadObject.pollTitle = pollTitle;
				threadObject.options = options;
				messageObject.pollTitle = pollTitle;
				messageObject.options = options;
			}

			if ($("input[name='embedLink']").val()) {
				const embedLink = getVideoEmbedLink($("input[name='embedLink']").val());

				threadObject.embedLink = embedLink;
				messageObject.embedLink = embedLink;
			}

			if ($("input[name='channelName']").val()) {
				const channelName = $("input[name='channelName']").val();
				const chatIncluded = $("input[name='includeChat']").prop("checked");

				threadObject.livestream = channelName;
				threadObject.chatIncluded = chatIncluded;
				messageObject.livestream = channelName;
				messageObject.chatIncluded = chatIncluded;
			}

			Meteor.call("createThread", threadObject, (error, threadId) => {
				if (error) {
					alert(error);
				} else {
					messageObject.threadId = threadId;
					Meteor.call("insertMessage", messageObject);	
				}
			});
		}

		let form = $("#createThread")[0];
		form.reset();
	},
	'change #inputTypeSelection': (e, t) => {
		const inputType = $('#inputTypeSelection').val();

		currentInputTypeTemplate.set(inputType);
	},
	'click #toggleCreateThreadForm': function(e, t) {
		$("#createThread").toggle();
		$(e.target).toggleClass("glyphicon-minus");
		$(e.target).toggleClass("glyphicon-plus");
	}
});

Template.inputThread.helpers({
	selectedInput() {
		return currentInputTypeTemplate.get();
	},
	sectionId() {
		if (Sections.findOne())
			return Sections.findOne()._id;
	}
});