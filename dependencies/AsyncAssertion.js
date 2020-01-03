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