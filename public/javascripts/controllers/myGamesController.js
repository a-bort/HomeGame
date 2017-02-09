homeGameApp.controller('MyGamesController', function($scope, $http, $location){

  $scope.ownedGames = [];
  $scope.playerGames = [];
  $scope.waitlistedGames = [];
  $scope.user = "";

  $scope.initWithGames = function(ownedGames, playerGames, waitlistedGames, user){
    $scope.ownedGames = ownedGames;
    $scope.playerGames = playerGames;
    $scope.waitlistedGames = waitlistedGames;
    $scope.user = user;
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

  $scope.orderByForMyGames = function(){
    return $scope.pastGamesVisible ? '-date' : 'date';
  }

  $scope.noOwnedGamesShowing = function(){
    for(var i = 0; i < $scope.ownedGames.length; i++){
      if($scope.ownedGameShouldBeShown($scope.ownedGames[i])){
        return false;
      }
    }
    return true;
  }

  $scope.noPlayerGamesShowing = function(){
    for(var i = 0; i < $scope.playerGames.length; i++){
      if($scope.gameShouldBeShown($scope.playerGames[i])){
        return false;
      }
    }
    return true;
  }

  $scope.computedGameDescriptionHtml = function(game){
    var delim = "&nbsp;<b>&sect</b>&nbsp";
    var text = game.filledSeats + " of " + game.seats + " Seats Filled" + delim;
    if(game.emptySeats == 0 && !game.pastGame){
      text += "Waitlist Available! (" + (game.waitListCollection ? game.waitListCollection.length : "0") + " waiting)";
    } else{
      text += game.emptySeats + " Seats Left";
    }
    if(game.notes){
      text += delim;
      text += game.notes;
    }
    return text;
  }

  $scope.pastOwnedGamesVisible = false;

  $scope.showPastOwnedGames = function(){
    $scope.pastOwnedGamesVisible = true;
  }

  $scope.hidePastOwnedGames = function(){
    $scope.pastOwnedGamesVisible = false;
  }

  $scope.ownedGameShouldBeShown = function(game){
    return game.pastGame == $scope.pastOwnedGamesVisible;
  }

  $scope.userIsViewer = function(game){
    for(var i = 0; i < game.viewerCollection.length; i++){
      var viewer = game.viewerCollection[i];
      if(viewer.user == $scope.user._id){
        return true;
      }
    }
    return false;
  }

  $scope.findSeatIdInGame = function(game){
    var seatId;
    for(var i = 0; i < game.seatCollection.length; i++){
      var seat = game.seatCollection[i];
      if(seat.user && seat.user == $scope.user._id){
        return seat._id;
      }
    }
    for(var i = 0; i < game.waitListCollection.length; i++){
      var seat = game.waitListCollection[i];
      if(seat.user && seat.user == $scope.user._id){
        return seat._id;
      }
    }
    return null;
  }

  $scope.viewGame = function(game){
    window.location = game.joinGameUrl;
  }

  $scope.leaveGame = function(game){
    var c = confirm("Do you want to cancel your reservation?");
    if(c){
      var seatId = $scope.findSeatIdInGame(game);
      if(!seatId){
        util.alert("Error leaving the game - looks like you aren't seated?");
        return;
      }
      $scope.sendLeaveRequest(game, seatId);
    }
  }

  $scope.joinGame = function(game){
    $http.post('/join', {gameId: game._id}).success(function(data){
      if(data.error){
        util.log(data.error);
        util.alert('Error joining the game');
        return;
      }
      location.reload();
    }).error(function(err){
      util.log(err);
      util.alert('Error joining the game');
    });
  }

  $scope.editGame = function(game){
    window.location = game.editGameUrl;
  }

  $scope.viewGame = function(game){
    window.location = game.joinGameUrl;
  }

  $scope.copyViewGameUrl = function(game){
    window.prompt("Copy to clipboard: Ctrl+C, Enter", util.urlBase() + game.joinGameUrl);
  }

  $scope.copyJoinGameUrl = function(game){
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

  $scope.sendLeaveRequest = function(game, seatId){
    $http.post('/mygames/leave', {gameId: game._id, seatId: seatId}).success(function(data){
      if(data.error){
        util.log(data.error);
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
