var gameModel = require('../models/game').game;
var seatModel = require('../models/game').seat;
var playerPoolRepo = require('./playerPoolRepository');
var emailSender = require('../services/emailSender');

exports.createSeatsForGame = function(game, userId, seatHost){
    for(var i = 0; i < game.seats; i++){
        exports.addSeatToGame(game, userId, seatHost);
        seatHost = false; //Ensures host is only seated once
    }
}

exports.addSeatToGame = function(game, userId, seatHost){
  var seat = seatHost ? new seatModel({user: userId}) : new seatModel({});

  game.seatCollection.push(seat);
}

exports.addSeatsToGame = function(game, count){
  for(var i = 0; i < count; i++){
    exports.addSeatToGame(game, null, false);
  }
}

exports.removeEmptySeatsFromGame = function(game, toRemove){
  var removed = 0;
  for(var i = 0; i < game.seatCollection.length; i++){
    var seat = game.seatCollection[i];
    if(!seat.user && seat.active){
      seat.active = false;
      removed++;
      if(removed >= toRemove){
        return;
      }
    }
  }
}

exports.configureSeatsAfterCancellation = function(game, userId){
  var seats = game.seats;
  var count = getActiveSeatCount(game);

  if(count < seats){
    for(var i = 0; i < seats-count; i++){
      if(game.waitListCollection.length > 0){
        exports.seatPlayerFromWaitlist(game);
      }
      else{
        exports.addSeatToGame(game, userId);
      }
    }
  }
}

exports.ensureSeatCountIsAccurate = function(gameId, callback){
  gameModel.findOne({_id: gameId}, function(err, game){
    if(err){
        console.log(err);
        callback(err);
        return;
    }

    if(!game){
        callback("No game found");
        return;
    }

    var count = getActiveSeatCount(game);

    if(count > game.seats){
      exports.removeEmptySeatsFromGame(game, count - game.seats);
    } else if(count < game.seats){
      exports.addSeatsToGame(game, game.seats - count);
    }

    game.save(function(err){
      callback(err, gameId);
    });
  });
}

function getActiveSeatCount(game){
  var count = 0;
  for(var i = 0; i < game.seatCollection.length; i++){
    if(game.seatCollection[i].active){
      count++;
    }
  }
  return count;
}

exports.seatPlayerFromWaitlist = function(game){
  sortWaitList(game);
  game.seatCollection.push(game.waitListCollection[0]);
  game.waitListCollection.splice(0, 1);
}

exports.seatUserInGame = function(gameId, user, callback){
    gameModel.findOne({_id: gameId, active: true}, function(err, game){
        if(err){
            console.log(err);
            callback(err);
            return;
        }

        if(!game){
            callback("No game found");
            return;
        }

        var isWaitList = false;

        if(game.emptySeats > 0){
          addUserToSeatList(game, user);
        } else{
          addUserToWaitList(game, user);
          isWaitList = true;
        }

        game.save(function(err){
          if(err){
            console.log(err);
            callback(err);
          } else{
            emailSender.notifyOnJoin(game, user._id, isWaitList);
            playerPoolRepo.addUserToGameOwnerPlayerPool(game, user, callback);
          }
        });
    });
}

function addUserToSeatList(game, user){
  for(var i = 0; i < game.seatCollection.length; i++){
      var seat = game.seatCollection[i];
      if(!seat.user){
          seat.user = user;
          break;
      }
  }
}

function addUserToWaitList(game, user){
  var seat = new seatModel({
    user: user
  });

  game.waitListCollection.push(seat);
}

function sortWaitList(game){
  game.waitListCollection.sort(function(a, b){
    return a.created.getTime() - b.created.getTime();
  });
}
