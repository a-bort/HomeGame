homeGameApp.controller('ProfileController', function($scope, $http, $location){

    $scope.user = undefined;
    $scope.playerPool = [];
    
    $scope.init = function(user, playerPool){
        $scope.user = user;
        $scope.playerPool = playerPool;
    };
});