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
}
var util = new util();