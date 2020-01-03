const { assert } = require('chai');
const AsyncActionResolver = require('./AsyncActionResolver');
const TransformResolver = require('./TransformResolver');

function Assertable(transformResolver, asyncActionResolver) {
    this.transformResolver = transformResolver;
    this.asyncActionResolver = asyncActionResolver;
}

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
        Assertable.prototype[key] = assertionBuilder(key);
    });

function AsyncAssertion(asyncAction) {
    this.asyncActionResolver = new AsyncActionResolver(asyncAction);
    this.transformResolver = new TransformResolver();
}

AsyncAssertion.callAction = function (asyncAction) {
    return new AsyncAssertion(asyncAction);
}

AsyncAssertion.prototype = {
    assertResult: function (resultTransform) {
        const transformResolver = new TransformResolver(resultTransform);
        
        return new Assertable(transformResolver, this.asyncActionResolver);
    },
    
    assertError: function (resultTransform) {
        const transformResolver = new TransformResolver(resultTransform);
        transformResolver.setErrorIsExpected();

        return new Assertable(transformResolver, this.asyncActionResolver);
    }
};

module.exports = AsyncAssertion;