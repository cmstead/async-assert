# Async Assert #

Assert against asynchronous behaviors in your tests without tearing your hair out.

## Setup ##

Install in your project directory as follows:

`npm install async-assert --save-dev`

## Test Usage ##

Currently Async Assert only supports node tests. Client support will be rolled out according to interest.

Test setup:

```
const AsyncAssert = require('async-assert');

// Test code below
```

### Asserting Against an Async Behavior ###

Method call usage:

```javascript
//... 
// This assumes getUserData returns a promise.

it('fetches user data when user credentials are accepted', function () {
    const userKey = 'an-acceptable-user-key';

    const callGetUserData = () => userDataService.getUserData(userKey);

    const assertion = AsyncAssert.callAction(callGetUserData);

    return assertion
        .assertResult(userData => userData.name)
        .equal('Joe Bazooka');
});

//...
```

Instantiation usage

```javascript
//... 
// This assumes getUserData returns a promise.

it('responds with error when user credentials are not accepted', function () {
    const userKey = 'a-bad-user-key';

    const callGetUserData = () => userDataService.getUserData(userKey);

    const assertion = new AsyncAssert(callGetUserData);

    return assertion
        .assertError(error => error.toString())
        .equal('Error: Bad user key');
});

```

AsyncAssert also supports older callback-style async behaviors without extra overhead:

```javascript
it('fetches user data when user credentials are accepted', function () {
    const userKey = 'an-acceptable-user-key';

    const callGetUserData = (callback) => 
        userDataService.getUserData(userKey, callback);

    const assertion = AsyncAssert.callAction(callGetUserData);

    return assertion
        .assertResult(userData => userData.name)
        .equal('Joe Bazooka');
});
```

## Assertion Methods ##

Async Assert uses Chai assertions under the covers.  This means all assertions which can be made with Chai assert can be made with Async Assert. All typical arguments are accepted by the assertion method, except the "actual value" argument. The assertResult and assertError methods take a transformation function to extract the correct value from the async action response.

Example:

Chai assert equality check:

```javascript
assert.equal(data.key, expectedValue, 'Data did not contain correct value')
```

Async Assert equality check:

```javascript
assertion
    .assertResult(data => data.key)
    .equal(expectedValue, 'Data did not contain correct value')
```

Calling `assertResult` and `assertError` you must provide a transformation function. The remaining arguments for any Chai assertion should match their original contract.

AsyncAssert returns a promise from the assertion call (equal, isTrue, isArray, etc.) which may be directly returned to Mocha, Jasmine, or Jest, notifying the test system that an asynchronous behavior is being tested.

## API Reference ##

**AsyncAssert core behaviors:**

- new AsyncAssert: function => assertion
- AsyncAssert.callAction: function => assertion

**AsyncAssert assertion behaviors:**

- assertion.assertResult: function => assertable
- assertion.assertError: function => assertable

**AsyncAssert assertable behaviors:**

All assertable methods match one-to-one against the [Chai assert API](https://www.chaijs.com/api/assert/).
