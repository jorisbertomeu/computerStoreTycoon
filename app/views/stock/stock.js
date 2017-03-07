'use strict';

angular.module('CST.stock', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/stock', {
    templateUrl: 'views/stock/stock.html',
    controller: 'stockCtrl'
  });
}])

.controller('stockCtrl', ['$scope', '$filter', 'Notification', '$rootScope', '$q', '$sce', 'FileLoader', function($scope, $filter, Notification, $rootScope, $q, $sce, FileLoader) {
	var ctrl = $scope;

	ctrl.system = {
		stock: null,
		view: {
			_: {
				wantBuy: false
			},
			headers: {},
			data: {},
			modal: {
				getHeaders: getHeaders,
				getData: getData,
				displayField: displayField,
				buy: buy
			}
		},
		_: {
			receiveStock: null,
			commandeType: 0,
			routines: {
				trustHTML: trustHTML,
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
		ctrl.system._.receiveStock = $rootScope.$on('stock', function(event, data) {
			console.log(data);
			ctrl.system.stock = data;
		});
		ctrl.$on("$destroy", ctrl.system._.receiveStock);
		$rootScope.$emit("getStock", {});
		/* Get components data to populate Shop */
		FileLoader.getFile('./res/json/processors.json').success(function(data) {
			ctrl.system.view.data.processors = data;
		});
		FileLoader.getFile('./res/json/memory.json').success(function(data) {
			ctrl.system.view.data.memory = data;
		});
		FileLoader.getFile('./res/json/disks.json').success(function(data) {
			ctrl.system.view.data.disks = data;
		});
		FileLoader.getFile('./res/json/motherboards.json').success(function(data) {
			ctrl.system.view.data.motherboards = data;
		});
		FileLoader.getFile('./res/json/alimentation.json').success(function(data) {
			ctrl.system.view.data.alimentation = data;
		});
		/* Get header's components */
		FileLoader.getFile('./res/json/processors_header.json').success(function(data) {
			ctrl.system.view.headers.processors = data;
		});
		FileLoader.getFile('./res/json/memory_header.json').success(function(data) {
			ctrl.system.view.headers.memory = data;
		});
		FileLoader.getFile('./res/json/disks_header.json').success(function(data) {
			ctrl.system.view.headers.disks = data;
		});
		FileLoader.getFile('./res/json/motherboards_header.json').success(function(data) {
			ctrl.system.view.headers.motherboards = data;
		});
		FileLoader.getFile('./res/json/alimentation_header.json').success(function(data) {
			ctrl.system.view.headers.alimentation = data;
		});
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
			return ctrl.system.view.headers.processors;
		} else if (type === 2) { // Mémoire
			return ctrl.system.view.headers.memory;
		} else if (type === 3) { // Disks
			return ctrl.system.view.headers.disks;
		} else if (type === 4) { // MB
			return ctrl.system.view.headers.motherboards;
		} else if (type === 5) { // Alim
			return ctrl.system.view.headers.alimentation;
		}
	}

	function getData(type) {
		if (type === 1) { // Processeurs
			return ctrl.system.view.data.processors;
		} else if (type === 2) { // Mémoire
			return ctrl.system.view.data.memory;
		} else if (type === 3) { // Mémoire
			return ctrl.system.view.data.disks;
		} else if (type === 4) { // MB
			return ctrl.system.view.data.motherboards;
		} else if (type === 5) { // Alim
			return ctrl.system.view.data.alimentation;
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
		} else if (header === 'Fréquence' || header === 'Fréquence mémoire') {
			return {value: field + ' Mhz', class: ''};
		} else if (header === 'Capacité') {
			return {value: field + ' GB', class: ''};
		} else if (header === 'En stock') {
			return {value: '???', class:''};
		} else if (header === 'SSD') {
			return {value: (field === true) ? $sce.trustAsHtml('YES') : $sce.trustAsHtml('NO'), class: (field === true) ? 'greenText' : 'redText'};
		} else {
			return {value: field, class:''};
		}
	}

	function trustHTML(val) {
		return $sce.trustAsHtml(val);
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
			Notification.error({message: 'Vous devez en commander au moins ' + item.fields[idxQte][type], delay: null});
		} else {
			$rootScope.$emit("addToStock", {value: item.fields[idxPrice][type] * item._.qte, libelle: item.fields[0], obj: item, delay: delay, quantity: item._.qte, type: type});
			item._.qte = 1;
			item._.wantBuy[type] = false;
		}
	}

}]);