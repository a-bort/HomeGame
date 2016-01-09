homeGameApp.controller('PlayerPoolController', function($scope, $http, $location){
  $scope.playerPool = [];

  $scope.init = function(playerPool){
    $scope.playerPool = playerPool || [];
  };

  $scope.parsePlayerName = function(player){
    return (player.user.customName || player.user.name) + ' (' + player.user.email + ')';
  };

  $scope.pendingPlayer = function(player){
    return !player.blocked && !player.confirmed;
  };

  $scope.activePlayer = function(player){
    return player.confirmed && !player.blocked;
  };

  $scope.blockedPlayer = function(player){
    return !player.confirmed && player.blocked;
  };

  $scope.confirmPlayer = function(player){
    $http.post('/playerPool/confirm', {playerId: player._id}).success(function(data){
      if(data.error){
        util.log(data.error);
        util.alert('Error confirming the player');
        return;
      }
      player.confirmed = true;
      player.blocked = false;
    }).error(function(err){
      util.log(err);
      util.alert('Error confirming the player');
    });
  };

  $scope.blockPlayer = function(player){
    $http.post('/playerPool/block', {playerId: player._id}).success(function(data){
      if(data.error){
        util.log(data.error);
        util.alert('Error blocking the player');
        return;
      }
      player.confirmed = false;
      player.blocked = true;
    }).error(function(err){
      util.log(err);
      util.alert('Error confirming the player');
    });
  };

});
