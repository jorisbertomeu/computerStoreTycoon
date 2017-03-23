'use strict';

angular.module('CST')

.controller('phoneCtrl', function($scope) {
  var ctrl = $scope;
  var appList = [
  	'home',
  	'messages',
  	'amazonne'
  ];

  ctrl.views = {
  	home: true,
  	messages: false,
  	amazonne: false
  };
  ctrl.system = {
  	_: {
  		currentApp: 0
  	},
  	openApp: openApp
  };

  function openApp(no) {
  	ctrl.system._.currentApp = no;
  	for (var i = 0; i < appList.length; i++) {
  		if (i !== no)
  			ctrl.views[appList[i]] = false;
  		else
  			ctrl.views[appList[i]] = true;
  	}
  }
});