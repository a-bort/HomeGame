String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

homeGameApp.controller('JoinGameController', function($scope, $http, $location){

    $scope.activeGame = undefined;
    $scope.userAttending = false;
    $scope.currentUser = {};
    $scope.currentUserSeat = {};
    $scope.currentUserIsOwner = false;
    $scope.commentText = "";
    $scope.tempPlayerText = "";

    $scope.editing = false;

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

    $scope.initWithGame = function(game, userAttending, userViewing, autoJoin, currentUser){
        $scope.activeGame = game;
        $scope.userAttending = !!userAttending;
        $scope.currentUser = currentUser;
        $scope.currentUserIsOwner = (currentUser._id == game.owner._id);
        $scope.currentUserSeat = findCurrentUserSeat();

        $scope.$watch('currentUserSeat.notifyOnJoin', function(newValue, oldValue){
          if((newValue === true || newValue === false) && newValue != oldValue){ //undefined initially
            notify('notifyOnJoin', newValue);
          }
        });

        $scope.$watch('currentUserSeat.notifyOnThreshold', function(newValue, oldValue){
          if((newValue === true || newValue === false) && newValue != oldValue){ //undefined initially
            notify('notifyOnThreshold', newValue);
          }
        });

        $scope.$watch('currentUserSeat.notifyOnComment', function(newValue, oldValue){
          if((newValue === true || newValue === newValue) && newValue != oldValue){ //undefined initially
            notify('notifyOnComment', newValue);
          }
        });

        if(autoJoin && !userAttending && !game.pastGame){
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

      for(var i = 0; i < $scope.activeGame.waitListCollection.length; i++){
        var seat = $scope.activeGame.waitListCollection[i];
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

    var commentLimit = 8;

    $scope.allCommentsVisible = false;
    $scope.showAllComments = function(){
      $scope.allCommentsVisible = true;
    }

    $scope.moreCommentsToShow = function(){
      if(!$scope.activeGame){
        return false;
      }

      return !$scope.allCommentsVisible && $scope.activeGame.comments.length > commentLimit;
    }

    $scope.visibleComments = function(){
      if(!$scope.activeGame){
        return [];
      }
      if($scope.allCommentsVisible || !$scope.moreCommentsToShow()){
        return $scope.activeGame.comments;
      }
      var len = $scope.activeGame.comments.length;
      return $scope.activeGame.comments.slice(len - commentLimit, len);
    };

    $scope.gameName = function(){
      var ag = $scope.activeGame;
      return ag.owner.displayName + "'s " + ag.stakes + ", " + ag.gameType + " " + ag.gameFormat;
    }

    $scope.googleCalUrl = function(){
      if(!$scope.activeGame){ return "";}

      var base = "http://www.google.com/calendar/event?action=TEMPLATE";
      base += ("&text=" + encodeURIComponent($scope.gameName()));
      base += ("&dates=" + generateGoogleDateUrlString($scope.activeGame.date, $scope.activeGame.time, 4));
      base += ("&details=" + encodeURIComponent($scope.activeGame.notes));
      base += ("&location=" + encodeURIComponent($scope.activeGame.location));
      return base;
    };

    var generateGoogleDateUrlString = function(startDate, startTime, lengthInHours){
      var date = new Date(startDate);
      var time = new Date(startTime);
      var datetime = new Date(date.getFullYear(), date.getMonth(), date.getDate(),
               time.getHours(), time.getMinutes(), time.getSeconds());

      var str = googleDateFormat(datetime);
      str += "/";

      datetime.setTime(datetime.getTime() + (lengthInHours * 60 * 60 * 1000));
      str += googleDateFormat(datetime);

      return str;
    };

    var googleDateFormat = function(date){
      return date.getFullYear()
      + forceTwoDigits(date.getMonth() + 1)
      + forceTwoDigits(date.getDate())
      + "T"
      + forceTwoDigits(date.getHours())
      + forceTwoDigits(date.getMinutes())
      + forceTwoDigits(date.getSeconds());
    }

    var forceTwoDigits = function(number){
      return number < 10 ? ("0" + number) : ("" + number);
    }

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

    $scope.view = function(){
      if(!$scope.activeGame){
        return;
      }

      $http.post('/join/view', {gameId: $scope.activeGame._id}).success(function(data){
        if(data.error){
          util.log(data.error);
          util.alert('Error tracking game');
          return;
        }
      }).error(function(err){
        util.log(err);
        util.alert('Error tracking game');
      });
    }

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

      $http.post('/mygames/leave/', { gameId: $scope.activeGame._id, seatId: $scope.currentUserSeat._id }).success(function(data){
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
    function findCurrentUserSeat(){
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

      for(var i = 0; i < $scope.activeGame.viewerCollection.length; i++){
        var seat = $scope.activeGame.viewerCollection[i];
        if(seat && seat.user && seat.user._id == $scope.currentUser._id){
          return seat;
        }
      }
      return {};
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

    $scope.rosterModel = {
      selected: null,
      tempPlayerText: "",
      seatCollection: [],
      waitListCollection: [],
      bench: [],
      notify: true,
      emptySeats: function(){
        return $scope.activeGame.seats - this.seatCollection.length;
      },
      waitlistedPlayers: function(){
        return this.waitListCollection.length > 0;
      },
      add: function(name){
        var seatObj = {name: name, user: {}};
        if(this.emptySeats()){
          this.seatCollection.push(seatObj);
        } else{
          this.waitListCollection.push(seatObj);
        }
        this.tempPlayerText = "";
      },
      valid: function(){
        return (this.emptySeats() && !this.waitlistedPlayers()) || !this.emptySeats();
      }
    };

    $scope.editLineup = function(){
      var as = $scope.activeGame.seatCollection;
      var ws = $scope.activeGame.waitListCollection;
      var pp = $scope.currentUser.playerPool;

      $scope.rosterModel.seatCollection = [];
      $scope.rosterModel.waitListCollection = [];
      $scope.rosterModel.bench = [];

      $scope.rosterModel.notify = true;

      var ownerSeated = false;

      for(var i = 0; i < as.length; i++){
        if(as[i].user && as[i].user._id == $scope.currentUser._id){ownerSeated = true;}
        $scope.rosterModel.seatCollection.push(util.deepCopy(as[i]));
      }
      for(var i = 0; i < ws.length; i++){
        if(ws[i].user && ws[i].user._id == $scope.currentUser._id){ownerSeated = true;}
        $scope.rosterModel.waitListCollection.push(util.deepCopy(ws[i]));
      }
      if(!ownerSeated){
        $scope.rosterModel.bench.push({user: util.deepCopy($scope.currentUser)});
      }
      for(var i = 0; i < pp.length; i++){
        if($scope.addablePlayer(pp[i])){
          $scope.rosterModel.bench.push(util.deepCopy(pp[i]));
        }
      }
      $("#editLineupModal").modal({backdrop: 'static'});
    }

    $scope.saveNewLineup = function(){
      if(!$scope.rosterModel.valid()){
        util.alert("Current roster is not valid");
        return;
      }
      $http.post('/join/updateLineup', {gameId: $scope.activeGame._id, seatCollection: $scope.rosterModel.seatCollection, waitListCollection: $scope.rosterModel.waitListCollection, notify: $scope.rosterModel.notify})
      .success(function(data){
        if(data.error){
          util.log(data.error);
          util.alert('Error saving lineup');
          return;
        }
        location.reload();
      }).error(function(err){
        util.log(err);
        util.alert('Error saving lineup');
      });
    }

    $scope.commentPosting = false;

    $scope.comment = function(){
      if(!$scope.commentText){
        alert("Comment cannot be empty!");
        return;
      }
      $scope.commentPosting = true;
      $http.post('/join/comment', {gameId: $scope.activeGame._id, comment: $scope.commentText}).success(function(data){
        $scope.commentPosting = false;
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
        $scope.commentPosting = false;
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

    function notify(url, value){
      $http.post('/join/' + url, {gameId: $scope.activeGame._id, notify: value}).success(function(data){
        if(data.error){
          util.log(data.error);
          util.alert('Error setting notification status');
          return;
        }
        util.alert("Notification setting saved");
      }).error(function(err){
        util.log(err);
        util.alert('Error setting notification status');
      });
    }
});
