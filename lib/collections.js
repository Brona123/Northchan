Messages = new Mongo.Collection("messages");

Metadata = new Mongo.Collection("metadata");

Metadata.deny({
	insert: (userId, doc) => {
		return true;
	}
});

Slingshot.fileRestrictions("fileUploads", {
  allowedFileTypes: ["image/png"
  					, "image/jpeg"
  					, "image/gif"
  					, "audio/mp3"
  					, "video/mpeg"
  					, "video/mp4"],
  maxSize: 10 * 1024 * 1024 // 10 MB (use null for unlimited).
});

/*
Canvas = new Mongo.Collection("canvas");

Canvas.allow({
	insert: (userId, doc) => { return true; },
	update: (userId, doc) => { return true; },
	remove: (userId, doc) => { return true; }
});
*/

Meteor.users.allow({
	update: (userId, doc) => {
		if (Roles.userIsInRole(userId, ['superadmin'])) {
			return true;
		} else {
			return false;
		}
	}
});

Sections = new Mongo.Collection("sections");

Threads = new Mongo.Collection("threads");

ConnectedClients = new Mongo.Collection("connected_clients");

UniqueVisitors = new Mongo.Collection("unique_visitors");

Polls = new Mongo.Collection("polls");