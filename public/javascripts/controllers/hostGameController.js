homeGameApp.controller('HostGameController', function($scope, $http){

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

  $scope.save = function(){
    $http.post('/host/saveGame', $scope.dataModel).success(function(data){
      util.alert('Game created successfully');
    }).error(function(err){
      util.log(err);
      util.alert('Error saving game');
    });
  }
});