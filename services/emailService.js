var emailSender = require('./emailSender');
var seatRepository = require('../data/seatRepository');

exports.emailAfterJoin = function(game, joinedPlayerId){
  seatRepository.iterateOverAllSeats(game, function(seat){
    if(!seat.user) return;
    seatUser = (seat.user._id || seat.user);
    if(seat.notifyOnJoin && !seatUser.equals(joinedPlayerId)){
      emailSender.notifyOnJoin(game, seatUser, joinedPlayerId);
    }
  });
}

exports.emailAfterLeave = function(game, leftPlayerId, waitlistPlayerId){
  seatRepository.iterateOverAllSeats(game, function(seat){
    if(!seat.user) return;
    seatUser = (seat.user._id || seat.user);
    if(seatUser.equals(waitlistPlayerId)){
      emailSender.notifyMovedOffWaitlist(game, seatUser);
    }
    else if(seat.notifyOnJoin && !seatUser.equals(leftPlayerId)){
      emailSender.notifyOnCancel(game, seatUser, leftPlayerId, waitlistPlayerId);
    }
  });
}

exports.emailAfterKick = function(game, kickerPlayerId, waitlistPlayerId){
  seatRepository.iterateOverAllSeats(game, function(seat){
    if(!seat.user) return;
    seatUser = (seat.user._id || seat.user);
    if(seatUser.equals(waitlistPlayerId)){
      emailSender.notifyMovedOffWaitlist(game, seatUser);
    }
  });
}

exports.emailAfterLineupChange = function(game){
  seatRepository.iterateOverAllSeats(game, function(seat){
    if(!seat.user) return;
    seatUser = (seat.user._id || seat.user);
    if(!seatUser.equals(game.owner._id || game.owner)){
      emailSender.notifyOnLineupChange(game, seatUser);
    }
  });
}
