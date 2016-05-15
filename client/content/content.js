Template.content.helpers({
	'data': function() {
		console.log(this);
		return this;
	},
	'isImage' : function(type) {
		return (type === "image/png" || type === "image/jpeg");
	},
	'isVideo' : function(type) {
		return type === "video/mp4";
	},
	'isAudio' : function(type) {
		return type === "audio/mp3";
	},
	'isText' : function(type) {
		return type === "text/plain";
	}
});