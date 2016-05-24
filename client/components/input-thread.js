var currentInputTypeTemplate;
var pageRendered = new ReactiveVar(false);

Template.inputThread.onCreated(function() {
	pageRendered.set(false);
	currentInputTypeTemplate = new ReactiveVar("embed");
});

Template.inputThread.onRendered(function() {
	pageRendered.set(true);
});

Template.inputThread.events({
	'submit #createThread': (event, t) => {
		event.preventDefault();

		pageRendered.set(false);

		let sectionId = $("input[name='sectionId']").val();
		let threadName = $("input[name='threadName']").val().trim();
		let threadText = $("textarea[name='threadInitText']").val();

		if (Threads.findOne({"name" : threadName})) {
			alert("Thread with name \"" + threadName + "\" already exists");
			return;
		}

		let threadObject = {
			sectionId : sectionId,
			name : threadName,
			threadText : threadText
		}

		// If user created thread with file, we have to upload the
		// file first (async)
		if ($("input[name='initialFile']").prop('files')) {
			let file = $("input[name='initialFile']").prop('files')[0];

			createThreadWithFile(file, threadObject);
		} else {
			// Else we can just do synchronous stuff
			if ($("input[name='pollTitle']").val()) {
				let pollTitle = $("input[name='pollTitle']").val();

				let options = [];
						
				$("input[name='pollOption']").each(function() {
					if (this.value) {
						let optClass = $(this).attr("data-opt");
						let bgColor = $("button[data-opt='" + optClass + "']").css('backgroundColor');

						options.push({
							"option" : this.value,
							"bgColor" : bgColor
						});
					}
				});

				console.log("POLLTITLE: " + pollTitle);

				threadObject.pollTitle = pollTitle;
				threadObject.options = options;
			}

			if ($("input[name='embedLink']").val()) {
				let embedLink = getVideoEmbedLink($("input[name='embedLink']").val());

				threadObject.embedLink = embedLink;
			}

			if ($("input[name='channelName']").val()) {
				let channelName = $("input[name='channelName']").val();
				let chatIncluded = $("input[name='includeChat']").prop("checked");

				threadObject.livestream = channelName;
				threadObject.chatIncluded = chatIncluded;
			}

			Meteor.call("createThread", threadObject);
		}


		let form = $("#createThread")[0];
		form.reset();
	},
	'change .btn-file :file': function(e, t) {
		$("#filePath").val($(".btn-file :file").val());
	},
	'change #inputTypeSelection': (e, t) => {
		let inputType = $('#inputTypeSelection').val();

		currentInputTypeTemplate.set(inputType);
	},
	'click #createThread input[name="addOption"]': function(e, t) {
		let nextOptClass = $("input[name='pollOption']").length + 1;
		$("#pollInput").append("<br /><input type='text' name='pollOption' data-opt='" + nextOptClass + "' /><button class='" + nextOptClass + " btn' name='colorPicker' data-opt='" + nextOptClass + "'>BG Color</button>");
		
		$("button[name='colorPicker']").colorpicker().on('changeColor', function(e) {
			e.preventDefault();

			this.style.backgroundColor = e.color.toHex();
		});
	},
	'click #toggleCreateThreadForm': function(e, t) {
		$("#createThread").toggle();
		$(e.target).toggleClass("glyphicon-minus");
		$(e.target).toggleClass("glyphicon-plus");
	}
});

Template.inputThread.helpers({
	'selectedInput': function() {
		return currentInputTypeTemplate.get();
	},
	'uploadProgress': () => {
		let uploader = currentUploader.get();

		if (uploader) {
			return Math.round(uploader.progress() * 100) || 0;
		}
	}
});

function createThreadWithFile(file, threadObject) {
	var uploader = new Slingshot.Upload("fileUploads");

	uploader.send(file, function(error, downloadUrl) {
		currentUploader.set();

		if (error) {
			console.log(uploader.xhr.response);
		} else {
			let fileName = file.name;
			let fileFolder = "files/";
			let properFileDownloadUrl = "http://files.northchan.com/" + fileFolder + fileName;
			
			threadObject.downloadUrl = properFileDownloadUrl;
			Meteor.call("createThread", threadObject);
		}
	});

	currentUploader.set(uploader);
}