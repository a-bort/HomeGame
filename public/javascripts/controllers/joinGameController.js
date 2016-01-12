homeGameApp.controller('JoinGameController', function($scope, $http, $location){

    $scope.activeGame = undefined;
    $scope.userAttending = false;
    $scope.currentUserId = "";
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

    $scope.initWithGame = function(game, userAttending, autoJoin, currentUserId){
        $scope.activeGame = game;
        $scope.userAttending = !!userAttending;
        $scope.currentUserId = currentUserId;

        if(autoJoin && !userAttending){
          $scope.userAttending = true;
          $scope.join();
        }
    };

    $scope.join = function(){
      if(!$scope.activeGame){
        return;
      }

      $http.post('/join/', {gameId: $scope.activeGame._id}).success(function(data){
        if(data.error){
          util.log(err);
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
});
