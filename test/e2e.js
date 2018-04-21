var assert = require('assert');
var path = require('path');
var {poll} = require('../index.js');
var {spawnPredicate} = require('../predicates.js');
var tmp = require('tmp');

describe('End-to-end test cases:', function() {
    it('Poll for a given file and resolve this test case once it exists', function(done) {
        let filename = tmp.tmpNameSync();
        let predicate = spawnPredicate(
                'cat',
                [filename],
                {},
                10);
        setTimeout(() => {
            tmp.fileSync({name: path.basename(filename)});
        }, 50);
        return poll(predicate, 20, Infinity, done);
    });
});
