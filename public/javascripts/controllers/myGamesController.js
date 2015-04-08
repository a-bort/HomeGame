homeGameApp.controller('MyGamesController', function($scope, $http, $location){

  $scope.initWithGames = function(ownedGames, playerGames){
    util.log(ownedGames);
    util.log(playerGames);
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