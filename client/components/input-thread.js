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

		let threadObject = {
			sectionId : sectionId,
			name : threadName,
			threadText : threadText
		}

		// If user created thread with file, we have to upload the
		// file first (async)
		if ($("input[name='file']").prop('files') && $("input[name='file']").prop('files')[0]) {
			const file = $("input[name='file']").prop('files')[0];

			createThreadWithFile(file, threadObject);
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

				console.log("POLLTITLE: " + pollTitle);

				threadObject.pollTitle = pollTitle;
				threadObject.options = options;
			}

			if ($("input[name='embedLink']").val()) {
				const embedLink = getVideoEmbedLink($("input[name='embedLink']").val());

				threadObject.embedLink = embedLink;
			}

			if ($("input[name='channelName']").val()) {
				const channelName = $("input[name='channelName']").val();
				const chatIncluded = $("input[name='includeChat']").prop("checked");

				threadObject.livestream = channelName;
				threadObject.chatIncluded = chatIncluded;
			}

			Meteor.call("createThread", threadObject);
		}


		let form = $("#createThread")[0];
		form.reset();
	},
	'change .btn-file :file': function(e, t) {
		const fileName = $(".btn-file :file").val().split("\\").pop();
		$("#filePath").val(fileName);
	},
	'change #inputTypeSelection': (e, t) => {
		const inputType = $('#inputTypeSelection').val();

		currentInputTypeTemplate.set(inputType);
	},
	'click #createThread input[name="addOption"]': function(e, t) {
		const nextOptClass = $("input[name='pollOption']").length + 1;

		const html = `<div class='input-group'>
						<input type='text' 
								class='form-control' 
								maxlength='40' 
								name='pollOption' 
								data-opt='${nextOptClass}' />
						<span class='input-group-btn'>
							<button class='${nextOptClass} btn' 
									name='colorPicker' 
									data-opt='${nextOptClass}'>BG Color</button>
						</span>
					</div>`;
		$("#pollInput").append(html);
		
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
	selectedInput() {
		return currentInputTypeTemplate.get();
	}
});

Template.file.helpers({
	uploadProgress() {
		const uploader = currentUploader.get();

		if (uploader) {
			return Math.round(uploader.progress() * 100) || 0;
		}
	}
});

function createThreadWithFile(file, threadObject) {
	const uploader = new Slingshot.Upload("fileUploads");

	uploader.send(file, function(error, downloadUrl) {
		currentUploader.set();

		if (error) {
			console.log(uploader.xhr.response);
		} else {
			const fileName = file.name;
			const fileFolder = "files/";
			const properFileDownloadUrl = `http://files.northchan.com/${fileFolder}${fileName}`;
			
			threadObject.downloadUrl = properFileDownloadUrl;
			Meteor.call("createThread", threadObject);
		}
	});

	currentUploader.set(uploader);
}