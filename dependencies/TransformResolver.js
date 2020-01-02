function TransformResolver(transform) {
    this.transform = transform;
    this.expectError = false;
}

TransformResolver.prototype = {
    setErrorIsExpected: function() {
        this.expectError = true;
    },

    buildResolutionHandler: function (resolve, reject, assertion) {
        return (...results) => {
            if (!this.expectError) {
                const actualResult = this.transform(...results);

                assertion(actualResult);

                resolve(true);
            } else {
                reject(new Error('[RequestAssert] Expected an error, but got a success result.'));
            }
        }
    },

    buildRejectionHandler: function (resolve, reject, assertion) {
        return (...results) => {
            if (this.expectError) {
                try {
                    const actualResult = this.transform(...results);

                    assertion(actualResult);

                    resolve(true);
                } catch (e) {
                    reject(e);
                }
            } else {
                reject(new Error('[RequestAssert] Expected a success result, but got an error.'));
            }
        }
    }
};

module.exports = TransformResolver;