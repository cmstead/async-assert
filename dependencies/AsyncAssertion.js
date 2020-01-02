const { assert } = require('chai');
const AsyncActionResolver = require('./AsyncActionResolver');
const TransformResolver = require('./TransformResolver');

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
        this.transformResolver.setTransform(resultTransform);
        
        this.resultTransform = resultTransform;

        return this;
    },

    assertError: function (resultTransform) {
        this.throwOnDuplicateCall();

        this.transformResolver = new TransformResolver(resultTransform);
        this.transformResolver.setTransform(resultTransform);
        this.transformResolver.setErrorIsExpected();

        this.errorTransform = resultTransform;

        return this;
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