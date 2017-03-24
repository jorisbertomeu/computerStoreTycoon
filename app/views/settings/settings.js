'use strict';

angular.module('CST.settings', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/settings', {
    templateUrl: 'views/settings/settings.html',
    controller: 'settingsCtrl'
  });
}])

.controller('settingsCtrl', function($scope, $rootScope, $timeout) {
	var ctrl = $scope;

	ctrl.system = {
		_: {
			audioReceived: null,
			setMoney: setMoney,
			playPauseAudio: playPauseAudio,
			changeVolumeMusic: changeVolumeMusic
		},
		params: {
			audio: {
				play: false,
				volume: 0.5,
				volumeTmp: 50
			},
			money: null
		}
	};

	start();

	function start() {
		ctrl.system._.audioReceived = $rootScope.$on("audio", function(event, data) {
			console.log(data);
			$timeout(function() {
				ctrl.system.params.audio.play = data.play;
				ctrl.system.params.audio.volume = data.volume;
			});
		});
		ctrl.$on("$destroy", ctrl.system._.audioReceived);
		$rootScope.$emit("getAudio", {});
	}

	function setMoney() {
		console.log('Setting money to ' + ctrl.system.params.money);
		$rootScope.$emit("setMoney", ctrl.system.params.money);
	}

	function playPauseAudio() {
		if (ctrl.system.params.audio.play)
			$rootScope.$emit("audioCommand", {command: 0});
		else
			$rootScope.$emit("audioCommand", {command: 1});
		$rootScope.$emit("getAudio", {});
	}

	function changeVolumeMusic() {
		$rootScope.$emit("audioCommand", {command: 2, value: parseFloat(ctrl.system.params.audio.volumeTmp / 100, 10)});
		$rootScope.$emit("getAudio", {});
	}
});