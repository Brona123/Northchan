import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

import { Messages } from './messages.js';

import { assert } from 'meteor/practicalmeteor:chai';
 
if (Meteor.isServer) {
    describe('Messages', function() {
        describe('methods', function() {
 
            it('Can insert message with mandatory data', () => {
                Messages.remove({});
                Meteor.call("insertMessage", {
                    sectionId : Random.id(),
                    threadId : Random.id(),
                    msg : "sgdsfgsdfgsdfgsdfg"
                });
                assert.equal(Messages.find().count(), 1);
            });

            it('Can insert message with embed url', () => {
                Messages.remove({});
                Meteor.call("insertMessage", {
                    sectionId : Random.id(),
                    threadId : Random.id(),
                    msg : "sgdsfgsdfgsdfgsdfg",
                    embedLink : "https://www.youtube.com/embed/liXCZb8oo9U"
                });
                Meteor.call("insertMessage", {
                    sectionId : Random.id(),
                    threadId : Random.id(),
                    msg : "sgdsfgsdfgsdfgsdfg",
                    embedLink : "https://player.vimeo.com/video/21243684"
                });
                assert.equal(Messages.find().count(), 2);
            });

            it('Can insert message with download link', () => {
                Messages.remove({});
                Meteor.call("insertMessage", {
                    sectionId : Random.id(),
                    threadId : Random.id(),
                    msg : "sgdsfgsdfgsdfgsdfg",
                    downloadUrl : "http://files.northchan.com/kek.png"
                });
                assert.equal(Messages.find().count(), 1);
            });

            it('Cannot insert without mandatory data', () => {
                Messages.remove({});
                // Catching errors so testing doesn't crash
                try {
                    Meteor.call("insertMessage", {
                        threadId : Random.id(),
                        msg : "sgdsfgsdfgsdfgsdfg",
                        downloadUrl : "http://files.northchan.com/kek.png"
                    });
                    Meteor.call("insertMessage", {
                        sectionId : Random.id(),
                        msg : "sgdsfgsdfgsdfgsdfg",
                        downloadUrl : "http://files.northchan.com/kek.png"
                    });
                    Meteor.call("insertMessage", {
                        threadId : Random.id()
                    });
                    Meteor.call("insertMessage", {
                        sectionId : Random.id()
                    });
                    Meteor.call("insertMessage", {
                        msg : "sgdsfgsdfgsdfgsdfg"
                    });
                } catch (e) { }
                assert.equal(Messages.find().count(), 0);
            });
        });
    });
}