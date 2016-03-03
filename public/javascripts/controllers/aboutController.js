homeGameApp.controller('AboutController', function($scope, $http, $location){

    $scope.features = [
      {title: 'Email notifications when game is almost full, for players who haven\'t joined the game', description: ''},
      {title: 'Feel free to suggest a new feature in the Feedback section', description: ''}
    ];

    $scope.issues = [
      {title: 'Occasional game page issues when changing the # of seats in a game', description: ''},
      {title: 'Please report issues in the Feedback section', description: ''}
    ];

    $scope.feedback = "";

    $scope.submit = function(){
      if(!$scope.feedback) return;

      $http.post('/feedback', {feedback: $scope.feedback}).success(function(data){
        if(data.error){
          util.log(err);
          util.alert('Error submitting feedback. Guess there\'s no way to submit that issue... ');
          return;
        }
        $scope.feedback = "";
        $scope.submittedAnimation();
      }).error(function(err){
        util.log(err);
        util.alert('Error submitting feedback. Guess there\'s no way to submit that issue... ');
      });
    }

    $scope.submittedAnimation = function(){
      $("#submit-button").addClass("button-success");
      $("#submit-button").text("Submitted");

      window.setTimeout(function(){
        $("#submit-button").removeClass("button-success");
        $("#submit-button").text("Submit");
      }, 3000);

    }
});
