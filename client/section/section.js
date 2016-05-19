var currentInputTypeTemplate;
var pageRendered = new ReactiveVar(false);

Template.section.onCreated(function() {
	pageRendered.set(false);
	currentInputTypeTemplate = new ReactiveVar("embed");
});

Template.section.onRendered(function() {
	pageRendered.set(true);

	this.find('#threadList')._uihooks = {
		insertElement: function(node, next) {
			pageRendered.set(false);
			$(node).hide().insertBefore(next).fadeIn();
			pageRendered.set(true);
		}
	};
});

Template.section.helpers({
	'sectionViewCount': function () {
		let currentSection = Sections.findOne();

		if (currentSection)
			return currentSection.currentlyViewing.length;
	},
	'threads' : () => {
		if (Session.get("settings").reactive) {
			return Threads.find({}, {sort : {"currentlyViewing" : -1, "name" : 1}});
		} else {
			return Threads.find({}, {sort : {"name" : 1}});			
		}
	},
	'getUrl' : (fileId) => {
		let file = Files.findOne(fileId);
		
		return file.url();
	},
	'firstLines' : (initialText) => {
		if (!initialText) {
			return;
		}

		if (initialText.length < 140) {
			return initialText;
		} else {
			return initialText.substr(0, 140) + " ...";
		}
	},
	'truncateHeader' : (header) => {
		if (header.length < 20) {
			return header;
		} else {
			return header.substr(0, 20) + " ...";
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

				new Chart(ctx).Pie(data, options);
			}
		}
	},
	'pollTitle' : function(pollId) {
		let poll = Polls.findOne(pollId);

		if (poll)
			return poll.pollTitle;
	},
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

// TODO jos threadin nimen perässä on väli, subscription kusee
Template.section.events({
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

		if ($("input[name='pollTitle']").val()) {
			createThreadWithPoll(sectionId, threadName, threadText);
		}

		if ($("input[name='initialFile']").prop('files')) {
			createThreadWithFile(sectionId, threadName, threadText);
		}

		if ($("input[name='embedLink']").val()) {
			createThreadWithEmbed(sectionId, threadName, threadText);
		}

		if ($("input[name='channelName']").val()) {
			createThreadWithLivestream(sectionId, threadName, threadText);
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
		console.log("ADDED OPTION");

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
	},
	'click button[name="deleteThread"]': function(e, t) {
		e.preventDefault();

		console.log($(e.target).attr("data-thread-id"));
		let threadId = $(e.target).attr("data-thread-id");

		Threads.remove(threadId);
	}
});

// Function stolen from
// http://stackoverflow.com/questions/1740700/how-to-get-hex-color-value-rather-than-rgb-value
function rgb2hex(rgb) {
     if (  rgb.search("rgb") == -1 ) {
          return rgb;
     } else {
          rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
          function hex(x) {
               return ("0" + parseInt(x).toString(16)).slice(-2);
          }
          return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]); 
     }
}

function createThreadWithFile(sectionId, threadName, threadText) {
	let file = $("input[name='initialFile']").prop('files')[0];

	var uploader = new Slingshot.Upload("fileUploads");

	uploader.send(file, function(error, downloadUrl) {
		currentUploader.set();

		if (error) {
			console.log(uploader.xhr.response);
		} else {
			let fileName = file.name;
			let fileFolder = "files/";
			let properFileDownloadUrl = "http://files.northchan.com/" + fileFolder + fileName;
			
			Meteor.call("createThreadWithFile"
						, sectionId
						, threadName
						, threadText
						, properFileDownloadUrl);
		}
	});

	currentUploader.set(uploader);
}

function createThreadWithEmbed(sectionId, threadName, threadText) {
	let embedLink = getVideoEmbedLink($("input[name='embedLink']").val());

	Meteor.call("createThreadWithEmbed"
							, sectionId
							, threadName
							, threadText
							, embedLink);
}

function createThreadWithPoll(sectionId, threadName, threadText) {
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

	Meteor.call("createThreadWithPoll"
					, sectionId
					, threadName
					, threadText
					, pollTitle
					, options);
}

function createThreadWithLivestream(sectionId, threadName, threadText) {
	let channelName = $("input[name='channelName']").val();
	let chatIncluded = $("input[name='includeChat']").prop("checked");
	
	Meteor.call("createThreadWithLivestream"
					, sectionId
					, threadName
					, threadText
					, channelName
					, chatIncluded);
}