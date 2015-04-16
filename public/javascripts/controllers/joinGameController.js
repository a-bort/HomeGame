homeGameApp.controller('JoinGameController', function($scope, $http, $location){

    $scope.activeGame = undefined;
    $scope.userAttending = false;
    $scope.joinButtonText = function(){
      return $scope.userAttending ? "You are Signed Up" : "Join!";
    }
    $scope.filledSeatFilter = function(seat){
      return seat.user;
    }
    
    $scope.initWithGame = function(game, userAttending){
        $scope.activeGame = game;
        $scope.userAttending = userAttending;
    };
    
    $scope.join = function(valid){
      if(!$scope.activeGame){
        return;
      }
      
      $http.post('/join/', {gameId: $scope.activeGame._id}).success(function(data){
        if(data.error){
          util.log(err);
          util.alert('Error joining game');
          return;
        }
        util.alert('Game joined successfully');
        window.location = '/mygames';
      }).error(function(err){
        util.log(err);
        util.alert('Error saving game');
      });
    }
});