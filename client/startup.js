Meteor.startup(() => {
	if (!Session.get("pageTheme")) {
		Session.setPersistent("pageTheme", mintTheme);
	}

	if (!Session.get("settings")) {
		Session.setPersistent("settings", settings);
	}

	Meteor.call("getId", (error, result) => {
		if (!error)
			Session.set("hashId", result);
	});
});

Template.registerHelper("properFileHtml", (downloadUrl) => {
	if (!downloadUrl) return;

	if (downloadUrl.endsWith(".mp4")) {
		return "<video src='" + downloadUrl + "' />";
	} else if (downloadUrl.endsWith(".png") || downloadUrl.endsWith(".jpg")) {
		return "<img src='" + downloadUrl + "' alt='Image placeholder'>";
	} else if (downloadUrl.endsWith(".mp3")) {
		return "<audio src='" + downloadUrl + "' controls />";
	}
});

Template.registerHelper("readonly", () => {
	return Session.get("settings").readonly;
});

Template.registerHelper("pageTheme", () => {
	return Session.get("pageTheme");
});