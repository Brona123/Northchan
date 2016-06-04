import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
 
import { Threads } from './threads.js';

import { assert } from 'meteor/practicalmeteor:chai';

if (Meteor.isServer) {
    describe('Threads', function() {
        describe('methods', function() {
 
            it('Can create thread with mandatory data', () => {
                Threads.remove({});
                Meteor.call("createThread", {
                    sectionId : Random.id(),
                    name : "gsdfgsdfgsdfgsf",
                    threadText : "sgdsfgsdfgsdfgsdfg"
                });
                assert.equal(Threads.find().count(), 1);
            });

            it('Can create thread with embed url', () => {
                Threads.remove({});
                Meteor.call("createThread", {
                    sectionId : Random.id(),
                    name : "gsdfgsdfgsdfgsf",
                    threadText : "sgdsfgsdfgsdfgsdfg",
                    embedLink : "https://www.youtube.com/embed/liXCZb8oo9U"
                });
                Meteor.call("createThread", {
                    sectionId : Random.id(),
                    name : "gsdfgsdfgsdfgsf",
                    threadText : "sgdsfgsdfgsdfgsdfg",
                    embedLink : "https://player.vimeo.com/video/21243684"
                });
                assert.equal(Threads.find().count(), 2);
            });

            it('Can create thread with download link', () => {
                Threads.remove({});
                Meteor.call("createThread", {
                    sectionId : Random.id(),
                    name : "gsdfgsdfgsdfgsf",
                    threadText : "sgdsfgsdfgsdfgsdfg",
                    downloadUrl : "http://files.northchan.com/kek.png"
                });
                assert.equal(Threads.find().count(), 1);
            });

            it('Cannot create thread without mandatory data', () => {
                Threads.remove({});
                // Catching errors so testing doesn't crash
                try {
                    Meteor.call("createThread", {
                        sectionId : Random.id(),
                        name : "gsdfgsdfgsdfgsf",
                        downloadUrl : "http://files.northchan.com/kek.png"
                    });
                    Meteor.call("createThread", {
                        sectionId : Random.id(),
                        threadText : "sgdsfgsdfgsdfgsdfg",
                        downloadUrl : "http://files.northchan.com/kek.png"
                    });
                    Meteor.call("createThread", {
                        sectionId : Random.id()
                    });
                    Meteor.call("createThread", {
                        threadText : "sgdsfgsdfgsdfgsdfg"
                    });
                    Meteor.call("createThread", {
                        name : "sgdsfgsdfgsdfgsdfg"
                    });
                } catch (e) { }
                assert.equal(Threads.find().count(), 0);
            });
        });
    });
}