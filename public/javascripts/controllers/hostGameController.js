homeGameApp.controller('HostGameController', function($scope, $http, $location){

  $scope.dataModel = {
    game: '',
    location: '',
    stakes: '',
    seats: '',
    gameFormat: '',
    date: '',
    time: '',
    notes: '',
  };

  $scope.save = function(valid){
    if(!valid){
      util.alert('Please complete form');
      return;
    }
    
    $http.post('/host/saveGame', $scope.dataModel).success(function(data){
      util.alert('Game created successfully');
      window.location = '/profile';
    }).error(function(err){
      util.log(err);
      util.alert('Error saving game');
    });
  }
});