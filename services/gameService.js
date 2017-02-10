var gameRepo = require('../data/gameRepository');
var userRepo = require('../data/userRepository');
var emailService = require('./emailService');

//!SHOULD BE PLAYER POOL SERVICE!
var playerPoolRepo = require('../data/playerPoolRepository');

var seatModel = require('../models/game').seat;

exports.viewingGame = function(gameId, userId, callback){
  gameRepo.getGameById(gameId, function(err, game){
    if(err || !game){
      callback("Error retrieving game");
      return;
    }
    userRepo.getUserWithPlayerPool(userId, function(err2, fullUser){
      if(err2 || !fullUser){
        callback("Error retrieving user details");
        return;
      }
      if(!game.userIsSeated(userId) && !game.userIsViewer(userId)){
        game.addViewer(userId);
        gameRepo.cleanSave(game, function(err, gameId){
          callback(err, game, fullUser);
        });
      } else{
        callback(null, game, fullUser);
      }
    })
  });
}

exports.userJoined = function(gameId, userId, callback){
  gameRepo.getGameById(gameId, function(err, game){
    if(err){
      callback(err); return;
    }

    if(game.userIsSeated(userId)){
      callback("User already seated"); return;
    }

    var seat = game.extractViewerByUserId(userId);
    if(seat == null){
      seat = new seatModel({user: userId});
    }

    seat = addSeatToGame(game, seat);
    gameRepo.cleanSave(game, function(err, gameId){
      if(err){
        callback(err); return;
      }
      playerPoolRepo.addUserToGameOwnerPlayerPool(game, userId, callback);
      emailService.emailAfterJoin(game, userId);
    });
  });
}

exports.ownerAdded = function(gameId, userId, name, callback){
  gameRepo.getGameById(gameId, function(err, game){
    if(err){
      callback(err); return;
    }

    if(game.userIsSeated(userId)){
      callback("User already seated"); return;
    }

    var seat = game.extractViewerByUserId(userId);
    if(seat == null){
      seat = new seatModel({user: userId, name: name});
    }

    seat = addSeatToGame(game, seat);
    gameRepo.cleanSave(game, function(err, gameId){
      if(err){
        callback(err); return;
      }
      //!!!!emailSender.notifyOnJoin
      //send notification
      callback();
    });
  });
}

exports.userCancelled = function(gameId, seatId, userId, callback){
  gameRepo.getGameById(gameId, function(err, game){
    if(err){
      callback(err); return;
    }

    var seat = game.extractSeatById(seatId);
    if(seat == null){
      callback("No seat found for passed ID"); return;
    } else if(!seat.user._id.equals(userId)){
      callback("Not authorized"); return;
    }

    var newlyMovedSeat = game.configureSeatsAfterCancellation(seat);
    game.addViewer(null, seat);
    gameRepo.cleanSave(game, function(err, gameId){
      if(err){
        callback(err); return;
      }
      emailService.emailAfterLeave(game, userId, newlyMovedSeat ? newlyMovedSeat.user._id || newlyMovedSeat.user : null);
      callback();
    });
  })
}

exports.ownerKicked = function(gameId, seatId, userId, callback){
  gameRepo.getGameById(gameId, function(err, game){
    if(err){
      callback(err); return;
    }

    var seat = game.extractSeatById(seatId);
    if(seat == null){
      callback("No seat found for passed ID"); return;
    } else if(!game.owner._id.equals(userId)){
      callback("Not authorized"); return;
    }

    var newlyMovedSeat = game.configureSeatsAfterCancellation(seat);
    gameRepo.cleanSave(game, function(err, gameId){
      if(err){
        callback(err); return;
      }
      //send email!!!!
      callback();
    });
  })
}

//ADD TO GAME MODEL IN A SMART WAY
function addSeatToGame(game, seat){
  if(game.emptySeats){
    seat.type = 'player';
    game.seatCollection.push(seat);
  } else{
    seat.type = 'waitlist';
    game.waitListCollection.push(seat);
  }
  return seat;
}
