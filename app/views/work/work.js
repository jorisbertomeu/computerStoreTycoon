'use strict';

angular.module('CST.work', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/work', {
    templateUrl: 'views/work/work.html',
    controller: 'workCtrl'
  });
}])

.controller('workCtrl', [function() {

}]);