homeGameApp.controller('JoinGameController', function($scope, $http, $location){

    $scope.activeGame = undefined;
    $scope.userAttending = false;
    $scope.currentUser = {};
    $scope.currentUserSeat = {};
    $scope.currentUserIsOwner = false;
    $scope.commentText = "";
    $scope.tempPlayerText = "";

    $scope.emptySeats = function(){
      return $scope.activeGame && $scope.activeGame.emptySeats > 0;
    };
    $scope.joinButtonText = function(){
      return ($scope.userAttending ? "You are Signed Up" : ($scope.emptySeats() ? "Join!" : "Join Waitlist"));
    };
    $scope.filledSeatFilter = function(seat){
      return seat.user || seat.name;
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

        if(userAttending){
          for(var i = 0; i < game.seatCollection.length; i++){
            var seat = game.seatCollection[i];
            if(seat.user && seat.user._id == currentUser._id){
              $scope.currentUserSeat = seat;

              $scope.$watch('currentUserSeat.notifyOnJoin', function(value){
                if(value === true || value === false){ //undefined initially
                  notify(true, value);
                }
              });

              $scope.$watch('currentUserSeat.notifyOnThreshold', function(value){
                if(value === true || value === false){ //undefined initially
                  notify(true, value);
                }
              });
            }
          }
        }

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

      var seat = $scope.findCurrentUserSeat();
      if(!seat){
        alert("Unable to cancel your reservation.");
        return;
      }

      $http.post('/mygames/leave/', { gameId: $scope.activeGame._id, seatId: seat._id }).success(function(data){
        if(data.error){
          util.log(data.error);
          util.alert('Error cancelling reservation');
          return;
        }
        location = '/mygames';
      }).error(function(err){
        util.log(err);
        util.alert('Error cancelling reservation');
      });
    };

    //Bit of a lame hack for the frontend...
    $scope.findCurrentUserSeat = function(){
      if(!$scope.currentUser || !$scope.activeGame) return;

      for(var i = 0; i < $scope.activeGame.seatCollection.length; i++){
        var seat = $scope.activeGame.seatCollection[i];
        if(seat && seat.user && seat.user._id == $scope.currentUser._id){
          return seat;
        }
      }

      for(var i = 0; i < $scope.activeGame.waitListCollection.length; i++){
        var seat = $scope.activeGame.waitListCollection[i];
        if(seat && seat.user && seat.user._id == $scope.currentUser._id){
          return seat;
        }
      }
    }

    $scope.kick = function(seatId){
      var c = confirm("Do you want to kick this player? (Note: you can block them from joining all future games on the Player Pool page)");
      if(c){
        $scope.sendKickRequest(seatId);
      }
    };

    $scope.sendKickRequest = function(seatId){
      if(!$scope.activeGame){
        return;
      }

      $http.post('/mygames/kick', {gameId: $scope.activeGame._id, seatId: seatId}).success(function(data){
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

    $scope.add = function(userId, name){
      if(!$scope.activeGame){
        return;
      }

      $http.post('/join/add', {gameId: $scope.activeGame._id, userId: userId, name: name}).success(function(data){
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

    $scope.comment = function(){
      if(!$scope.commentText){
        alert("Comment cannot be empty!");
        return;
      }

      $http.post('/join/comment', {gameId: $scope.activeGame._id, comment: $scope.commentText}).success(function(data){
        if(data.error){
          util.log(data.error);
          util.alert('Error adding comment');
          return;
        }
        $scope.commentText = "";
        if(data.comments){
          $scope.activeGame.comments = data.comments;
        } else{
          util.alert("Error reloading comments");
        }
      }).error(function(err){
        util.log(err);
        util.alert('Error adding comment');
      });
    }

    $scope.deleteComment = function(commentId){
      var c = confirm("Do you really want to delete this comment?");
      if(!c){
        return;
      }

      $http.post('/join/deleteComment', {gameId: $scope.activeGame._id, commentId: commentId}).success(function(data){
        if(data.error){
          util.log(data.error);
          util.alert('Error deleting comment');
          return;
        }
        if(data.comments){
          $scope.activeGame.comments = data.comments;
        } else{
          util.alert("Error reloading comments");
        }
      }).error(function(err){
        util.log(err);
        util.alert('Error deleting comment');
      });
    }

    function notify(onJoin, notify){
      $http.post('/join/notifyOn' + (onJoin ? 'Join' : 'Threshold'), {gameId: $scope.activeGame._id, seatId: $scope.currentUserSeat._id, notify: notify}).success(function(data){
        if(data.error){
          util.log(data.error);
          util.alert('Error setting notification status');
          return;
        }
      }).error(function(err){
        util.log(err);
        util.alert('Error setting notification status');
      });
    }
});
