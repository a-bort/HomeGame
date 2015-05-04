homeGameApp.controller('ProfileController', function($scope, $http, $location){

    $scope.user = undefined;
    $scope.backupUser = undefined;
    $scope.playerPool = [];
    
    $scope.editing = false;
    
    $scope.init = function(user, playerPool){
        user.customName = user.customName || user.name;
    
        $scope.user = user;
        $scope.setBackupUser(user);
        $scope.playerPool = playerPool;
    };
    
    $scope.setBackupUser = function(user){
      $scope.backupUser = util.deepCopy(user);
    }
    
    $scope.edit = function(){
      $scope.editing = true;
    }
    
    $scope.cancel = function(){
      util.mapSourceToTarget($scope.backupUser, $scope.user);
      $scope.editing = false;
    }
    
    $scope.save = function(){
      if(!$scope.user.customName || !$scope.user.email){
        util.alert('Please fill out all fields');
        return;
      }
      
      $http.post('/profile', {userModel: $scope.user}).success(function(data){
        if(data.error){
          util.log(err);
          util.alert('Error updating profile');
          return;
        }
        util.alert('Profile updated successfully');
        $scope.setBackupUser($scope.user);
        $scope.editing = false;
      }).error(function(err){
        util.log(err);
        util.alert('Error updating profile');
      });
    }
});