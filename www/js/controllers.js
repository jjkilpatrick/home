angular.module('starter.controllers', [])

.controller('StateCtrl', function($scope, LoginService, $state) {

    // If access token exists go to devices layout
    if (window.localStorage.access_token) {
        LoginService.loginWithToken().success(function() {
            $state.go('devices');
        }).error(function(data) {
            $state.go('login');
        });
    }

    $state.go('login');

})

.controller('DevicesCtrl', function($scope, $ionicHistory) {

    $scope.devices = {};

    var devicesPr = spark.listDevices();

    devicesPr.then(
        function(devices) {
            console.log(devices);
            $scope.devices = devices;
        },
        function(err) {
            console.log('List devices call failed: ', err);
        }
    );
})

.controller('DeviceCtrl', function($scope, $stateParams, $ionicLoading, DeviceService, RelayService) {

    $scope.name = $stateParams.deviceName;
    $scope.device;
    $scope.settingsList;

    $ionicLoading.show({
        template: 'Loading...'
    });

    getDevice();

    function getDevice() {
        console.log($stateParams.deviceId);
        DeviceService.getDevice($stateParams.deviceId)
            .success(function (device) {
                getRelays(device);
            })
            .error(function (error) {
                $scope.status = 'Unable to get device data: ' + error.message;
            });
    }

    function getRelays(device) {
        RelayService.getStates(device)
            .success(function (relays) {
                $scope.status = 'Succesfully fetched relay data';
                
            })
            .error(function (error) {
                $scope.status = 'Unable to get relay data: ' + error.message;
            });
    }

    // Event to catch published relay data
    spark.onEvent('states', function(e) {
        settingsList = [];
        $scope.s = JSON.parse(e.data);

        for (var key in $scope.s) {
            o = {
                text: key,
                checked: $scope.s[key]
            };
            settingsList.push(o);
        }

        $scope.settingsList = settingsList;
        $scope.$apply();

        $ionicLoading.hide();
    });

    // Toggle on and off
    $scope.toggleSelection = function toggleSelection(relay) {
        text = relay.text.toLowerCase();
        first = text.charAt(0);
        last = text.charAt(text.length - 1);
        target = first + last;
        state = relay.checked;

        states = {
            'true': 'on',
            'false': 'off'
        };

        $scope.device.callFunction('relay', target + ':' + states[state], function(err, data) {
            if (err) {
                console.log('An error occurred:', err);
            } else {
                console.log('Function called succesfully:', data);
            }
        });
    };

    $scope.refreshItems = function() {
        DeviceService.getDevice($stateParams.deviceId).success(function(device) {

            $scope.device = device;

            RelayService.getStates($scope.device).success(function(data) {
                console.log(data);
            }).error(function(error) {
                return false;
            });

        }).error(function(error) {
            $ionicLoading.hide();
            return false;
        });
    }

})

.controller('LoginCtrl', function($rootScope, $scope, LoginService, $ionicPopup, $state) {

    $scope.data = {};

    $scope.login = function() {
        LoginService.loginUser($scope.data.username, $scope.data.password).success(function(data) {
            $state.go('devices');
        }).error(function(data) {
            var alertPopup = $ionicPopup.alert({
                title: 'Login failed!',
                template: 'Please check your credentials!'
            });
        });
    }
})