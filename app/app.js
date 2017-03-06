'use strict';

// Declare app level module which depends on views, and components
var CST = angular.module('CST', [
  'ngRoute',
  /* VIEWS */
  'CST.dashboard',
  'CST.stock',
  'CST.work',
  'CST.customersTasks',
  'CST.customers',
  'CST.management',
  'CST.myStore',
  'CST.settings',
  /* VIEWS */
  'CST.version'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/dashboard'});
}]);

CST.controller('mainCtrl', ['$scope', function($scope) {
  var ctrl = $scope;

  ctrl.config = {
    weather: {
      dayStart: moment('7:00am', 'h:mma'),
      dayEnd: moment('7:02am', 'h:mma'),
      nightStart: moment('7:00pm', 'h:mma'),
      nightEnd: moment('7:02pm', 'h:mma')
    },
    timer: {
      speeds: {
        play: 1000,
        forward: 500,
        fastForward: 250
      }
    }
  }

  ctrl.system = {
    bank: {
      solde: 42
    },
    _: {
      weatherReference: {
        day: [{ratio: 1, class: 'wi wi-day-sunny'}, {ratio: 2, class: 'wi wi-day-cloudy'}, {ratio: 3, class: 'wi wi-rain'}, {ratio: 4, class: 'wi wi-snow'}],
        night: [{ratio: 10, class: 'wi wi-night-clear'}, {ratio: 11, class: 'wi wi-thunderstorm'}]
      },
      weather: null,
      routines: {
        getPopularity: getPopularity,
        checkNewDay: checkNewDay
      },
      pausePressed: pausePressed,
      playPressed: playPressed,
      forwardPressed: forwardPressed,
      fastForwardPressed: fastForwardPressed,
      timer: {
        startTime: 0,
        timestamp: 1488779400,
        getHour: getHour,
        interval: 1000,
        speed: {
          pause: true,
          play: false,
          forward: false,
          fastForward: false
        }
      }
    }
  };

  start();

  function start() {
    console.log('On démarre !');
    /* Init Weather */
    ctrl.system._.weather = ctrl.system._.weatherReference.day[0];
    ctrl.system._.timer.startTime = ctrl.system._.timer.timestamp;
  }

  function tickFunction() {
    console.log('Tick');
    ctrl.system._.timer.timestamp += 60;

    ctrl.system._.routines.checkNewDay();
    $scope.$evalAsync();
    if (!ctrl.system._.timer.speed.pause) {
      setTimeout(tickFunction, ctrl.system._.timer.interval);
    }
  }

  function getPopularity() {
    return 81;
  }

  function checkNewDay() {
    if (moment(moment.unix(ctrl.system._.timer.timestamp)).isAfter(ctrl.config.weather.dayStart) && moment(moment.unix(ctrl.system._.timer.timestamp)).isBefore(ctrl.config.weather.dayEnd)) { // New Weather for new day
      ctrl.system._.weather = ctrl.system._.weatherReference.day[random(0, ctrl.system._.weatherReference.day.length)];
    } else if (moment(moment.unix(ctrl.system._.timer.timestamp)).isAfter(ctrl.config.weather.nightStart) && moment(moment.unix(ctrl.system._.timer.timestamp)).isBefore(ctrl.config.weather.nightEnd)) { // New Weather for new night
      ctrl.system._.weather = ctrl.system._.weatherReference.night[random(0, ctrl.system._.weatherReference.night.length)];
    }
  }

  function pausePressed() {
    console.log('Pause !');
    ctrl.system._.timer.speed.pause = true;
    ctrl.system._.timer.speed.play = false;
    ctrl.system._.timer.speed.forward = false;
    ctrl.system._.timer.speed.fastForward = false;
  }

  function playPressed() {
    var oldPauseState = ctrl.system._.timer.speed.pause;

    console.log('Play !');
    ctrl.system._.timer.speed.pause = false;
    ctrl.system._.timer.speed.play = true;
    ctrl.system._.timer.speed.forward = false;
    ctrl.system._.timer.speed.fastForward = false;
    ctrl.system._.timer.interval = ctrl.config.timer.speeds.play;
    if (oldPauseState) {
      tickFunction();
    }
  }

  function forwardPressed() {
    var oldPauseState = ctrl.system._.timer.speed.pause;

    console.log('Forward !');
    ctrl.system._.timer.speed.pause = false;
    ctrl.system._.timer.speed.play = false;
    ctrl.system._.timer.speed.forward = true;
    ctrl.system._.timer.speed.fastForward = false;
    ctrl.system._.timer.interval =  ctrl.config.timer.speeds.forward;
    if (oldPauseState) {
      tickFunction();
    }
  }

  function fastForwardPressed() {
    var oldPauseState = ctrl.system._.timer.speed.pause;

    console.log('Fast Forward !');
    ctrl.system._.timer.speed.pause = false;
    ctrl.system._.timer.speed.play = false;
    ctrl.system._.timer.speed.forward = false;
    ctrl.system._.timer.speed.fastForward = true;
    ctrl.system._.timer.interval =  ctrl.config.timer.speeds.fastForward;
    if (oldPauseState) {
      tickFunction();
    }
  }

  function getHour() {
    return moment.unix(ctrl.system._.timer.timestamp).format("HH:mm");
  }

  function random(min, max) {
    return Math.floor(Math.random() * max) + min; 
  }

}]);
