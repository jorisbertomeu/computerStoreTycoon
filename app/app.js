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
  'CST.version',
  /* External module */
  'ui-notification'
]).
config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider.otherwise({redirectTo: '/dashboard'});
}]);

CST.controller('mainCtrl', ['$scope', '$rootScope', 'Notification', '$filter', '$http', '$q', function($scope, $rootScope, Notification, $filter, $http, $q) {
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
        fastForward: 50
      }
    }
  }

  ctrl.system = {
    queue: [],
    stock: [],
    bank: {
      solde: 10000
    },
    _: {
      dialoging: {
        status: false,
        people: null,
        answers: [],
        response: [],
        finished: false,
        text: null,
        nextStep: nextStep,
        dialog: null,
        step: 0
      },
      currentTask: {
        active: false,
        percentage: 0,
        tso: 0,
        title: null
      },
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
      newClient: newClient,
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

  $rootScope.$on("addToStock", function(event, data) {
      if (data.value === 0) {
        return;
      }
      if (ctrl.system.bank.solde - data.value > 0) {
        Notification.success({message: 'Vous avez dépensé ' + $filter('currency')(data.value, '€') + " pour '" + data.libelle + "'", delay: null});
        ctrl.system.bank.solde -= data.value;
        addEventToQueue(data.delay, (data.type === 0) ? receptionFournisseur : receptionAmazonne, {obj: data.obj, quantity: data.quantity, price: data.value});
      } else {
        Notification.error({message: 'Votre solde est insuffisant pour dépenser ' + $filter('currency')(data.value, '€') + " pour '" + data.libelle + "'", delay: null});
      }
    });

  $rootScope.$on("getStock", function(event, data) {
    $rootScope.$emit("stock", ctrl.system.stock);
  });

  function receptionFournisseurDone(data) {
    ctrl.system._.currentTask.active = false;
    Notification.success({message: "Vous avez récupéré le colis contenant '" + data.obj.fields[0] + "', il a été placé dans le stock", delay: null});
  }

  function newClientDone(data) {
    console.log('Fin de la discussion');
  }

  function newDialog(cbFinished, mayCancel, cbCancel) {
    return {
      _: {
        currentStep: 0
      },
      people: {
        name: 'John Doe',
        email: 'john.doe@gmail.com',
        tel: '+33658457584',
        photo: 'http://alliancecom.ro/components/com_k2/images/placeholder/user.png'
      },
      steps: [],
      cancel: mayCancel,
      cbCancel: cbCancel,
      cbFinished: cbFinished
    };
  }

  function addStepToDialog(dialog, stepsFromClient, stepsFromMe) {
    dialog.steps.push({client: stepsFromClient, me: stepsFromMe});
    return dialog;
  }

  function nextStep(idx) {
    var dialog = ctrl.system._.dialoging.dialog;
    var clientResponse = null;
    var reponses = [];
    var bse = null;
    var dse = null;

    ctrl.system._.dialoging.step += 1;
    ctrl.system._.dialoging.response = [];

    if (ctrl.system._.dialoging.step === dialog.steps.length) {
      ctrl.system._.dialoging.status = false;
      dialog.cbFinished(ctrl.system._.dialoging.answers);
      return;
    }
    ctrl.system._.dialoging.answers.push(idx);
    for (var i = 0; i < ctrl.system._.dialoging.answers.length; i++) {
      if (i === 0) {
        bse = dialog.steps[ctrl.system._.dialoging.step].client[ctrl.system._.dialoging.answers[i]];
        dse = dialog.steps[ctrl.system._.dialoging.step].me[ctrl.system._.dialoging.answers[i]];
      } else {
        if (bse) {
          bse = bse[ctrl.system._.dialoging.answers[i]];
        }
        if (dse) {
          dse = dse[ctrl.system._.dialoging.answers[i]];
        }
      }
    }
    ctrl.system._.dialoging.text = bse;
    if (dse) {
      for (var i = 0; i < dse.length; i++) {
          ctrl.system._.dialoging.response.push({libelle: dse[i], idx: i});
      }
    } else if (!bse) { /* Discussion terminée ! */
      ctrl.system._.dialoging.status = false;
      dialog.cbFinished();
    } else {
      ctrl.system._.dialoging.finished = true;
    }
  }

  function launchDialog(dialog) {
    ctrl.system._.dialoging.status = true;
    ctrl.system._.dialoging.people = dialog.people;
    ctrl.system._.dialoging.finished = false;
    ctrl.system._.dialoging.answers = [];

    ctrl.system._.dialoging.text = dialog.steps[0].client[0];
    ctrl.system._.dialoging.step = 0;
    ctrl.system._.dialoging.dialog = dialog;
    for (var i = 0; i < dialog.steps[0].me.length; i++) {
        ctrl.system._.dialoging.response.push({libelle: dialog.steps[0].me[i], idx: i, cb: dialog.steps[0].cb});
    }
  }

  function setRandomPeopleToDialog(dialog) {
    var defered = $q.defer();

    $http.get('https://api.randomuser.me/', null).then(function(res) {
      res = res.data;
      dialog.people = {
        name: res.results[0].name.first + ' ' + res.results[0].name.last,
        email: res.results[0].email,
        tel: res.results[0].cell,
        photo: res.results[0].picture.large
      };
      defered.resolve(dialog);
    });
    return defered.promise;
  }

  function newClient() {
    var dialog = newDialog(function(data) {
      console.log('Le dialog est finished !');
      console.log(data);
    }, false, function() {
      console.log('Il a kill la new client !');
    });

    setRandomPeopleToDialog(dialog).then(function(dialog) {
      dialog = addStepToDialog(dialog, ["Bonjour, je souhaiterai un ordinateur puissant pour jouer aux derniers jeux en ultra ..."],
                                ['Bonjour, oui, tout à fait, quel serait votre budget ?', "Désolé, je n'ai pas le temps en ce moment .. Essayez de repasser ?"]);
      dialog = addStepToDialog(dialog, ["Et bien écoutez, je peux mettre entre €800 et €900 dans mon ordinateur s'il correspond à ce que je veux.", "Ah .. Très bien, je repasserai"],
                                [
                                  ['Et bien super, revennez dans 4 jours pour le récupérer !', 'Ah mince, ça fera pas assez .. Ne pouvez-vous pas mettre plus ?'], 
                                  ["Merci, bonne journée !", "Vraiment désolé, essayez de repasser demain, je m'occuperai de vous !"]
                                ]);
      dialog = addStepToDialog(dialog, [
                                  ["Fantastique ! A dans 4 jours !", "Ah, non je ne peux pas, je vais aller voir ailleurs alors, au revoir !"], 
                                  ["Bonne journée à vous aussi !", "Oui, on verra si j'ai le temps !"]],
                                [
                                  [["D'accord 1", "D'accord 2"], ["D'accord 3", "D'accord 4"]],
                                  [["D'accord 5", "D'accord 6"], ["D'accord 7", "D'accord 8"]]
                                ]);
       dialog = addStepToDialog(dialog, [
                                  ["Fantastique ! A dans 4 jours !", "Ah, non je ne peux pas, je vais aller voir ailleurs alors, au revoir !"], 
                                  ["Bonne journée à vous aussi !", "Oui, on verra si j'ai le temps !"]],
                                []);
      launchDialog(dialog);
    });
  }

  function newInProgressTask(title, cb, data) {
    ctrl.system._.currentTask.title = title;
    ctrl.system._.currentTask.active = true;
    ctrl.system._.currentTask.tso = ctrl.system._.timer.timestamp;
    ctrl.system._.currentTask.percentage = 0;
    ctrl.system._.currentTask.cb = cb;
    ctrl.system._.currentTask.cbData = data;
    playPressed();
  }

  function addEventToQueueWithInProgressTask(delay, cb, data) {
    newInProgressTask(taskTitle, null);
    addEventToQueue(delay, cb, data, true);
  }

  function receptionFournisseur(data) {
    addEventToQueueWithInProgressTask("Réception d'un colis du fournisseur ...", 0.17, receptionFournisseurDone, data);
    Notification.primary({message: "Le fournisseur vient d'arriver, vous allez réceptionner le colis", delay: null});
  }

  function receptionAmazonne(data) {
    Notification.success({message: 'Vous vennez de recevoir un colis de Amazonne ! Il contient ' + data.quantity + ' "' + data.obj.fields[0] + '". Le contenu a été ajouté à votre stock !', delay: null});
    console.log(data);
  }

  function addEventToQueue(delay, callback, data, ip) {
    ctrl.system.queue.push({when: ctrl.system._.timer.timestamp + 3600 * delay, cb: callback, data: data, inProgress: (ip) ? ip : false});
  }

  function start() {
    console.log('On démarre !');
    /* Init Weather */
    ctrl.system._.weather = ctrl.system._.weatherReference.day[0];
    ctrl.system._.timer.startTime = ctrl.system._.timer.timestamp;
  }

  function executeQueue(ts) {
    for (var i = 0; i < ctrl.system.queue.length; i++) {
      if (ts >= ctrl.system.queue[i].when || ctrl.system.queue[i].inProgress) { // task to execute
        if (ctrl.system.queue[i].inProgress && ts < ctrl.system.queue[i].when) {
          ctrl.system._.currentTask.percentage = Math.round(((ctrl.system.queue[i].when - ctrl.system._.currentTask.tso) - (ctrl.system.queue[i].when - ts)) * 100 / (ctrl.system.queue[i].when - ctrl.system._.currentTask.tso));
        } else {
          ctrl.system.queue[i].cb(ctrl.system.queue[i].data);
          if (ctrl.system.queue[i].inProgress) {
            ctrl.system._.currentTask.percentage = 100;
            ctrl.system._.currentTask.active = false;
            if (ctrl.system._.currentTask.cb) {
              ctrl.system._.currentTask.cb(ctrl.system._.currentTask.cbData);
            }
          }
          ctrl.system.queue.splice(i, 1);
        }
        continue;
      }
    }
  }

  function tickFunction() {
    console.log('Tick');
    ctrl.system._.timer.timestamp += 60;

    ctrl.system._.routines.checkNewDay();
    executeQueue(ctrl.system._.timer.timestamp);
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
