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
				getPrice: getPrice,
				getHeaders: getHeaders,
				getData: getData,
				displayField: displayField,
				buy: buy
			}
		},
		_: {
			showByCat: showByCat,
			showInfoButton: showInfoButton,
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
		FileLoader.getFile('./res/json/boxes.json').success(function(data) {
			ctrl.system.view.data.boxes = data;
		});
		FileLoader.getFile('./res/json/lecteurs.json').success(function(data) {
			ctrl.system.view.data.lecteurs = data;
		});
		FileLoader.getFile('./res/json/graphic.json').success(function(data) {
			ctrl.system.view.data.graphic = data;
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
		FileLoader.getFile('./res/json/boxes_header.json').success(function(data) {
			ctrl.system.view.headers.boxes = data;
		});
		FileLoader.getFile('./res/json/lecteurs_header.json').success(function(data) {
			ctrl.system.view.headers.lecteurs = data;
		});
		FileLoader.getFile('./res/json/graphic_header.json').success(function(data) {
			ctrl.system.view.headers.graphic = data;
		});
	}

	function showByCat(type) {
		var tab = [];

		$.each(ctrl.system.stock, function(i, elem) {
			if (elem.type === type) {
				tab.push(elem);
			}
		});
		return tab;
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
		}  else if (type === 6) { // Boitiers
			return ctrl.system.view.headers.boxes;
		} else if (type === 7) { // Lecteurs
			return ctrl.system.view.headers.lecteurs;
		} else if (type === 8) { // graphic
			return ctrl.system.view.headers.graphic;
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
		} else if (type === 6) { // Boitiers
			return ctrl.system.view.data.boxes;
		} else if (type === 7) { // Lecteurs
			return ctrl.system.view.data.lecteurs;
		} else if (type === 8) { // graphic
			return ctrl.system.view.data.graphic;
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
		} else if (header === 'Consommation') {
			return {value: field + ' W', class: ''};
		} else if (header === 'Capacité' || header === 'Mémoire') {
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

	function getPrice(item, headers, type) {
		var price = 0;

		for (var i = 0; i < headers.length; i++) {
			if (headers[i] === 'Prix unit.') {
				price = item.fields[i - 1][type];
				break;
			}
		}
		return price;
	}

	function isInArray(val, array) {
		var found = false;

		for (var i = 0; i < array.length; i++) {
			if (val === array[i]) {
				found = true;
				break;
			}
		}
		return found;
	}

	function setCharAt(str, index, chr) {
	    if (index > str.length - 1)
	    	return str;
	    return str.substr(0, index) + chr + str.substr(index + 1);
	}

	function uglifyHeader(header) {
		header = header.toLowerCase();
		for (var i = 0; i < header.length; i++) {
			if (header[i] === ' ') {
				header = setCharAt(header, i, '_');
			} else if (header[i] === 'é' ||header[i] === 'è') {
				header = setCharAt(header, i, 'e');
			} else if (header[i] === '.') {
				header = setCharAt(header, i, '');
				i--;
			}

		}
		return header;
	}

	function buildObj(item, headers, type) {
		var obj = {
			specs: {},
			typeAchat: type,
			type: item._.type
		};
		var exclude = ["Qté. min.", "Livraison", "En stock", '#', ''];

		for (var i = 0; i < headers.length; i++) {
			if (!isInArray(headers[i], exclude)) {
				obj.specs[uglifyHeader(headers[i])] = item.fields[i - 1];
			}
		}
		console.log(obj);
		return obj;
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
			var newObj = buildObj(item, headers, type);
			$rootScope.$emit("addToStock", {value: item.fields[idxPrice][type] * item._.qte, libelle: item.fields[0], obj: newObj, delay: delay, quantity: item._.qte, type: type});
			item._.qte = 1;
			item._.wantBuy[type] = false;
		}
	}

	function showInfoButton(header) {
		var show = false;

		if (header === 'Socket' || header === 'Fréquence' || header === 'Capacité' || header === 'Format' || header === 'SSD' || header === 'Format DIMM'
			|| header === 'Ports SATA' || header === 'Fréquence mémoire' || header === 'Consommation' || header === 'Nb. ventilateurs' || header === 'Type'
			|| header === 'Mémoire' || header === 'Nb. sortie vidéo') {
			show = true;
		}
		return show;
	}

}]);