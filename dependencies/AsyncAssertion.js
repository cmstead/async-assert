const { assert } = require('chai');
const AsyncActionResolver = require('./AsyncActionResolver');

function TransformResolver(transform) {
    this.transform = transform;
    this.expectError = false;
}

TransformResolver.prototype = {
    setErrorIsExpected: function() {
        this.expectError = true;
    },

    buildResolutionHandler: function (resolve, reject, assertion) {
        return (...results) => {
            if (!this.expectError) {
                const actualResult = this.transform(...results);

                assertion(actualResult);

                resolve(true);
            } else {
                reject(new Error('[RequestAssert] Expected an error, but got a success result.'));
            }
        }
    },

    buildRejectionHandler: function (resolve, reject, assertion) {
        return (...results) => {
            if (this.expectError) {
                try {
                    const actualResult = this.transform(...results);

                    assertion(actualResult);

                    resolve(true);
                } catch (e) {
                    reject(e);
                }
            } else {
                reject(new Error('[RequestAssert] Expected a success result, but got an error.'));
            }
        }
    }
};

function AsyncAssertion(asyncAction) {
    this.asyncActionResolver = new AsyncActionResolver(asyncAction);
    this.transformResolver = null;
    this.resultTransform = null;
    this.errorTransform = null;
}

AsyncAssertion.callAction = function(asyncAction) {
    return new AsyncAssertion(asyncAction);
}

AsyncAssertion.prototype = {
    throwOnDuplicateCall: function () {
        if (this.transformResolver !== null) {
            const message = 'Functions assertResult ' +
                'and assertError cannot be used together, ' +
                'or called more than once.'
            throw new Error(message);
        }
    },

    assertResult: function (resultTransform) {
        this.throwOnDuplicateCall();

        this.transformResolver = new TransformResolver(resultTransform);

        this.resultTransform = resultTransform;

        return this;
    },

    assertError: function (resultTransform) {
        this.throwOnDuplicateCall();

        this.transformResolver = new TransformResolver(resultTransform);
        this.transformResolver.setErrorIsExpected();

        this.errorTransform = resultTransform;

        return this;
    },

    buildResolutionHandler: function (resolve, reject, assertion) {
        return (...results) => {
            if (typeof this.resultTransform === 'function') {
                const actualResult = this.resultTransform(...results);

                assertion(actualResult);

                resolve(true);
            } else {
                reject(new Error('[RequestAssert] Expected an error, but got a success result.'));
            }
        }
    },

    buildRejectionHandler: function (resolve, reject, assertion) {
        return (...results) => {
            if (typeof this.errorTransform === 'function') {
                try {
                    const actualResult = this.errorTransform(...results);

                    assertion(actualResult);

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
            const assertion = (result) => assert.equal(...[result].concat(args));
            const handleResolution = this.transformResolver.buildResolutionHandler(resolve, reject, assertion);
            const handleError = this.transformResolver.buildRejectionHandler(resolve, reject, assertion)

            this.asyncActionResolver
                .resolve()
                .then(handleResolution)
                .catch(handleError);
        });
    }
};

module.exports = AsyncAssertion;