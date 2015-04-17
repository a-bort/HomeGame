homeGameApp.controller('JoinGameController', function($scope, $http, $location){

    $scope.activeGame = undefined;
    $scope.userAttending = false;
    $scope.emptySeats = function(){
      return $scope.activeGame && $scope.activeGame.emptySeats > 0;
    };
    $scope.joinButtonText = function(){
      return ($scope.userAttending ? "You are Signed Up" : ($scope.emptySeats() ? "Join!" : "Join Waitlist"));
    };
    $scope.filledSeatFilter = function(seat){
      return seat.user;
    };
    
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
        util.alert($scope.emptySeats() ? 'Game joined successfully' : 'Waitlist Joined Successfully');
        location.reload();
      }).error(function(err){
        util.log(err);
        util.alert('Error saving game');
      });
    };
});