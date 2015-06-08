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

    util.formatDateString = function(dateString){
      var date = new Date(dateString);
      return (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
    }

    util.formatTimeString = function(timeString) {
      var time = new Date(timeString);
      var hours = time.getHours();
      var minutes = time.getMinutes();
      var ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0'+ minutes : minutes;
      var strTime = hours + ':' + minutes + ' ' + ampm;
      return strTime;
    }
}
var util = new util();
