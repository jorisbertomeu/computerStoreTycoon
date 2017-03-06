'use strict';

// Declare app level module which depends on views, and components
angular.module('PCBT', [
  'ngRoute',
  'PCBT.view1',
  'PCBT.view2',
  'PCBT.version'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/view1'});
}]);
