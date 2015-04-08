homeGameApp.controller('MyGamesController', function($scope, $http, $location){

  $scope.ownedGames = [];
  $scope.playerGames = [];
  
  $scope.initWithGames = function(ownedGames, playerGames){
    $scope.ownedGames = ownedGames;
    $scope.playerGames = playerGames;
  }
  /*$scope.dataModel = {
    game: '',
    location: '',
    stakes: '',
    seats: '',
    gameFormat: '',
    date: '',
    time: '',
    notes: '',
  };*/

});