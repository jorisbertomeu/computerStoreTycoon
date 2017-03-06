'use strict';

angular.module('CST.settings', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/settings', {
    templateUrl: 'views/settings/settings.html',
    controller: 'settingsCtrl'
  });
}])

.controller('settingsCtrl', [function() {

}]);