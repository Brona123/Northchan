Meteor.startup(() => {
	console.log("Server started");

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

	var methods = ['insertMessage'
					,'createThread'
					,'createSection'
					,'vote'];

	console.log("METHODS:");
	//console.log(methods);
	
	DDPRateLimiter.setErrorMessage("Don't DOS plz");

	_.each(methods, (elem, index, list) => {
		//console.log(elem);

		const rule = {
			clientAddress: function(address) {
				//console.log(address);
				return true;
			},
			type: "method",
			name: elem
		}

		DDPRateLimiter.addRule(rule, 5, 1000);
	});
	
	/*
	for (var method of methods) {
		console.log(method);
	}
	*/
	
	/*
	const methods = ['rateMessageUpsert', 'storeReplies']
	const loginRule = {
	  	userId: function (userId) {
		    return Meteor.users.findOne(userId).type !== 'Admin';
		},
	    type: 'method',
	    method: 'login'
	}

	DDPRateLimiter.addRule(loginRule, 5, 1000);
	*/
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