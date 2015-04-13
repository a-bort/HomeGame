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
  
  $scope.leaveGame = function(game){
    var c = confirm("Do you want to cancel your reservation?");
    if(c){
      $scope.sendLeaveRequest(game);
    }
  }
  
  $scope.sendLeaveRequest = function(game){
    $http.post('/mygames/leave', {gameId: game._id}).success(function(data){
      if(data.error){
        util.log(err);
        util.alert('Error leaving the game');
        return;
      }
      $scope.playerGames = data.games;
    }).error(function(err){
      util.log(err);
      util.alert('Error leaving the game');
    });
  }

});