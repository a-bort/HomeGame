var gameRepo = require('../data/gameRepository');
var emailSender = require('./emailSender');

//!SHOULD BE PLAYER POOL SERVICE!
var playerPoolRepo = require('../data/playerPoolRepository');

var seatModel = require('../models/game').seat;

exports.userJoined = function(gameId, userId, callback){
  gameRepo.getGameById(gameId, function(err, game){
    if(err){
      callback(err); return;
    }

    if(!game.userIsSeated) console.log("userIsSeated not defined!");
    if(game.userIsSeated(userId)){
      callback("User already seated"); return;
    }

    var seat = extractViewerByUserId(game, userId);
    if(seat == null){
      seat = new seatModel({user: userId});
    }

    seat = addSeatToGame(game, seat);
    gameRepo.cleanSave(game, function(err, gameId){
      if(err){
        callback(err); return;
      }
      //!!!!emailSender.notifyOnJoin
      //send notification
      playerPoolRepo.addUserToGameOwnerPlayerPool(game, userId, callback);
    });
  });
}

exports.ownerAdded = function(gameId, userId, name, callback){
  gameRepo.getGameById(gameId, function(err, game){
    if(err){
      callback(err); return;
    }

    if(!game.userIsSeated) console.log("userIsSeated not defined!");
    if(game.userIsSeated(userId)){
      callback("User already seated"); return;
    }

    var seat = extractViewerByUserId(game, userId);
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

exports.userCancelled = function(seatId){

}

exports.ownerKicked = function(seatId){

}

function extractViewerByUserId(game, userId){
  if(userId == null) return null;

  var idx = -1;
  for(var i = 0; i < game.viewerCollection.length; i++){
    var viewer = game.viewerCollection[i];
    if(viewer.user._id == userId){
      idx = i;
      break;
    }
  }
  if(idx >= 0){
    return game.viewerCollection.splice(idx, 1);
  }
  return null;
}

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
