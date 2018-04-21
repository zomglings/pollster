var assert = require('assert');
var predicates = require('../predicates.js');

describe('asynchronize wraps a synchronous predicate to make it satisfy asynchronous semantics', function() {
    it('returns an error to its callback when the synchronous predicate throws', function(done) {
        function synchronousPredicate() {
            throw new Error('Dummy error, dummy');
        }

        var predicate = predicates.asynchronize(synchronousPredicate);

        return predicate(function(err, result) {
            assert(!!err);
            assert(!result);
            done();
        });
    });

    it('passes false to its callback if the synchronous predicate returns false', function(done) {
        function synchronousPredicate() {
            return false;
        }

        var predicate = predicates.asynchronize(synchronousPredicate);

        return predicate(function (err, result) {
            assert(!err);
            assert(result === false);
            done();
        });
    });

    it('passes true to its callback if the synchronous predicate returns true', function(done) {
        function synchronousPredicate() {
            return true;
        }

        var predicate = predicates.asynchronize(synchronousPredicate);

        return predicate(function (err, result) {
            assert(!err);
            assert(result === true);
            done();
        });
    });
});

describe('spawnPredicate returns a predicate function which runs in a child process', function() {
    it('errors out if timeout argument is not a safe integer', function() {
        assert.throws(() => {
            predicates.spawnPredicate('sleep', ['1'], {}, []);
        });
    });

    it('errors out if timeout is a non-positive integer', function() {
        assert.throws(() => {
            predicates.spawnPredicate('sleep', ['1'], {}, 0);
        });
    });

    describe('its predicate', function() {
        it('returns true on exit code 0', function(done) {
            var predicate = predicates.spawnPredicate(
                    'node',
                    ['-e', 'process.exit(0)'],
                    {},
                    1000);
            predicate(function(err, result) {
                assert(!err);
                assert(result);
                done();
            });
        });

        it('returns false on exit code 1', function(done) {
            var predicate = predicates.spawnPredicate(
                    'node',
                    ['-e', 'process.exit(1)'],
                    {},
                    1000);
            predicate(function(err, result) {
                assert(!err);
                assert(!result);
                done();
            });
        });

        it('returns an error on any other code', function(done) {
            var predicate = predicates.spawnPredicate(
                    'node',
                    ['-e', 'process.exit(2)'],
                    {},
                    1000);
            predicate(function(err, result) {
                assert(!!err);
                done();
            });
        });

        it('returns an error if the command times out', function(done) {
            var predicate = predicates.spawnPredicate(
                    'sleep',
                    ['10'],
                    {},
                    100);
            predicate(function(err, result) {
                assert(!!err);
                done();
            });
        });
    });
});
