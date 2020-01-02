const { assert } = require('chai');
const AsyncActionResolver = require('./AsyncActionResolver');

function AsyncAssertion(asyncAction) {
    this.asyncActionResolver = new AsyncActionResolver(asyncAction);
    this.resultTransform = null;
    this.errorTransform = null;
}

AsyncAssertion.prototype = {
    throwOnDuplicateCall: function () {
        if (this.resultTransform !== null || this.errorTransform !== null) {
            const message = 'Functions assertResult ' +
                'and assertError cannot be used together, ' +
                'or called more than once.'
            throw new Error(message);
        }
    },
    assertResult: function (resultTransform) {
        this.throwOnDuplicateCall();

        this.resultTransform = resultTransform;

        return this;
    },

    assertError: function (resultTransform) {
        this.throwOnDuplicateCall()

        this.errorTransform = resultTransform;

        return this;
    },

    buildResolutionHandler: function (resolve, reject, args) {
        return (...results) => {
            if (typeof this.resultTransform === 'function') {
                const actualResult = this.resultTransform(...results);
                assert.equal(...[actualResult].concat(args));

                resolve(true);
            } else {
                reject(new Error('[RequestAssert] Expected an error, but got a success result.'));
            }
        }
    },

    buildRejectionHandler: function (resolve, reject, args) {
        return (...results) => {
            if (typeof this.errorTransform === 'function') {
                try {
                    const actualResult = this.errorTransform(...results);

                    assert.equal(...[actualResult].concat(args));

                    resolve(true);
                } catch (e) {
                    reject(e);
                }
            } else {
                reject(new Error('[RequestAssert] Expected a success result, but got an error.'));
            }
        }
    },

    equals: function (...args) {
        return new Promise((resolve, reject) => {
            const handleResolution = this.buildResolutionHandler(resolve, reject, args);
            const handleError = this.buildRejectionHandler(resolve, reject, args)

            this.asyncActionResolver
                .resolve()
                .then(handleResolution)
                .catch(handleError);
        });
    }
};

module.exports = AsyncAssertion;