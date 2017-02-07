var userRepo = require('../data/userRepository');

function Email(to, from, subject, html){
  this.to = to;
  this.from = from;
  this.subject = subject;
  this.html = html;
}

exports.buildJoinEmail = function(addedSeat, game, recipientSeat){
  
}
