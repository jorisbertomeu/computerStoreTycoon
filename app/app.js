'use strict';

// Declare app level module which depends on views, and components
angular.module('CST', [
  'ngRoute',
  /* VIEWS */
  'CST.dashboard',
  'CST.stock',
  'CST.work',
  /* VIEWS */
  'CST.version'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/dashboard'});
}]);
