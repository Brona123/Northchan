Meteor.startup(() => {
	debugLog("Server started");

	// Create user and assign it the admin role if user doesn't exist
	if (!Accounts.findUserByUsername("SuperAdmin")) {
		Accounts.createUser({
			username: "SuperAdmin", 
			password: "AsdRegardsAsaad"
		});
		const accId = Accounts.findUserByUsername("SuperAdmin");
		Roles.addUsersToRoles(accId, "superadmin", Roles.GLOBAL_GROUP);
	}

	// Create user and assign it the moderator role if user doesn't exist
	if (!Accounts.findUserByUsername("ModeratorOne")) {
		Accounts.createUser({
			username: "ModeratorOne",
			password: "Kek123"
		});
		const accId = Accounts.findUserByUsername("ModeratorOne");
		Roles.addUsersToRoles(accId, "moderator");
	}

	// DDP rate limiting for methods
	// but for some reason doesn't work for subscriptions
	const methods = ['insertMessage'
						, 'createThread'
						, 'createSection'
						, 'vote'];
	
	DDPRateLimiter.setErrorMessage("Don't DOS plz");

	methods.forEach((methodName, index, arr) => {

		const rule = {
			connectionId: function(connectionId) {
				return true;
			},
			type: "method",
			name: methodName
		}

		DDPRateLimiter.addRule(rule, 5, 1000);
	});

	// Clear rate limiter data when starting server
	RateLimiting.remove({});
});

Meteor.onConnection((conn) => {
	console.log("OPEN CONNECTION: " + conn.clientAddress);
	// Store a new unique visitor's ip to a private collection
	UniqueVisitors.upsert(conn.clientAddress
							, {$set : {lastConn : new Date()}});

	// Hash a connected user's ip and store it in a public collection
	// for displaying viewer count
	let ipHash = SHA256(conn.clientAddress);
	ConnectedClients.upsert(ipHash, {$set : {lastConn : new Date()}});

	conn.onClose(function() {
		console.log("CLOSED CONNECTION: " + conn.clientAddress);
		ConnectedClients.remove(ipHash);
		
		Meteor.call("clearConnectionView", conn);
	});
});