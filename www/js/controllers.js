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
    $scope.device = {};
    $scope.relays = {};
    $scope.settingsList = {};

    $ionicLoading.show({
        template: 'Loading...'
    });

    DeviceService.getDevice($stateParams.deviceId).success(function(device) {

        $scope.device = device;

        RelayService.getStates($scope.device).success(function(data) {
            console.log('States data: ', data);
        }).error(function(error) {
            return false;
        });

    }).error(function(error) {
        $ionicLoading.hide();
        return false;
    });

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