import { Random } from 'meteor/random';
//import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { assert } from 'meteor/practicalmeteor:chai';

import { Messages } from '../messages.js';
import "./publications.js";

PublicationCollector = Package['johanbrook:publication-collector'].PublicationCollector;

describe('Messages', function () {
    describe('publications', function() {
        beforeEach(function() {
            Messages.remove({});
            for (let i = 0; i < 5; i++) {
                Messages.insert({
                    sectionId : Random.id(),
                    threadId : Random.id(),
                    msg : "sgdsfgsdfgsdfgsdfg"
                });
            }
        });

        it('Publishes all messages', function (done) {
            const collector = new PublicationCollector({});

            collector.collect('messages', {}, {}, function(collections) {
                assert.typeOf(collections.messages, 'array');
                assert.equal(collections.messages.length, 5);
                done();
            });
        });
    });
});