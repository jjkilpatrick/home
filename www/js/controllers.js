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
            $scope.devices = devices;
        },
        function(err) {
            console.log('List devices call failed: ', err);
        }
    );
})

.controller('DeviceCtrl', function($scope, $q, $stateParams, $ionicLoading, $localstorage, DeviceService, RelayService) {

    $scope.name = $stateParams.deviceName;
    $scope.device = {};
    $scope.relays = {};

    $ionicLoading.show({
        template: 'Loading...'
    });

    // If localstorage doesn't have settingsList
    if (typeof $localstorage.get('settingsList') === 'undefined') {
        DeviceService.getDevice($stateParams.deviceId).success(function(device) {
            $scope.device = device;
            RelayService.getStates($scope.device);
        }).error(function(error) {
            $ionicLoading.hide();
            return false;
        });
    }
    // If localstorage does have settingsList
    else {
        $scope.settingsList = JSON.parse($localstorage.get('settingsList'));
        $ionicLoading.hide();
    }

    spark.onEvent('states', function(e) {

        settingsList = [];
        s = JSON.parse(e.data);

        for (var key in s) {
            o = {
                text: key,
                checked: s[key] ? true : false
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

    // Update localStorage when leaving view
    $scope.$on('$locationChangeStart', function(event) {
        $localstorage.set('settingsList', angular.toJson($scope.settingsList));
    });

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