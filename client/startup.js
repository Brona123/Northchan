
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

Meteor.startup(() => {
	if (!Session.get("pageTheme")) {
		Session.setPersistent("pageTheme", mintTheme);
	}

	if (!Session.get("settings")) {
		Session.setPersistent("settings", settings);
	}

	Meteor.call("getId", function (error, result) {
		Session.set("hashId", result);
	});
});

correspondingFileHtml = function(downloadUrl) {
	if (downloadUrl.endsWith(".mp4")) {
		return "<video src='" + downloadUrl + "' />";
	} else if (downloadUrl.endsWith(".png") || downloadUrl.endsWith(".jpg")) {
		return "<img src='" + downloadUrl + "' alt='Image placeholder'>";
	} else if (downloadUrl.endsWith(".mp3")) {
		return "<audio src='" + downloadUrl + "' controls />";
	}
}

Template.registerHelper("properFileHtml", (downloadUrl) => {
	if (!downloadUrl) return;

	return correspondingFileHtml(downloadUrl);
});

Template.registerHelper("readonly", () => {
	return Session.get("settings").readonly;
});

Template.registerHelper("pageTheme", () => {
	return Session.get("pageTheme");
});