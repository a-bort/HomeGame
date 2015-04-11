homeGameApp.controller('JoinGameController', function($scope, $http, $location){

    $scope.activeGame = undefined;
    $scope.initWithGame = function(game){
        $scope.activeGame = game;
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
      }).error(function(err){
        util.log(err);
        util.alert('Error saving game');
      });
    }
});