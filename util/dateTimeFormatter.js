exports.formatDateString = function(dateString){
  if(!dateString) return '';

  var date = new Date(dateString);
  var dayOfWeek = exports.getDayOfWeekFromDate(date);
  return dayOfWeek + ' ' + (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
}

exports.formatTimeString = function(timeString) {
  if(!timeString) return '';

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

exports.getDayOfWeekFromDate = function(d){
if(!d) return '';

  var weekday = new Array(7);
  weekday[0]=  "Sunday";
  weekday[1] = "Monday";
  weekday[2] = "Tuesday";
  weekday[3] = "Wednesday";
  weekday[4] = "Thursday";
  weekday[5] = "Friday";
  weekday[6] = "Saturday";

  return weekday[d.getDay()];
}
