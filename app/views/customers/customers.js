'use strict';

angular.module('CST.customers', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/customers', {
    templateUrl: 'views/customers/customers.html',
    controller: 'customersCtrl'
  });
}])

.controller('customersCtrl', [function() {

}]);