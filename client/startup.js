
/*
Meteor.Spinner.options = {
	top : 'auto',
	left : 'auto'
};
*/

/*
var startTime;

Meteor.startup(() => {
	Meteor.setInterval(function () {
		startTime = new Date().getTime();
		Meteor.call("ping", startTime, pong);
	}, 10000);
});

function pong(error, result) {
	let end = new Date().getTime();

	let timeDiff = end - startTime;
	console.log("TIMEDIFF: " + timeDiff);
}
*/

function correspondingFileHtml(downloadUrl) {
	if (downloadUrl.endsWith(".mp4")) {
		return "<video src='" + downloadUrl + "' />";
	} else if (downloadUrl.endsWith(".png") || downloadUrl.endsWith(".jpg")) {
		return "<img src='" + downloadUrl + "'>";
	} else if (downloadUrl.endsWith(".mp3")) {
		return "<audio src='" + downloadUrl + "' controls />";
	}
}

Template.registerHelper("properFileHtml", (downloadUrl) => {
	if (!downloadUrl) return;

	return correspondingFileHtml(downloadUrl);
});