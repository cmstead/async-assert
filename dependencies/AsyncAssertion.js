const { assert } = require('chai');
const AsyncActionResolver = require('./AsyncActionResolver');
const TransformResolver = require('./TransformResolver');

function AsyncAssertion(asyncAction) {
    this.asyncActionResolver = new AsyncActionResolver(asyncAction);
    this.transformResolver = new TransformResolver();
}

AsyncAssertion.callAction = function (asyncAction) {
    return new AsyncAssertion(asyncAction);
}

AsyncAssertion.prototype = {
    assertResult: function (resultTransform) {
        this.transformResolver.setTransform(resultTransform);

        return this;
    },

    assertError: function (resultTransform) {
        this.transformResolver.setTransform(resultTransform);
        this.transformResolver.setErrorIsExpected();

        return this;
    }
};

function assertionBuilder(assertionKey) {
    return function (...args) {
        return new Promise((resolve, reject) => {
            const assertion = (result) => assert[assertionKey](...[result].concat(args));
            const handleResolution = this.transformResolver.buildResolutionHandler(resolve, reject, assertion);
            const handleError = this.transformResolver.buildRejectionHandler(resolve, reject, assertion)

            this.asyncActionResolver
                .resolve()
                .then(handleResolution)
                .catch(handleError);
        });
    }
}

Object
    .keys(assert)
    .forEach(function(key) {
        AsyncAssertion.prototype[key] = assertionBuilder(key);
    });

module.exports = AsyncAssertion;