Metadata = new Mongo.Collection("metadata");

Metadata.deny({
	insert: (userId, doc) => {
		return true;
	}
});

export { Metadata };