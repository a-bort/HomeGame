homeGameApp.controller('SharedController', function($scope, $http, $location){
  $scope.sharedModel = {
    email: "",
    showEmailPrompt: false
  };
  
  $scope.init = function(model){
    $scope.sharedModel = model || $scope.sharedModel;
    
    $scope.onPageReady();
  }
  
  $scope.emailValid = function(){
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test($scope.sharedModel.email);
  }
  
  //Called on load of every page
  $scope.onPageReady = function(){
    
  }
  
  $scope.updateEmail = function(){
    $scope.sendUpdateRequest({
      email: $scope.sharedModel.email
    });
  }
  
  $scope.cancelEmailUpdate = function(){
    $scope.sendUpdateRequest();
  }
  
  $scope.sendUpdateRequest = function(data){
    if(!$scope.emailValid()){
      util.alert("The email address you entered is invalid.");
      return;
    }
    
    $http.post('/updateEmail', data || {}).success(function(resData){
      if(resData.error){
        util.log(resData.error);
        util.alert('Error updating email');
        return;
      }
      if(data){
        util.alert('Email updated successfully');
      }
      $scope.sharedModel.showEmailPrompt = false;
    }).error(function(err){
      util.log(err);
      util.alert('Error updating profile');
    });
  }
});