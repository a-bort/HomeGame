function util(){
    var util = this;
    
    var suppressLog = false;
    
    util.log = function(msg){
        if(suppressLog) return;
        console.log(msg);
    };
    
    util.logError = function(msg){
        if(suppressLog) return;
        util.log(msg);
    }
    
    util.alert = function(msg){
        alert(msg);
    }
    
    util.sc = function(controller){
        return angular.element("[ng-controller='" + controller + "Controller']").scope();
    }
    
    util.urlBase = function(){
      return window.location.host;
    }
    
    util.mapSourceToTarget = function(source, target){
      for(var key in source){
        if(target.hasOwnProperty(key)){
          target[key] = source[key];
        }
      }
    }
    
    util.deepCopy = function(obj){
      return $.extend(true, {}, obj);
    }
}
var util = new util();