homeGameApp.controller('AboutController', function($scope, $http, $location){

    $scope.releases = [
      {title: 'Back-end restructure', date: "February 10, 2017",
        features: ["General rewrite of services used for joining/leaving games", "Fixed the bug with removing placeholder players"]},
      {title: 'Comment tweaks', date: "September 29, 2016",
        features: ["On a game page, the default number of comments shown limited to 8, with an option of showing all"
        , "Comment notification emails have the same subject per game, so they stack in your inbox"]},
      {title: 'Seating update', date: "September 14, 2016",
        features: ["Viewing a game adds it to your list of games",
                   "Users no longer have to join a game to view/add comments",
                   "Notifications for comments"]}
    ];

    $scope.plannedFeatures = ["Configure games to allow guests to add a +1 (or a +2, +3, etc)", "Automatic day-of notifications",
  "Allow users to create/edit the entire lineup manually"];

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
