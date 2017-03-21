'use strict';

angular.module('CST.settings', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/settings', {
    templateUrl: 'views/settings/settings.html',
    controller: 'settingsCtrl'
  });
}])

.controller('settingsCtrl', function($scope, $rootScope) {
	var ctrl = $scope;

	ctrl.system = {
		_: {
			setMoney: setMoney
		},
		params: {
			money: null
		}
	};

	function setMoney() {
		console.log('Setting money to ' + ctrl.system.params.money);
		$rootScope.$emit("setMoney", ctrl.system.params.money);
	}
});