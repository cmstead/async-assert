const AsyncAssertion = require('../dependencies/AsyncAssertion');
const promisePuppeteer = require('promise-puppeteer');
const { assert } = require('chai');

function delayedResolve(thenableFake, result) {
    setTimeout(() => thenableFake.resolve(result), 15);
}

function delayedReject(thenableFake, result) {
    setTimeout(() => thenableFake.reject(result), 15);
}

describe("Assertion", function () {

    let assertion;
    let thenableFake;

    beforeEach(function () {
        thenableFake = promisePuppeteer.getThenableFake();
        const asyncAction = () => thenableFake;

        assertion = new AsyncAssertion(asyncAction);
    });

    describe("assertResult", function () {
        it("uses a transform to capture result for assertion", function () {
            const actualResult = { message: 'YAY' };

            delayedResolve(thenableFake, actualResult);

            return assertion
                .assertResult(result => result.message)
                .equals('YAY');
        });

        it("fails when transform result doesn't match expected result", function () {
            const actualResult = { message: 'bad message' };

            delayedResolve(thenableFake, actualResult);

            let resolutionState = true;

            return assertion

                .assertResult(result => result.message)
                .equals('ANOTHER YAY')

                .then(() => {
                    resolutionState = false;

                    assert.isTrue(resolutionState, 'Assertion did not fail on bad equality');
                })
                .catch(() => {
                    assert.isTrue(resolutionState);
                });
        });

        it("throws an error when assertResult is called more than once", function () {
            assert.throws(
                () => assertion.assertResult(() => null).assertResult(),
                'Functions assertResult and assertError cannot be used together, or called more than once.');
        });

        it("properly resolves callback-style async actions", function () {
            function callbackStyleAction(callback) {
                setTimeout(() => callback(null, 'something'), 15);
            }

            const assertion = new AsyncAssertion(callbackStyleAction);

            return assertion
                .assertResult(x => x)
                .equals('something');
        });
    });

    describe("assertError", function(){
        it("uses a transform to capture error for assertion", function () {
            const actualError = new Error('Something broke');

            delayedReject(thenableFake, actualError);

            return assertion
                .assertError(result => result.message)
                .equals('Something broke');
        });


    });
});