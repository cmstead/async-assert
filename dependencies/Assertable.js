const { assert } = require('chai');

function Assertable(transformResolver, asyncActionResolver) {
    this.transformResolver = transformResolver;
    this.asyncActionResolver = asyncActionResolver;
}

Assertable.prototype = {
    buildHandlers: function (resolve, reject, assertion) {
        if (this.transformResolver.expectResponse) {
            const handleResponse = this.transformResolver.buildResponseHandler(resolve, reject, assertion);

            return {
                handleResolution: handleResponse,
                handleError: handleResponse
            };
        } else {
            return {
                handleResolution: this.transformResolver.buildResolutionHandler(resolve, reject, assertion),
                handleError: this.transformResolver.buildRejectionHandler(resolve, reject, assertion)
            };
        }
    }
};



function assertionBuilder(assertionKey) {
    return function (...args) {
        return new Promise((resolve, reject) => {
            const assertion = (result) => assert[assertionKey](...[result].concat(args));

            const {
                handleResolution,
                handleError
            } = this.buildHandlers(resolve, reject, assertion);

            this.asyncActionResolver
                .resolve()
                .then(handleResolution)
                .catch(handleError);
        });
    };
}

Object
    .keys(assert)
    .forEach(function (key) {
        Assertable.prototype[key] = assertionBuilder(key);
    });

module.exports = Assertable;