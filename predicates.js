var {spawn} = require('child_process');
var isFunction = require('lodash.isfunction');
var isSafeInteger = require('lodash.issafeinteger');

/**
 * Wraps a synchronous predicate for use in pollster
 *
 * @arg synchronousPredicate {function} Synchronous predicate function
 *
 * @returns {function} Asynchronous version of synchronousPredicate
 */
function asynchronize(synchronousPredicate) {
    if (!isFunction(synchronousPredicate)) {
        throw new Error('Cannot asynchronize a non-function');
    }

    function asynchronization(cb) {
        let result;
        try {
            result = synchronousPredicate();
        } catch(err) {
            return cb(err);
        }

        return cb(null, result);
    }

    return asynchronization;
}

/**
 * Returns a predicate function which runs a command in a child process
 * and returns true if the subprocess exits with code 0, false if the
 * subprocess exists with code 1, and an error otherwise
 *
 * Note: The first three arguments to `spawnPredicate` are identical to
 * the arguments to `child_process.spawn`. For more information, see: https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
 *
 * @arg command {string} Command to run in child process
 * @arg args {string[]} Arguments to the command
 * @arg opts {Object} Options to pass through to `child_process.spawn`
 * @arg timeout {number} How long to let the subprocess run before killing
 * it, expected to be a positive integer
 *
 * @returns {function} Predicate which conforms to the description of this
 * function
 */
function spawnPredicate(command, args, opts, timeout) {
    if (!isSafeInteger(timeout)) {
        throw new Error(`Timeout ${timeout} is not a safe integer`);
    }
    if (timeout <= 0) {
        throw new Error(`Timeout ${timeout} should be positive`);
    }

    function predicate(cb) {
        let child = spawn(command, args, opts);

        // Note that the recursive setTimeout calls made by pollster
        // imply that a new instance of this predicate will be used
        // in each poll.
        let childState = {
            cbCalled: false,
            alive: true
        }

        function maybeCallback(err, result) {
            if (!childState.cbCalled) {
                childState.cbCalled = true;
                return cb(err, result);
            }
        }

        child.on('exit', (code, signal) => {
            childAlive = false;
            if (code === 0) {
                maybeCallback(null, true);
            } else if (code === 1) {
                maybeCallback(null, false);
            } else if (!!signal) {
                let err = new Error(`Predicate interrupted: ${signal}`);
                maybeCallback(err); 
            } else {
                let err = new Error(`Predicate exited with code ${code}`);
                maybeCallback(err);
            }
        });

        child.on('error', (err) => {
            maybeCallback(err);
        });

        setTimeout(() => {
            if (childState.alive) {
                child.kill();
            }
        }, timeout);

        return child;
    }

    return predicate;
}

module.exports = {
    asynchronize,
    spawnPredicate
};
