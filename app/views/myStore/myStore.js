'use strict';

angular.module('CST.myStore', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/myStore', {
    templateUrl: 'views/myStore/myStore.html',
    controller: 'myStoreCtrl'
  });
}])

.controller('myStoreCtrl', [function() {

}]);