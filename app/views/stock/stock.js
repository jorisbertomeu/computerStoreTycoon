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
			},
			info: {
				title: 'titi'
			}
		},
		_: {
			categoryList: ['processor', 'memory', 'disk', 'motherboard', 'alim', 'boxe', 'lecteur', 'graphic'],
			uglifyHeader: uglifyHeader,
			translateCategoryByNo: translateCategoryByNo,
			categoryTranslate: [],
			showInfo: showInfo,
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

	function showInfo(cat, header) {
		console.log('Cat = ' + cat + ' header = ' + header);
		ctrl.system.view.info.title = translateCategoryByNo(cat-1);
		$("#infoModal").modal();
	}

	function translateCategoryByNo(no) {
		return translateCategory(ctrl.system._.categoryList[no-1]);
	}

	function translateCategory(word) {
		var replaceBy = "";

		for (var i = 0; i < ctrl.system._.categoryTranslate.length; i++) {
			if (ctrl.system._.categoryTranslate[i].category === word) {
				replaceBy = ctrl.system._.categoryTranslate[i].translate;
				break;
			}
		}
		return replaceBy;
	}

	function start() {
		ctrl.system._.receiveStock = $rootScope.$on('stock', function(event, data) {
			console.log(data);
			ctrl.system.stock = data;
		});
		ctrl.$on("$destroy", ctrl.system._.receiveStock);
		$rootScope.$emit("getStock", {});
		FileLoader.getFile('./res/json/category_translate.json').success(function(data) {
			ctrl.system._.categoryTranslate = data;
		});

		/* Get components data to populate Shop */
		$.each(ctrl.system._.categoryList, function(i, elem) {
			FileLoader.getFile('./res/json/' + ctrl.system._.categoryList[i] + '.json', i).success(function(data) {
				ctrl.system.view.data = Object.defineProperty(ctrl.system.view.data, ctrl.system._.categoryList[i], {value: data, writable: true});
			});
			FileLoader.getFile('./res/json/' + ctrl.system._.categoryList[i] + '_header.json').success(function(data) {
				ctrl.system.view.headers = Object.defineProperty(ctrl.system.view.headers, ctrl.system._.categoryList[i], {value: data, writable: true});
			});
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
		return ctrl.system.view.headers[ctrl.system._.categoryList[type - 1]];
	}

	function getData(type) {
		return ctrl.system.view.data[ctrl.system._.categoryList[type - 1]];
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