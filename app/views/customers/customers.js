'use strict';

angular.module('CST.customers', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/customers', {
    templateUrl: 'views/customers/customers.html',
    controller: 'customersCtrl'
  });
}])

.controller('customersCtrl', function($scope, $rootScope) {
	var ctrl = $scope;

	ctrl.system = {
		clients: [],
		_: {
			formatName: formatName,
			receiveClients: null
		}
	};

	start();

	function formatName(name) {
		for (var i = 0; name.length; i++) {
			if (i === 0) {
				name.replaceAt(i, name[i].toUpperCase());
			}
		}
		return name;
	}

	function start() {
		ctrl.system._.receiveClients = $rootScope.$on('clients', function(event, data) {
			console.log(data);
			ctrl.system.clients = data;
		});
		ctrl.$on("$destroy", ctrl.system._.receiveClients);
		$rootScope.$emit("getClients", {});
	}
});