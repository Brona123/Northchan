Meteor.methods({
	getId() {
		return SHA256(this.connection.clientAddress);
	}
});