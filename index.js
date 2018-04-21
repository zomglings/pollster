var isFunction = require('lodash.isfunction');
var isNumber = require('lodash.isnumber');
var isSafeInteger = require('lodash.issafeinteger');

/**
 * Polls a predicate repeatedly by asynchronous recursion
 *
 * @arg predicate {function():boolean} Predicate of no arguments which determines whether or not polling should end; called repeatedly
 * @arg interval {number} Positive, finite integer
 * @arg maxAttempts {number} Positive number - use Infinity for unlimited attempts 
 * @arg done {function} Callback for handling poll result, will be passed error or null
 */
function poll(predicate, interval, maxAttempts, done) {
    // START validation
    if (!isFunction(predicate)) {
        return done(new Error('predicate is not a callable'));
    }

    if (!isSafeInteger(interval)) {
        return done(new Error(`interval ${interval} is not a safe integer`));
    }

    if (interval <= 0) {
        return done(new Error(`interval ${interval} is non-positive`));
    }

    // Default value for maxAttempts is Infinity
    if (maxAttempts === null) {
        maxAttempts = Infinity;
    }

    if (!isNumber(maxAttempts)) {
        return done(new Error(`maxAttempts ${maxAttempts} is not a number`));
    }
    // END validation

    // START polling
    if (maxAttempts <= 0) {
        return done(new Error(`maxAttempts ${maxAttempts} is non-positive`));
    }

    if (!predicate()) {
        return setTimeout(function() {
            poll(predicate, interval, maxAttempts-1, done);
        }, interval);
    }

    return done();
    // END polling
}

module.exports = {
    poll,
};
