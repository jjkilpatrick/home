angular.module('starter.services', [])

.factory('DeviceService', function($q) {
    return {
        getDevice: function(id) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            spark.getDevice(id).then(
                function(device) {
                    console.log('Successfully fetched device from particle: ', device);
                    deferred.resolve(device);
                },
                function(err) {
                    console.log('Error fetching device: ', err);
                    deferred.reject(err);
                }
            );

            promise.success = function(fn) {
                promise.then(fn);
                return promise;
            }
            promise.error = function(fn) {
                promise.then(null, fn);
                return promise;
            }
            return promise;
        },
    }
})

.factory('RelayService', function($q) {
    return {
        getStates: function(device) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            device.callFunction('states', null, function(err, data) {
                if (!err) {
                    console.log('Function called succesfully:', data);
                    deferred.resolve(device);
                } else {
                    console.log('An error occurred:', err);
                    deferred.reject(err);
                }
            });

            promise.success = function(fn) {
                promise.then(fn);
                return promise;
            }
            promise.error = function(fn) {
                promise.then(null, fn);
                return promise;
            }
            return promise;
        }
    }
})

.factory('LoginService', function($q) {
    return {
        loginUser: function(name, pw) {
            var deferred = $q.defer();
            var promise = deferred.promise;

            spark.login({
                username: name,
                password: pw
            }).then(
                function(token) {
                    console.log('Successfully logged in to particle');
                    // Save access token to localStorage
                    window.localStorage['access_token'] = token.access_token;
                    deferred.resolve(token);
                },
                function(err) {
                    console.log('Error logging in to particle');
                    deferred.reject(err);
                }
            );

            promise.success = function(fn) {
                promise.then(fn);
                return promise;
            }
            promise.error = function(fn) {
                promise.then(null, fn);
                return promise;
            }
            return promise;
        },
        loginWithToken: function() {
            var deferred = $q.defer();
            var promise = deferred.promise;

            // This doesn't behave as expected. Waiting for particle to update SDK
            spark.login({
                accessToken: window.localStorage.access_token
            }).then(
                function(token) {
                    console.log('Successfully logged in to particle with access token');
                    deferred.resolve(token);
                },
                function(err) {
                    // Login failed so remove access token from localStorage
                    window.localStorage.removeItem('access_token');
                    console.log('Error logging in with access token');
                    deferred.reject(err);
                }
            );

            promise.success = function(fn) {
                promise.then(fn);
                return promise;
            }
            promise.error = function(fn) {
                promise.then(null, fn);
                return promise;
            }
            return promise;
        }
    }
});