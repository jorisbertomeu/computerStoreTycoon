'use strict';

angular.module('CST.work', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/work', {
    templateUrl: 'views/work/work.html',
    controller: 'workCtrl'
  });
}])

.controller('workCtrl', function($scope, $rootScope, FileLoader, Notification, $timeout) {
	var ctrl = $scope;

	ctrl.system = {
		stock: [],
		_: {
			installOs: installOs,
			computerDone: computerDone,
			calculateTotalMemory: calculateTotalMemory,
			getNumber: getNumber,
			convertFromGo: convertFromGo,
			getSataComponent: getSataComponent,
			debug: debugFn,
			getComponent: getComponent,
			categoryTranslate : [],
			receiveWork: null,
			inProgressTaskReceived: null,
			initTesting: initTesting,
			receiveStock: null,
			displayTime: displayTime,
			buildComputer: buildComputer,
			setTabActive: setTabActive,
			dropSuccessHandler: dropSuccessHandler,
			onDrop: onDrop,
			getPrice: getPrice,
			translateCategory: translateCategory,
			testing: {
				bios: true,
				startupOs: false,
				osNotFound: false,
				osStarted: false
			}
		},
		view: {
			tabPane1: {
				processor: true,
				memory: false,
				disk: false,
				motherboard: false,
				alim: false,
				boxe: false,
				lecteur: false,
				graphic: false
			}
		},
		work: [],
		building: {
			workId: -1,
			sataComponent: [],
			os: {
				installed: false
			},
			active: false,
			workplan: {
				objs: []
			}
		}
	}

	start();

	function buildComputer(work, idx) {
		ctrl.system.building.active = true;
		ctrl.system.building.work = work;
		ctrl.system.building.workId = idx;
	}

	function updateStock() {
		var stock = [];

		for (var i = 0; i < ctrl.system.stock.length; i++) {
			for (var j = 0; j < ctrl.system.stock[i].objs.length; j++) {
				stock.push(ctrl.system.stock[i].objs[j]);
			}
		}
		$rootScope.$emit("setStock", stock);
	}

	function computerDone() {
		console.log(ctrl.system.stock);
		Notification.success({message: "L'ordinateur a été mit de côté pour " + ctrl.system.building.work.people.name, delay: null});
		updateStock();
		$rootScope.$emit("workComputerDone", {
			workId: ctrl.system.building.workId,
			components: ctrl.system.building.workplan.objs,
			software: {
				osInstalled: ctrl.system.building.os.installed
			}
		});
		ctrl.system.building.active = false;
		ctrl.system.building.work = null;
		ctrl.system.building.sataComponent = [];
		ctrl.system.building.os.installed = false;
		ctrl.system.building.workplan.objs = [];
		ctrl.system.building.workId = -1;
	}

	function setTabActive(id, elem) {
		if (id === 1) {
			ctrl.system.view.tabPane1.processor = false;
			ctrl.system.view.tabPane1.memory = false;
			ctrl.system.view.tabPane1.disk = false;
			ctrl.system.view.tabPane1.motherboard = false;
			ctrl.system.view.tabPane1.alim = false;
			ctrl.system.view.tabPane1.boxe = false;
			ctrl.system.view.tabPane1.lecteur = false;
			ctrl.system.view.tabPane1.graphic = false;
			ctrl.system.view.tabPane1[elem] = true;
		}
	}

	function addToStock(idx, data) {
	    var found = false;

	    for (var i = 0; i < ctrl.system.stock[idx].objs.length; i++) {
	      if (ctrl.system.stock[idx].objs[i].specs.modele === data.specs.modele) {
	        ctrl.system.stock[idx].objs[i].quantity += data.quantity;
	        found = true;
	      }
	    }
	    if (!found) {
	      ctrl.system.stock[idx].objs.push({
	        specs: data.specs,
	        quantity: data.quantity,
	        type: data.type,
	        from: 0, /* From stock */
	        typeAchat: data.typeAchat
	      });
	    }
	}

	function installOs() {
		if (!computerIsOk()) {
			Notification.error({message: "L'ordinateur n'est pas en état de fonctionner, il manque des pièces !", delay: null});
			return;
		}
		$rootScope.$emit("newInProgressTask", {
			title: "Installation d'un système d'exploitation",
			time: 0.19, // -> 11mn - Correspond au temps du sample audio de 11 secondes 
			data: null,
			soundFile: "res/audio/misc/hard_drive.mp3"
		});
		Notification.primary({message: "Installation du système d'exploitation en cours ...", delay: null});
	}

	function getSataComponent(idx) {
		var totalSata = parseInt(getComponent(ctrl.system.building.workplan.objs, 'motherboard')[0].specs.ports_sata, 10);
		var found = false;
		var component = "None";

		$.each(getComponent(ctrl.system.building.workplan.objs, 'disk'), function(i, elem) {
			if (ctrl.system.building.sataComponent.indexOf(elem.specs.modele) < 0 && !found) {
				found = true;
				component = elem.specs.modele;
				ctrl.system.building.sataComponent.push(elem.specs.modele);
			}
		});
		$.each(getComponent(ctrl.system.building.workplan.objs, 'lecteur'), function(i, elem) {
			if (ctrl.system.building.sataComponent.indexOf(elem.specs.modele) < 0 && !found) {
				found = true;
				component = elem.specs.modele;
				ctrl.system.building.sataComponent.push(elem.specs.modele);
			}
		});
		return (ctrl.system.building.sataComponent.length > idx) ? ctrl.system.building.sataComponent[idx] : 'None';
	}

	function computerIsOk() {
		if (getNbHardware(ctrl.system.building.workplan.objs, 'processor') === 0)
			return false;
		if (getNbHardware(ctrl.system.building.workplan.objs, 'memory') === 0)
			return false;
		if (getNbHardware(ctrl.system.building.workplan.objs, 'disk') === 0)
			return false;
		if (getNbHardware(ctrl.system.building.workplan.objs, 'motherboard') === 0)
			return false;
		if (getNbHardware(ctrl.system.building.workplan.objs, 'alim') === 0)
			return false;
		if (getNbHardware(ctrl.system.building.workplan.objs, 'boxe') === 0)
			return false;
		return true;
	}

	function initTesting() {
		if (!computerIsOk()) {
			Notification.error({message: "L'ordinateur ne peut pas démarrer, il manque des pièces essentielles !", delay: null});
			return;
		}
		$('#testOrdinateurModal').modal('show');
		ctrl.system._.testing.bios = true;
		ctrl.system._.testing.osStarted = false;
		ctrl.system._.testing.osNotFound = false;
		ctrl.system._.testing.startupOs = false;

		ctrl.system.building.active = false;
		ctrl.system.building.sataComponent = [];
		setTimeout(function() {
			if (ctrl.system.building.os.installed) {
				$timeout(function() { ctrl.system._.testing.startupOs = true });
				setTimeout(function() {
					$timeout(function() {
						ctrl.system._.testing.osStarted = true;
						ctrl.system._.testing.startupOs = false;
					});
				}, 5000);
			} else
				$timeout(function() { ctrl.system._.testing.osNotFound = true });
			$timeout(function() { ctrl.system._.testing.bios = false });
			console.log(ctrl.system._.testing);
		}, 3000);
	}

	function getNumber(nbr) {
		var arr = [];

		for(var i = 0; i < nbr; i++) {
			arr.push(i);
		}
		return arr;
	}

	function getNbHardware(from, type) {
		var nbr = 0;

		console.log(from);
		for (var i = 0; i < from.length; i++) {
			if (from[i].type === type) {
				nbr++;
			}
		}
		return nbr;
	}

	function calculateTotalMemory() {
		var total = 0;

		$.each(ctrl.system._.getComponent(ctrl.system.building.workplan.objs, 'memory'), function(i, elem) {
			total += elem.specs.capacite;
		});
		return total;
	}

	function convertFromGo(value, unit) {
		var tab = [{unit: 'ko', ratio: 1048576}];
		var ret = 0;

		$.each(tab, function(i, elem) {
			if (elem.unit === unit.toLowerCase()) {
				ret = value * elem.ratio;
			}
		});
		return ret + ' ' + unit;
	}

	function debugFn(p) {
		if (p === 1) {
			console.log(ctrl.system._.getComponent(ctrl.system.building.workplan.objs, 'processor'));
		}
	}

	function getComponent(from, type) {
		var ret = [];

		for (var i = 0; i < from.length; i++) {
			if (from[i].type === type) {
				ret.push(from[i]);
			}
		}
		return ret;
	}

	function getPrice() {
		var price = 0;

		for (var i = 0; i < ctrl.system.building.workplan.objs.length; i++) {
			price += ctrl.system.building.workplan.objs[i].quantity * ctrl.system.building.workplan.objs[i].specs.prix_unit[ctrl.system.building.workplan.objs[i].typeAchat];
		}
		return price;
	}

	function hardIsAllowed(from, data, silentMode, toTest) {
		var ret = true;

		if ((data.type === 'processor' || data.type === 'motherboard' || data.type === 'alim' || data.type === 'boxe') && !toTest) {
			if (getNbHardware(from, data.type) > 0) {
				ret = false;
				if (!silentMode)
					Notification.error({message: "Vous ne pouvez pas ajouter un composant de type '" + translateCategory(data.type) + "', un seul type de ce composant peut etre assemblé !", delay: 10000});
			}
		}
		if ((data.type === 'processor' || data.type === 'memory' || data.type === 'disk' || data.type === 'lecteur' || data.type === 'graphic') && getNbHardware(from, 'motherboard') === 0) {
			if (!silentMode)
				Notification.error({message: "Vous devez placer une carte mère avant d'assembler un composant de type '" + translateCategory(data.type) + "'.", delay: 10000});
			ret = false;
		}
		if ((data.type === 'alim' || data.type === 'lecteur' || data.type === 'motherboard') && getNbHardware(from, 'boxe') === 0) {
			if (!silentMode)
				Notification.error({message: "Vous devez placer une Boitier avant d'assembler un composant de type '" + translateCategory(data.type) + "'.", delay: 10000});
			ret = false;
		}
		if (data.type === 'processor') {
			if (getNbHardware(from, 'motherboard') > 0 && getComponent(from, 'motherboard')[0].specs.socket !== data.specs.socket) {
				if (!silentMode)
					Notification.error({message: "Le socket de votre processeur est incompatible avec celui de votre carte mère !", delay: 10000});
				ret = false;
			}
		}
		if (data.type === 'memory') {
			if (parseInt(getComponent(from, 'motherboard')[0].specs.frequence_memoire, 10) !== data.specs.frequence) {
				if (!silentMode)
					Notification.error({message: "La fréquence de votre mémoire est incompatible avec celle de votre carte mère !", delay: 10000});
				ret = false;
			}
			if (getComponent(from, 'motherboard')[0].specs.format_dimm !== data.specs.format) {
				if (!silentMode)
					Notification.error({message: "Le format DIMM de votre mémoire est incompatible avec celle de votre carte mère !", delay: 10000});
				ret = false;
			}
		}
		if (data.type === 'disk' || data.type === 'lecteur') {
			if (parseInt(getComponent(from, 'motherboard')[0].specs.ports_sata, 10) < (getNbHardware(from, 'disk') + getNbHardware(from, 'lecteur') + 1)) {
				if (!silentMode)
					Notification.error({message: "Les ports SATA présents sur votre carte mère sont tous occupés !", delay: 10000});
				ret = false;
			}
		}
		if (data.type === 'alim') {
			if (getComponent(from, 'boxe')[0].specs.format !== data.specs.format) {
				if (!silentMode)
					Notification.error({message: "Votre alimentation n'est pas au même format que l'emplacement prévu dans le boitier !", delay: 10000});
				ret = false;
			}
		}
		return ret;
	}

	function addToWorkplan(obj) {
		var found = false;

		for (var i = 0; i < ctrl.system.building.workplan.objs.length; i++) {
			if (ctrl.system.building.workplan.objs[i].specs.modele === obj.specs.modele) {
				ctrl.system.building.workplan.objs[i].quantity += 1;
				found = true;
				break;
			}
		}
		if (!found) {
			obj.quantity = 1;
			obj.from = 1;
			ctrl.system.building.workplan.objs.push(obj);
		}
	}

	function deleteFromWorkplan(obj) {
		for (var i = 0; i < ctrl.system.building.workplan.objs.length; i++) {
			if (ctrl.system.building.workplan.objs[i].specs.modele === obj.specs.modele) {
				ctrl.system.building.workplan.objs[i].quantity -= 1;
				if (ctrl.system.building.workplan.objs[i].quantity <= 0) {
					ctrl.system.building.workplan.objs.splice(i, 1);
				}
				break;
			}
		}
	}

	function allowedToBeRemoved(obj) {
		var tmp = angular.copy(ctrl.system.building.workplan.objs);
		var allowed = 0;

		for (var i = 0; i < tmp.length; i++) {
			if (tmp[i].specs.modele === obj.specs.modele) {
				tmp[i].quantity -= 1;
				if (tmp[i].quantity <= 0) {
					tmp.splice(i, 1);
				}
				break;
			}
		}
		for (var i = 0; i < tmp.length; i++) {
			allowed += (hardIsAllowed(tmp, tmp[i], false, true) === true) ? 0 : 1;
		}
		return (allowed !== 0) ? false : true;
	}

	function onDrop($event, $data, from) {
		console.log($data);
		if ($data.from === from) {
			return;
		}
		for (var i = 0; i < ctrl.system.stock.length; i++) {
			if (ctrl.system.stock[i].type === $data.type) {
				for (var j = 0; j < ctrl.system.stock[i].objs.length; j++) {
					if (ctrl.system.stock[i].objs[j].specs.modele === $data.specs.modele) {
						if (from === 1 && hardIsAllowed(ctrl.system.building.workplan.objs, $data)) { // From Stock
							console.log('From stock');
							ctrl.system.stock[i].objs[j].quantity -= 1;
							addToWorkplan(angular.copy(ctrl.system.stock[i].objs[j]));
						} else if (from === 0 && allowedToBeRemoved($data)) { // From Workplan
							console.log('From wp');
							ctrl.system.stock[i].objs[j].quantity += 1;
							deleteFromWorkplan($data);
						} else {
							console.log('From ??? -> ' + from);
						}
						break;
					}
				}
				break;
			}
		}
	}

	function dropSuccessHandler($event, $index, obj) {
		// console.log('dropSuccessHandler');
		// console.log($event);
		// console.log($index);
		// console.log(obj);
	}

	function addToSplittedStock(elem) {
		var found = false;

		for (var i = 0; i < ctrl.system.stock.length; i++) {
			if (ctrl.system.stock[i].type === elem.type) {
				addToStock(i, elem);
				found = true;
				break;
			}
		}
		if (!found) {
			ctrl.system.stock.push({
				type: elem.type,
				objs: [elem]
			});
		}
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
		ctrl.system._.receiveWork = $rootScope.$on('work', function(event, data) {
			console.log(data);
			ctrl.system.work = data;
		});
		ctrl.$on("$destroy", ctrl.system._.receiveWork);
		$rootScope.$emit("getWork", {});
		ctrl.system._.inProgressTaskReceived = $rootScope.$on('inProgressTaskFinished', function(event, data) {
			console.log("L'installation de l'OS a terminé bro ;)");
			ctrl.system.building.os.installed = true;
			Notification.success({message: "Le système d'exploitation a été installé avec succès !", delay: null});
		});
		ctrl.$on("$destroy", ctrl.system._.inProgressTaskReceived);
		ctrl.system._.receiveStock = $rootScope.$on('stock', function(event, data) {
			console.log(data);
			for (var i = 0; i < data.length; i++) {
				addToSplittedStock(data[i]);
			}
			console.log(ctrl.system.stock);
		});
		ctrl.$on("$destroy", ctrl.system._.receiveStock);
		$rootScope.$emit("getStock", {});
		FileLoader.getFile('./res/json/category_translate.json').success(function(data) {
			ctrl.system._.categoryTranslate = data;
		});
	}

	function displayTime(ts) {
		return moment(moment.unix(ts)).format("DD/MM HH:mm");
	}
});