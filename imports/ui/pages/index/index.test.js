//import { Factory } from 'meteor/factory';

import './index.js';

import { assert } from 'meteor/practicalmeteor:chai';
import { Template } from 'meteor/templating';
//import { $ } from 'meteor/jquery';

import { withRenderedTemplate } from '../../test-helpers.js';

if (Meteor.isClient) {
    describe('index page', function () {
        it('Renders correctly with threads inside', function () {
            withRenderedTemplate(Template.index, {}, el => {
                assert.notEqual($(el).find("#sections").length, 0);
            });
        });
    });
}