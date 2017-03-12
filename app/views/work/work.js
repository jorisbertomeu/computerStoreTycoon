'use strict';

angular.module('CST.work', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/work', {
    templateUrl: 'views/work/work.html',
    controller: 'workCtrl'
  });
}])

.controller('workCtrl', function($scope, $rootScope, FileLoader, Notification) {
	var ctrl = $scope;

	ctrl.system = {
		stock: [],
		_: {
			categoryTranslate : [],
			receiveWork: null,
			receiveStock: null,
			displayTime: displayTime,
			buildComputer: buildComputer,
			setTabActive: setTabActive,
			dropSuccessHandler: dropSuccessHandler,
			onDrop: onDrop,
			getPrice: getPrice,
			translateCategory: translateCategory
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
			active: false,
			workplan: {
				objs: []
			}
		}
	}

	start();

	function buildComputer(work) {
		ctrl.system.building.active = true;
		ctrl.system.building.work = work;
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
		return moment(moment.unix(ts)).format("DD/MM hh:mm");
	}
});