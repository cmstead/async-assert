function AsyncActionResolver(asyncAction) {
    this.asyncAction = asyncAction;
}

AsyncActionResolver.prototype = {
    isAPromise: function (maybePromise) {
        return typeof maybePromise === 'object'
            && maybePromise !== null
            && typeof maybePromise.then === 'function'
            && typeof maybePromise.catch === 'function';
    },

    resolve: function () {
        return new Promise((resolve, reject) => {
            const maybePromise = this
                .asyncAction(function (error, ...args) {
                    if(error) {
                        reject(error);
                    } else {
                        resolve(...args);
                    }
                });

            if (this.isAPromise(maybePromise)) {
                maybePromise
                    .then(resolve)
                    .catch(reject);
            }
        });
    }
};

module.exports = AsyncActionResolver;