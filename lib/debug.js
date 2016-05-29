debugLog = function(text) {
	if (Meteor.isDevelopment) {
		console.log(text);
	}
}