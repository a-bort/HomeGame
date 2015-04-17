homeGameApp.controller('MyGamesController', function($scope, $http, $location){

  $scope.ownedGames = [];
  $scope.playerGames = [];
  $scope.waitlistedGames = [];
  
  $scope.initWithGames = function(ownedGames, playerGames, waitlistedGames){
    $scope.ownedGames = ownedGames;
    $scope.playerGames = playerGames;
    $scope.waitlistedGames = waitlistedGames;
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
      location.reload();
    }).error(function(err){
      util.log(err);
      util.alert('Error leaving the game');
    });
  }

});