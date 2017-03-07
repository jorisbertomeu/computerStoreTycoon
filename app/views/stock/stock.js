'use strict';

angular.module('CST.stock', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/stock', {
    templateUrl: 'views/stock/stock.html',
    controller: 'stockCtrl'
  });
}])

.controller('stockCtrl', ['$scope', '$filter', 'Notification', '$rootScope', '$q', function($scope, $filter, Notification, $rootScope, $q) {
	var ctrl = $scope;

	ctrl.system = {
		stock: null,
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
		$rootScope.$on('stock', function(event, data) {
			console.log(data);
			ctrl.system.stock = data;
		});
		$rootScope.$emit("getStock", {});
		ctrl.system.view.data.processors = [
				{
					_: {wantBuy: [false, false], qte: 0},
					fields: ['Intelle Core j7 4680k', 4200, 82, 27, [489, 527], [5, 1], [1, 1], '']
				},
				{
					_: {wantBuy: [false, false], qte: 0},
					fields: ['Intelle Core j7 4370k', 3200, 75, 34, [367, 415], [10, 1], [24, 48], '']
				},
				{
					_: {wantBuy: [false, false], qte: 0},
					fields: ['Intelle Core j7 3680j', 2800, 69, 37, [312, 354], [13, 1], [24, 48], '']
				},
				{
					_: {wantBuy: [false, false], qte: 0},
					fields: ['Intelle Core j5 3180k', 2800, 67, 41, [254, 285], [10, 1], [24, 48], '']
				},
				{
					_: {wantBuy: [false, false], qte: 0},
					fields: ['Intelle Core j5 2450i', 2400, 61, 45, [215, 251], [15, 1], [24, 48], '']
				},
				{
					_: {wantBuy: [false, false], qte: 0},
					fields: ['Intelle Core j5 1590b', 2200, 54, 49, [189, 237], [15, 1], [24, 48], '']
				},
				{
					_: {wantBuy: [false, false], qte: 0},
					fields: ['Intelle Core j5 1320b', 1800, 49, 52, [154, 197], [15, 1], [24, 48], '']
				},
				{
					_: {wantBuy: [false, false], qte: 0},
					fields: ['Intelle Core j3 4890k', 2800, 37, 63, [128, 164], [15, 1], [24, 48], '']
				},
				{
					_: {wantBuy: [false, false], qte: 0},
					fields: ['Intelle Core j3 3460l', 2400, 31, 61, [107, 139], [20, 1], [24, 48], '']
				},
				{
					_: {wantBuy: [false, false], qte: 0},
					fields: ['Intelle Core j3 2450h', 2000, 27, 68, [94, 117], [15, 1], [24, 48], '']
				},
			];
		ctrl.system.view.data.memory = [
				{
					_: {wantBuy: [false, false], qte: 0},
					fields: ['Kingstonne VR16384MBCHS3', 1333, 16, 'DDR3', 87, 17, [84, 99], [10, 1], [24, 72], '']
				},
				{
					_: {wantBuy: [false, false], qte: 0},
					fields: ['Kingstonne GH8192MBLKY94', 1333, 8, 'DDR3', 78, 32, [67, 78], [10, 1], [24, 48], '']
				},
				{
					_: {wantBuy: [false, false], qte: 0},
					fields: ['Corssaire CR8192MBKJS54Z', 1333, 8, 'DDR3', 82, 29, [75, 84], [5, 1], [24, 48], '']
				},
				{
					_: {wantBuy: [false, false], qte: 0},
					fields: ['Corssaire CM4096MBJK65DE', 1333, 4, 'DDR3', 68, 48, [49, 58], [15, 1], [24, 48], '']
				},
				{
					_: {wantBuy: [false, false], qte: 0},
					fields: ['Daille DL4096MBKLSKD', 1333, 4, 'DDR3', 49, 78, [34, 41], [20, 1], [24, 48], '']
				},
				{
					_: {wantBuy: [false, false], qte: 0},
					fields: ['Daille MK4096MBKLSK5', 800, 4, 'DDR2', 34, 84, [28, 35], [15, 1], [24, 72], '']
				},
				{
					_: {wantBuy: [false, false], qte: 0},
					fields: ['Daille RT2048ML45QI', 800, 2, 'DDR2', 27, 78, [21, 28], [20, 1], [24, 72], '']
				}
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
			return ['#', 'Modèle', 'Fréquence', 'Indice Perf.', 'Pop.', 'Prix unit.', 'Qté. min.', 'Livraison', 'En stock', ''];
		} else if (type === 2) { // Mémoire
			return ['#', 'Modèle', 'Fréquence', 'Capacité', 'Format', 'Indice Perf.', 'Pop.', 'Prix unit.', 'Qté. min.', 'Livraison', 'En stock', ''];
		}
	}

	function getData(type) {
		if (type === 1) { // Processeurs
			return ctrl.system.view.data.processors;
		} else if (type === 2) { // Mémoire
			return ctrl.system.view.data.memory;
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
		} else if (header === 'Indice Perf.' || header === 'Pop.') {
			var classe = (field > 75) ? 'indice75' : (field > 50) ? 'indice50': (field > 25) ? 'indice25' : 'indice0';

			return {value: field + '%', class: classe};
		} else if (header === 'Fréquence') {
			return {value: field + ' Mhz', class: ''};
		} else if (header === 'Capacité') {
			return {value: field + ' GB', class: ''};
		} else if (header === 'En stock') {
			return {value: '???', class:''};
		} else {
			return {value: field, class:''};
		}
	}

	function buy(item, headers, type) {
		var idxPrice = -1;
		var idxQte = 0;
		var delay = 0;

		for (var i = 0; i < headers.length; i++) {
			if (headers[i] === 'Prix unit.') {
				idxPrice = i - 1;
				continue;
			}
			if (headers[i] === 'Qté. min.') {
				idxQte = i - 1;
				continue;
			}
			if (headers[i] === 'Livraison') {
				delay = item.fields[i - 1][type];
			}
		}
		if (item._.qte < item.fields[idxQte][type]) { // Quantité min non respectée
			Notification.error({message: 'Vous devez en commander au moins ' + item.fields[idxQte][type], delay: 5000});
		} else {
			$rootScope.$emit("addToStock", {value: item.fields[idxPrice][type] * item._.qte, libelle: item.fields[0], obj: item, delay: delay, quantity: item._.qte, type: type});
			item._.qte = 0;
			item._.wantBuy[type] = false;
		}
	}

}]);