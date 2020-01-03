const { assert } = require('chai');

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
    .forEach(function (key) {
        Assertable.prototype[key] = assertionBuilder(key);
    });

module.exports = Assertable;