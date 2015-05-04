homeGameApp.controller('ProfileController', function($scope, $http, $location){

    $scope.user = undefined;
    $scope.backupUser = undefined;
    $scope.playerPool = [];
    
    $scope.editing = false;
    
    $scope.edit = function(){
      $scope.editing = true;
    }
    
    $scope.cancel = function(){
      util.mapSourceToTarget($scope.backupUser, $scope.user);
      $scope.editing = false;
    }
    
    $scope.init = function(user, playerPool){
        user.customName = user.customName || user.name;
    
        $scope.user = user;
        $scope.backupUser = util.deepCopy(user);
        $scope.playerPool = playerPool;
    };
});