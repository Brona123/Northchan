require('./file.html');
//import "./file.html";
import { currentUploader } from "/imports/api/utils/utils.js";

Template.file.events({
	'change .btn-file :file': function(e, t) {
		const fileName = $(".btn-file :file").val().split("\\").pop();
		$("#filePath").val(fileName);
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