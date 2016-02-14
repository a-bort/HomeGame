homeGameApp.controller('JoinGameController', function($scope, $http, $location){

    $scope.activeGame = undefined;
    $scope.userAttending = false;
    $scope.currentUser = {};
    $scope.currentUserIsOwner = false;

    $scope.emptySeats = function(){
      return $scope.activeGame && $scope.activeGame.emptySeats > 0;
    };
    $scope.joinButtonText = function(){
      return ($scope.userAttending ? "You are Signed Up" : ($scope.emptySeats() ? "Join!" : "Join Waitlist"));
    };
    $scope.filledSeatFilter = function(seat){
      return seat.user;
    };

    $scope.getImgSrcFromSeat = function(seat){
      if(!seat || !seat.user || !seat.user.id) return "";
      return ;
    }

    $scope.initWithGame = function(game, userAttending, autoJoin, currentUser){
        $scope.activeGame = game;
        $scope.userAttending = !!userAttending;
        $scope.currentUser = currentUser;
        $scope.currentUserIsOwner = (currentUser._id == game.owner._id);
        if(autoJoin && !userAttending){
          $scope.userAttending = true;
          $scope.join();
        }
    };

    $scope.addablePlayer = function(player){
      if(!$scope.currentUserIsOwner || player.blocked) return false;

      //Build hash map of currently signed up players
      for(var i = 0; i < $scope.activeGame.seatCollection.length; i++){
        var seat = $scope.activeGame.seatCollection[i];
        if(seat.user && seat.user._id == player.user._id){
          return false;
        }
      }

      return true;
    };

    $scope.anyAddablePlayers = function(){
      if(!$scope.currentUser) return false;
      for(var i = 0; i < $scope.currentUser.playerPool.length; i++){
        var player = $scope.currentUser.playerPool[i];
        if($scope.addablePlayer(player)){
          return true;
        }
      }
      return false;
    };

    $scope.join = function(){
      if(!$scope.activeGame){
        return;
      }

      $http.post('/join/', {gameId: $scope.activeGame._id}).success(function(data){
        if(data.error){
          util.log(data.error);
          util.alert('Error joining game');
          return;
        }
        util.alert($scope.emptySeats() ? 'Game joined successfully' : 'Waitlist Joined Successfully');
        location.reload();
      }).error(function(err){
        util.log(err);
        util.alert('Error saving game');
      });
    };

    $scope.cancel = function(){
      var c = confirm("Do you want to cancel your reservation?");
      if(c){
        $scope.sendLeaveRequest();
      }
    }

    $scope.sendLeaveRequest = function(){
      if(!$scope.activeGame){
        return;
      }

      $http.post('/mygames/leave/', {gameId: $scope.activeGame._id}).success(function(data){
        if(data.error){
          util.log(err);
          util.alert('Error cancelling reservation');
          return;
        }
        util.alert('Reservation Cancelled');
        location = '/mygames';
      }).error(function(err){
        util.log(err);
        util.alert('Error cancelling reservation');
      });
    };

    $scope.kick = function(userId){
      var c = confirm("Do you want to kick this player? (Note: you can block them from joining all future games on the Player Pool page)");
      if(c){
        $scope.sendKickRequest(userId);
      }
    };

    $scope.sendKickRequest = function(userId){
      if(!$scope.activeGame){
        return;
      }

      $http.post('/mygames/kick', {gameId: $scope.activeGame._id, userId: userId}).success(function(data){
        if(data.error){
          util.log(data.error);
          util.alert('Error kicking player');
          return;
        }
        location.reload();
      }).error(function(err){
        util.log(err);
        util.alert('Error kicking player');
      });
    };

    $scope.add = function(userId){
      if(!$scope.activeGame){
        return;
      }

      $http.post('/join/add', {gameId: $scope.activeGame._id, userId: userId}).success(function(data){
        if(data.error){
          util.log(data.error);
          util.alert('Error adding player to game');
          return;
        }
        util.alert('Player added successfully');
        location.reload();
      }).error(function(err){
        util.log(err);
        util.alert('Error adding player to game');
      });
    }
});
