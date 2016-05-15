Meteor.startup(() => {
	console.log("Server started");

	//Metadata.upsert({"_id" : "msgCount"}, {$set : {"msgCount" : 0}});
	var query = Messages.find({});
	var handle = query.observeChanges({
		added: function(id, fields) {
			// Ignore server startup calls (initial calls)
			if (!handle) return;
			Metadata.upsert({"_id" : "msgCount"}, {$inc : {"msgCount" : 1}});
		}
	});

	// Create user and assign it the admin role if user doesn't exist
	if (!Accounts.findUserByUsername("SuperAdmin")) {
		Accounts.createUser({
			username: "SuperAdmin", 
			password: "AsdRegardsAsaad"
		});
		let accId = Accounts.findUserByUsername("SuperAdmin");
		Roles.addUsersToRoles(accId, "superadmin", Roles.GLOBAL_GROUP);
	}

	// Create user and assign it the moderator role if user doesn't exist
	if (!Accounts.findUserByUsername("ModeratorOne")) {
		Accounts.createUser({
			username: "ModeratorOne",
			password: "Kek123"
		});
		let accId = Accounts.findUserByUsername("ModeratorOne");
		Roles.addUsersToRoles(accId, "moderator");
	}
});

Meteor.onConnection(function(conn) {
	console.log("OPEN CONNECTION: " + conn.clientAddress);
	UniqueVisitors.upsert(conn.clientAddress
							, {$set : {lastConn : new Date()}});

	let ipHash = SHA256(conn.clientAddress);
	ConnectedClients.upsert(ipHash, {$set : {lastConn : new Date()}});

	let connectedClientCount = ConnectedClients.find({"count" : null}).count();
	ConnectedClients.upsert("connectedClients"
							, {$set : {"count" : connectedClientCount}});

	conn.onClose(function() {
		console.log("CLOSED CONNECTION: " + conn.clientAddress);
		ConnectedClients.remove(ipHash);

		let connectedClientCount = ConnectedClients.find({"count" : null}).count();
		ConnectedClients.update("connectedClients"
							, {$set : {"count" : connectedClientCount}});
		Meteor.call("clearConnectionView", conn);
	});
});