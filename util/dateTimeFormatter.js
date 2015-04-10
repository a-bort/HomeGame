exports.formatDateString = function(dateString){
  return new Date(dateString).toLocaleDateString('en-us')
}

exports.formatTimeString = function(timeString) {
  var time = new Date(timeString);
  var hours = time.getHours();
  var minutes = time.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}