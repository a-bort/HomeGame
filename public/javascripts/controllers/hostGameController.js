homeGameApp.controller('HostGameController', function($scope, $http, $location){

  $scope.dataModel = {
    _id: '',
    gameType: '',
    location: '',
    stakes: '',
    seats: '',
    gameFormat: '',
    date: '',
    time: '',
    notes: '',
    seatHost: true,
    emailNotifications: true,
    commentNotifications: false,
    allowedGuests: ''
  };

  $scope.emailEnabled = false;
  $scope.guestsAllowed = false;
  $scope.guestInput = null;
  $scope.subject = "";
  $scope.html = "";

  var defaultSubject = 'Poker Game - %date% at %time%';
  var defaultHtml = '<p>I\'ll be hosting a poker game on <b>%date%</b> at <b>%time%</b>. %notes%&nbsp;There are only %seats% seats available, so sign up now!</p><p><br></p><p><a name="join-link" href="https://homegame.a-bort.com/join/" target="">Click this link</a> to join immediately*&nbsp;</p><p><span><a name="page-link" href="http://homegame.a-bort.com/join/" target="">Click this link</a> to view the game page.</span><br></p><p><span><br></span></p><p><span style="font-size: 10px">*If this is your first time signing up with Home Game, you will be prompted to login with your Facebook account, and authorize the application to access your public info. Don\'t worry, we do not capture or store any of your Facebook login information, just your name and email address.&nbsp;</span></p>';

  $scope.$watch('emailEnabled', function(newVal){
    if(newVal){
      $scope.populate();
    }
  });

  $scope.populate = function(){
      $scope.generateHtml();
      $scope.generateSubject();
  };

  $scope.generateHtml = function(){
    $scope.html = replaceDefaultCharacters(defaultHtml);
  };

  $scope.generateSubject = function(){
    $scope.subject = replaceDefaultCharacters(defaultSubject);
  };

  var replaceDefaultCharacters = function(text){
    for(var key in $scope.dataModel){
      var val = $scope.dataModel[key];
      if(key == "date" && val){
        val = util.formatDateString(val);
      } else if(key == "time" && val){
        val = util.formatTimeString(val);
      }
      text = text.replace("%" + key + "%", val || "[" + key.toUpperCase() + "]");
    }
    return text;
  };

  $scope.gameIsNew = function(){
    return !$scope.dataModel._id;
  }

  $scope.initWithGame = function(game){
    if(game){
      game.date = game.date ? new Date(game.date) : new Date();
      game.time = game.time ? new Date(game.time) : new Date();

      if(game.allowedGuests !== 0){
        $scope.guestsAllowed = true;
        if(game.allowedGuests > 0){
          $scope.guestInput = game.allowedGuests;
        }
      }

      util.mapSourceToTarget(game, $scope.dataModel);
    }
    $scope.afterInit();
  }

  $scope.afterInit = function(){

    $scope.$watch('guestsAllowed', function(newVal){
      if(!newVal){
        $scope.guestInput = 0;
      }
    });

    $scope.$watch('guestInput', function(newVal){
      if(newVal !== 0 && !newVal){
        $scope.dataModel.allowedGuests = -1;
      } else{
        $scope.dataModel.allowedGuests = newVal;
      }
    });

  }

  $scope.save = function(valid){
    if(!valid){
      util.alert('Please complete form');
      return;
    }

    var extraOptions = {
      subject: $scope.subject,
      html: $scope.html
    };

    $http.post('/host/saveGame', {dataModel: $scope.dataModel, extraOptions: extraOptions}).success(function(data){
      if(data.error){
        util.log(err);
        util.alert('Error saving game');
        return;
      }
      util.alert('Game saved successfully');
      window.location = '/mygames';
    }).error(function(err){
      util.log(err);
      util.alert('Error saving game');
    });
  }
});
