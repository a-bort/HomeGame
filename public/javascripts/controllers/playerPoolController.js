homeGameApp.controller('PlayerPoolController', function($scope, $http, $location){
  $scope.playerPool = [];
  
  $scope.init = function(playerPool){
    $scope.playerPool = playerPool || [];
  }
});