'use strict';

angular.module('CST.management', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/management', {
    templateUrl: 'views/management/management.html',
    controller: 'managementCtrl'
  });
}])

.controller('managementCtrl', [function() {

}]);