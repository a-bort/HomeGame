homeGameApp.controller('AboutController', function($scope, $http, $location){

    $scope.releases = [
      {title: 'Seating update', date: "September 14, 2016",
        features: ["Viewing a game adds it to your list of games",
                   "Users no longer have to join a game to view/add comments",
                   "Notifications for comments"]}
    ];

    $scope.plannedFeatures = ["Configure games to allow guests to add a +1 (or a +2, +3, etc)", "Automatic day-of notifications"];

    $scope.issues = ["Please report issues in the Feedback section"];

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
