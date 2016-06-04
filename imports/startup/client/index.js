import "./routes.js";
import "./stylesheets/stylesheet.css";

mintTheme = {
	name : "Mint",
	class : "mint"
}

darkTheme = {
	name : "Dark",
	class : "dark"
}

monokaiTheme = {
	name : "Monokai",
	class : "monokai"
}

marsTheme = {
	name : "Mars",
	class : "mars"
}

LSDTheme = {
	name : "LSD",
	class : "lsd"
}

pittsburghPenguinsTheme = {
	name : "PittsburghPenguins",
	class : "pp"	
}

themes = [
	mintTheme,
	darkTheme,
	monokaiTheme,
	marsTheme,
	LSDTheme,
	pittsburghPenguinsTheme
];

settings = {
	autoscroll: true,
	readonly: false,
	reactive: true,
	lightweight: false
};

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
		const button = `<button data-video-url=${downloadUrl} class='resize btn-block'>Resize</button>`;
		return `<video src=${downloadUrl} poster='/video-placeholder.png'/> <br />${button}`;
	} else if (downloadUrl.endsWith(".png") || downloadUrl.endsWith(".jpg")) {
		return `<img src=${downloadUrl} alt='Image placeholder'>`;
	} else if (downloadUrl.endsWith(".mp3")) {
		return `<audio src=${downloadUrl} controls />`;
	}
});

Template.registerHelper("settings", () => {
	return Session.get("settings");
});

Template.registerHelper("pageTheme", () => {
	return Session.get("pageTheme");
});