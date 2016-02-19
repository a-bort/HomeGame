homeGameApp.controller('AboutController', function($scope, $http, $location){

    $scope.features = [
      {title: 'None -- Suggest a new feature in the Feedback section', description: ''}
    ];

    $scope.issues = [
      {title: 'None -- Feel free to report any in the Feedback section', description: ''}
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
