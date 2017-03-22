'use strict';

angular.module('CST')

.controller('phoneCtrl', function($scope) {
  var ctrl = $scope;

  ctrl.views = {
  	home: true
  };
  ctrl.homeButtonPressed = homeButtonPressed;

  function homeButtonPressed() {
    console.log('Home button pressed bro !');
    ctrl.views.home = true;
  }
});