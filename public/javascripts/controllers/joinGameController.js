homeGameApp.controller('JoinGameController', function($scope, $http, $location){

    $scope.activeGame = undefined;
    $scope.initWithGame = function(game){
        $scope.activeGame = game;
    };
    
});