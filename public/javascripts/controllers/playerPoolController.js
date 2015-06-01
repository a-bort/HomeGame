homeGameApp.controller('PlayerPoolController', function($scope, $http, $location){
  $scope.playerPool = [];
  
  $scope.init = function(playerPool){
    $scope.playerPool = playerPool || [];
  }
  
  $scope.parsePlayerName = function(player){
    return player.user.customName || player.user.name;
  }
});