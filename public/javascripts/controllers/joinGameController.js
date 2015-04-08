homeGameApp.controller('JoinGameController', function($scope, $http, $location){

    $scope.activeGame = undefined;
    $scope.initWithGame = function(game){
        $scope.activeGame = game;
        $scope.activeGame.formattedDate = new Date(game.date).toLocaleDateString('en-us');
        var time = new Date(game.time);
        $scope.activeGame.formattedTime = formatAMPM(time);
        util.log($scope.activeGame);
    };
    
    function formatAMPM(date) {
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0'+minutes : minutes;
      var strTime = hours + ':' + minutes + ' ' + ampm;
      return strTime;
    }
    
});