homeGameApp.controller('MyGamesController', function($scope, $http, $location){

  $scope.ownedGames = [];
  $scope.playerGames = [];
  $scope.waitlistedGames = [];
  
  $scope.initWithGames = function(ownedGames, playerGames, waitlistedGames){
    $scope.ownedGames = ownedGames;
    $scope.playerGames = playerGames;
    $scope.waitlistedGames = waitlistedGames;
  }
  
  $scope.noOwnedGames = function(){
    return $scope.ownedGames.length == 0;
  }
  
  $scope.noPlayerGames = function(){
    return $scope.playerGames.length == 0;
  }
  
  $scope.noWaitlistedGames = function(){
    for(var i = 0; i < $scope.waitlistedGames.length; i++){
      if($scope.waitlistedGames[i].pastGame == $scope.pastGamesVisible){
        return false;
      }
    }
    return true;
  }
  
  $scope.pastGamesVisible = false;
  
  $scope.showPastGames = function(){
    $scope.pastGamesVisible = true;
  }
  
  $scope.hidePastGames = function(){
    $scope.pastGamesVisible = false;
  }
  
  $scope.gameShouldBeShown = function(game){
    return game.pastGame == $scope.pastGamesVisible;
  }
  
  $scope.viewGame = function(game){
    window.location = game.joinGameUrl;
  }
  
  $scope.leaveGame = function(game){
    var c = confirm("Do you want to cancel your reservation?");
    if(c){
      $scope.sendLeaveRequest(game);
    }
  }
  
  $scope.editGame = function(game){
    window.location = game.editGameUrl;
  }
  
  $scope.viewGame = function(game){
    window.location = game.joinGameUrl;
  }
  
  $scope.copyUrl = function(game){
    window.prompt("Copy to clipboard: Ctrl+C, Enter", util.urlBase() + game.joinGameUrl + '?autoJoin=true');
  }
  
  $scope.joinInfoVisible = false;
  $scope.hostInfoVisible = false;
  
  $scope.showJoinInfo = function(){
    $scope.joinInfoVisible = true;
  };
  
  $scope.showHostInfo = function(){
    $scope.hostInfoVisible = true;
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