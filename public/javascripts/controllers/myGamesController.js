homeGameApp.controller('MyGamesController', function($scope, $http, $location){

  $scope.ownedGames = [];
  $scope.playerGames = [];
  
  $scope.initWithGames = function(ownedGames, playerGames){
    $scope.ownedGames = ownedGames;
    $scope.playerGames = playerGames;
  }
  
  $scope.copyUrl = function(game){
    window.prompt("Copy to clipboard: Ctrl+C, Enter", util.urlBase() + game.joinGameUrl);
  }

});