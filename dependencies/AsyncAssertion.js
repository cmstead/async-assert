const Assertable = require('./Assertable');
const AsyncActionResolver = require('./AsyncActionResolver');
const TransformResolver = require('./TransformResolver');

function AsyncAssertion(asyncAction) {
    this.asyncActionResolver = new AsyncActionResolver(asyncAction);
}

AsyncAssertion.callAction = function (asyncAction) {
    return new AsyncAssertion(asyncAction);
}

AsyncAssertion.prototype = {
    assertResponse: function (responseTransform) {
        const transformResolver = new TransformResolver(responseTransform);
        transformResolver.responseIsExpected();

        return new Assertable(transformResolver, this.asyncActionResolver);
    },
    
    assertResult: function (resultTransform) {
        const transformResolver = new TransformResolver(resultTransform);
        
        return new Assertable(transformResolver, this.asyncActionResolver);
    },
    
    assertError: function (resultTransform) {
        const transformResolver = new TransformResolver(resultTransform);
        transformResolver.errorIsExpected();

        return new Assertable(transformResolver, this.asyncActionResolver);
    }
};

module.exports = AsyncAssertion;