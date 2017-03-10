'use strict';

angular.module('CST.work', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/work', {
    templateUrl: 'views/work/work.html',
    controller: 'workCtrl'
  });
}])

.controller('workCtrl', function($scope, $rootScope) {
	var ctrl = $scope;

	ctrl.system = {
		stock: [],
		_: {
			receiveWork: null,
			receiveStock: null,
			displayTime: displayTime,
			buildComputer: buildComputer,
			setTabActive: setTabActive
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
			active: false
		}
	}

	start();

	function buildComputer(work) {
		ctrl.system.building.active = true;
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
	        quantity: data.quantity
	      });
	    }
	    
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
	}

	function displayTime(ts) {
		return moment(moment.unix(ts)).format("DD/MM hh:mm");
	}
});