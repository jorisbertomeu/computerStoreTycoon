'use strict';

angular.module('CST.customersTasks', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/customersTasks', {
    templateUrl: 'views/customersTasks/customersTasks.html',
    controller: 'customersTasksCtrl'
  });
}])

.controller('customersTasksCtrl', [function() {

}]);