export const currentUploader = new ReactiveVar();

export const legitDownloadUrl = function(string) {
	const regex = "http://files.northchan.com/";

	return string.match(regex) ? true : null;
}

export const legitEmbedUrl = function(string) {
	if (string.match("youtube.com") || string.match("youtu.be")) {
		const youtubeRegex = /(\/\/www.youtube.com\/embed\/)/;

		return string.match(youtubeRegex) ? true : null;
	} else if (string.match("vimeo.com")) {
		const vimeoRegex = /(\/\/player.vimeo.com\/video\/)/;

		return string.match(vimeoRegex) ? true : null;
	} else if (string.match("twitch.tv")) {
		const twitchRegex = /(\/\/player.twitch.tv\/?video=v\d+&autoplay=false)/;
		
		return string.match(twitchRegex) ? true : null;
	} else {
		return null;
	}
}

export const nonEmptyString = function(string) {
	check(string, String);
	return string.length > 0;
}

export const debugLog = function(text) {
	if (Meteor.isDevelopment) {
		console.log(text);
	}
}

// global function, used in section.js and thread.js
export const getVideoEmbedLink = function(link) {
	let embedLink = "";

	if (link.match("youtube.com") || link.match("youtu.be")) {
		id = link.match(/(^|=|\/)([0-9A-Za-z_-]{11})(\/|&|$|\?|#)/)[2];

		embedLink = `//www.youtube.com/embed/${id}`;
	} else if (link.match("vimeo.com")) {
		const regExp = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/;
		const match = link.match(regExp);

		id = match[5];

		embedLink = `//player.vimeo.com/video/${id}`;
	} else if (link.match("twitch.tv")) {
		// Example vod link
		// https://www.twitch.tv/sodapoppin/v/52785742
		const videoId = link.split("/v/")[1];

		embedLink = `https://player.twitch.tv/?video=v${videoId}&autoplay=false`;
	}

	return embedLink;
}

export const uploadFile = function(file, callback) {
	const uploader = new Slingshot.Upload("fileUploads");

	uploader.send(file, function(error, downloadUrl) {
		currentUploader.set();

		if (error) {
			console.log(error);
		} else {
			const fileName = encodeURIComponent(file.name);
			const fileFolder = "files/";
			const properFileDownloadUrl = `http://files.northchan.com/${fileFolder}${fileName}`;
			
			callback(properFileDownloadUrl);
		}
	});

	currentUploader.set(uploader);
}

// function stolen from 
// http://stackoverflow.com/questions/1053902/how-to-convert-a-title-to-a-url-slug-in-jquery
export const slugify = function(str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();

    // remove accents, swap ñ for n, etc
    let from = "ãàáäâåẽèéëêìíïîõòóöôùúüûñç·/_,:;";
    let to   = "aaaaaaeeeeeiiiiooooouuuunc------";
    for (let i=0, l=from.length ; i<l ; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }

    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes

    return str;
}