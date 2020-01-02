const AsyncAssert = require('./dependencies/AsyncAssertion');

module.exports = {
    callAction: (asyncAction) => new AsyncAssert(asyncAction)
};