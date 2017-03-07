'use strict';

angular.module('CST.stock', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/stock', {
    templateUrl: 'views/stock/stock.html',
    controller: 'stockCtrl'
  });
}])

.controller('stockCtrl', ['$scope', '$filter', 'Notification', '$rootScope', function($scope, $filter, Notification, $rootScope) {
	var ctrl = $scope;

	ctrl.system = {
		view: {
			_: {
				wantBuy: false
			},
			data: {
				processors: null
			},
			modal: {
				getHeaders: getHeaders,
				getData: getData,
				displayField: displayField,
				buy: buy
			}
		},
		_: {
			commandeType: 0,
			routines: {
				changeTabTo: changeTabTo
			},
			tabs: {
				fournisseur: true,
				amazon: false
			}
		}
	};

	start();

	function start() {
		ctrl.system.view.data.processors = [
				{
					_: {wantBuy: [false, false], qte: 0},
					fields: ['Intelle Core j7 4680k', 4.2, 82, 27, [489, 527], [5, 1], [48, 72]]
				},
				{
					_: {wantBuy: [false, false], qte: 0},
					fields: ['Intelle Core j7 4370k', 3.2, 75, 34, [367, 415], [10, 1], [24, 48]]
				},
				{
					_: {wantBuy: [false, false], qte: 0},
					fields: ['Intelle Core j7 3680j', 2.8, 69, 37, [312, 354], [13, 1], [24, 48]]
				},
				{
					_: {wantBuy: [false, false], qte: 0},
					fields: ['Intelle Core j5 3180k', 2.8, 67, 41, [254, 285], [10, 1], [24, 48]]
				},
				{
					_: {wantBuy: [false, false], qte: 0},
					fields: ['Intelle Core j5 2450i', 2.4, 61, 45, [215, 251], [15, 1], [24, 48]]
				},
				{
					_: {wantBuy: [false, false], qte: 0},
					fields: ['Intelle Core j5 1590b', 2.2, 54, 49, [189, 237], [15, 1], [24, 48]]
				},
				{
					_: {wantBuy: [false, false], qte: 0},
					fields: ['Intelle Core j5 1320b', 1.8, 49, 52, [154, 197], [15, 1], [24, 48]]
				},
				{
					_: {wantBuy: [false, false], qte: 0},
					fields: ['Intelle Core j3 4890k', 2.8, 37, 63, [128, 164], [15, 1], [24, 48]]
				},
				{
					_: {wantBuy: [false, false], qte: 0},
					fields: ['Intelle Core j3 3460l', 2.4, 31, 61, [107, 139], [20, 1], [24, 48]]
				},
				{
					_: {wantBuy: [false, false], qte: 0},
					fields: ['Intelle Core j3 2450h', 2.0, 27, 68, [94, 117], [15, 1], [24, 48]]
				},
			];
	}

	function changeTabTo(dest) {
		if (dest === 0) {
			ctrl.system._.tabs.fournisseur = true;
			ctrl.system._.tabs.amazon = false;
		} else if (dest === 1) {
			ctrl.system._.tabs.fournisseur = false;
			ctrl.system._.tabs.amazon = true;
		}
	}

	function getHeaders(type) {
		if (type === 1) { // Processeurs
			return ['#', 'Modèle', 'Fréquence', 'Indice Perf.', 'Pop.', 'Prix unit.', 'Qté. min.', 'Livraison', ''];
		}
	}

	function getData(type) {
		if (type === 1) { // Processeurs
			return ctrl.system.view.data.processors;
		}
	}

	function displayField(field, type, header) {
		if (Array.isArray(field)) {
			if (header === 'Prix unit.') {
				return {value: $filter('currency')(field[type], '€'), class: ''};
			}
			if (header === 'Livraison') {
				return {value: field[type] + 'h', class: ''};
			}
			return {value: field[type], class:''};
		}
		if (header === 'Indice Perf.' || header === 'Pop.') {
			var classe = (field > 75) ? 'indice75' : (field > 50) ? 'indice50': (field > 25) ? 'indice25' : 'indice0';

			return {value: field + '%', class: classe};
		}
		if (header === 'Fréquence') {
			return {value: field + ' Ghz', class: ''};
		}
		return {value: field, class:''};
	}

	function buy(item, headers, type) {
		for (var i = 0; i < headers.length; i++) {
			if (headers[i] === 'Prix unit.') {
				$rootScope.$emit("removeFromSolde", {value: item.fields[i - 1][type] * item._.qte, libelle: item.fields[0]});
				break;
			}
		}
	}

}]);