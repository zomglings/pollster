var assert = require('assert');
var pollster = require('../index.js');

var poll = pollster.poll;

describe('poll', function() {
    it('returns an error if its predicate is not a function', function(done) {
        return poll(1, 1000, Infinity, function(err) {
            if (!!err) {
                return done();
            }

            return done(new Error('Expected: poll to return an error; Actual: no error returned'));
        });
    });

    it('successfully calls its callback once its predicate returns true', function(done) {
        return poll(
                function(cb) {
                    return cb(null, true);
                },
                1000,
                Infinity,
                done);
    });

    it('returns an error if interval is not an integer', function(done) {
        return poll(
                function(cb) {
                    return cb(null, true);
                },
                [],
                Infinity,
                function(err) {
                    if (!!err) {
                        return done();
                    }

                    return done(new Error('Expected: poll to return an error; Actual: no error returned'));
                });
    });

    it('returns an error if interval is not a positive integer', function(done) {
        poll(
                function(cb) {
                    return cb(null, true);
                },
                0,
                Infinity,
                function(err) {
                    if (!!err) {
                        return done();
                    }

                    return done(new Error('Expected: poll to return an error; Actual: no error returned'));
                });

    });

    it('repeatedly calls its predicate until it returns true, with approximately the value of its interval in milliseconds between calls', function(done) {
       let startTime = Date.now();
       let targetCount = 10;
       let counter = 0;

       // Note that it is possible for this test to fail due to
       // event loop variance. To be more resilient to this variance,
       // it is good to set loose bounds.
       // TODO(nkashy1): Look into averaging expected duration over
       // multiple runs (they should be in parallel if possible). Only
       // do this once some failures have been reported, though.
       let lowerBound = 80;
       let upperBound = 120;

       var predicate = function(cb) {
           if (counter < targetCount) {
               counter++;
               return cb(null, false);
           }
           return cb(null, true);
       };

       return poll(predicate, 10, Infinity, function(err) {
           if (!!err) {
               return done (err);
           }

           let endTime = Date.now();
           let duration = endTime - startTime;
           assert.strictEqual(counter, targetCount);
           assert(duration > 90, `Total duration ${duration} lower than the expected lower bound of ${lowerBound} milliseconds`);
           assert(duration < 110, `Total duration ${duration} higher than the expected upper bound of ${upperBound} milliseconds`);
           done();
       });
    });

    it('returns an error if maxAttempts is neither null nor a number', function(done) {
        return poll(
                function(cb) {
                    return cb(null, true);
                },
                10,
                [],
                function(err) {
                    if (!!err) {
                        return done();
                    }

                    return done(new Error('Expected: poll to return an error; Actual: no error returned'));
                });
    });

    it('replaces a null maxAttempts with Infinity', function(done) {
        var target = 10;
        var counter = 0;
        var predicate = function(cb) {
            if (counter < target) {
                counter++;
                return cb(null, false);
            }
            return cb(null, true);    
        };

        return poll(predicate, 1, null, done);
    });


    it('returns an error if it is asked to poll its predicates in excess of maxAttempts times', function(done) {
        return poll(
                function(cb) {return cb(null, false);},
                5,
                5,
                function(err) {
                    if (!!err) {
                        return done();
                    }
                    
                    return done(new Error('Expected: poll to return an error; Actual: no error returned'));
                });
    });
});
