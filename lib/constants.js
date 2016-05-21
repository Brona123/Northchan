mintTheme = {
	name : "Mint",
	background : "mintBg",
	contentBg : "mintContentBg",
	thread : "mintThread",
	message : "mintMessage",
	inputArea : "mintInput"
}

darkTheme = {
	name : "Dark",
	background : "darkBg",
	contentBg : "darkContentBg",
	thread : "darkThread",
	message : "darkMessage",
	inputArea : "darkInput"
}

monokaiTheme = {
	name : "Monokai",
	background : "monokaiBg",
	contentBg : "monokaiBg",
	thread : "monokaiThread",
	message : "monokaiMessage",
	inputArea : "monokaiInput"
}

marsTheme = {
	name : "Mars",
	background : "marsBg",
	contentBg : "marsBg",
	thread : "marsThread",
	message : "marsMessage",
	inputArea : "marsInput"
}

LSDTheme = {
	name : "LSD",
	background : "lsdBg",
	contentBg : "lsdBg",
	thread : "lsdThread",
	message : "lsdMessage",
	inputArea : "lsdInput"
}

pittsburghPenguinsTheme = {
	name : "PittsburghPenguins",
	background : "ppBg",
	contentBg : "ppBg",
	thread : "ppThread",
	message : "ppMessage",
	inputArea : "ppInput"	
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
	reactive: true
};

// global function, used in section.js and thread.js
getVideoEmbedLink = function (link) {
	var embedLink = "";

	if (link.match("youtube.com") || link.match("youtu.be")) {
		id = link.match(/(^|=|\/)([0-9A-Za-z_-]{11})(\/|&|$|\?|#)/)[2];

		embedLink = "//www.youtube.com/embed/" + id;
	} else if (link.match("vimeo.com")) {
		var regExp = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/;
		var match = link.match(regExp);

		id = match[5];

		embedLink = "//player.vimeo.com/video/" + id;
	} else if (link.match("twitch.tv")) {
		// Example vod link
		// https://www.twitch.tv/sodapoppin/v/52785742
		let videoId = link.split("/v/")[1];

		embedLink = "https://player.twitch.tv/?video=v" + videoId + "&autoplay=false";
	}
	
	console.log("EMBED LINK: " + embedLink);
	return embedLink;
}

currentUploader = new ReactiveVar();