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

});
