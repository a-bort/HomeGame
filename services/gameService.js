var gameRepo = require('./data/gameRepository');
var emailSender = require('../services/emailSender');

exports.userJoined = function(gameId, userId, callback){
  gameRepo.getGameById(gameId, function(err, game){
    if(err){
      callback(err); return;
    }

    var seat = extractViewerByUserId(game, userId);
    if(seat == null){
      seat = new seatModel({user: userId, name: name});
    }

    seat = addSeatToGame(game, seat);
    gameRepo.cleanSave(game, function(err, game){
      if(err){
        callback(err); return;
      }
      emailSender.notifyOnJoin
      //send notification
    });
  });
}

exports.ownerAdded = function(gameId, userId, name){

}

function extractViewerByUserId(game, userId){
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

exports.userCancelled = function(seatId){

}

exports.ownerKicked = function(seatId){

}
