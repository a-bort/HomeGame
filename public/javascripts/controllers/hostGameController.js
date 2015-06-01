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
    notes: ''
  };
  
  $scope.seatHost = true;
  $scope.emailEnabled = false;
  $scope.subject = "";
  $scope.html = "";
  
  $scope.gameIsNew = function(){
    return !$scope.dataModel._id;
  }

  $scope.initWithGame = function(game){
    if(game){
      game.date = new Date(game.date);
      game.time = new Date(game.time);
    
      util.mapSourceToTarget(game, $scope.dataModel);
    }
  }
  
  $scope.save = function(valid){
    if(!valid){
      util.alert('Please complete form');
      return;
    }
    
    var extraOptions = {
      seatHost: $scope.seatHost,
      emailEnabled: $scope.emailEnabled,
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