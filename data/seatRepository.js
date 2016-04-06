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

exports.configureSeatsAfterCancellation = function(game){
  var seats = game.seats;
  var count = getActiveSeatCount(game);

  if(count < seats){
    for(var i = 0; i < seats-count; i++){
      if(game.waitListCollection.length > 0){
        exports.seatPlayerFromWaitlist(game);
      }
      else{
        exports.addSeatToGame(game);
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
  var waitlistSeat = game.waitListCollection[0];
  game.seatCollection.push(waitlistSeat);
  game.waitListCollection.splice(0, 1);
  emailSender.notifyMovedOffWaitlist(game, waitlistSeat.user, function(err){
    if(err){ console.log("DIDN'T SEND EMAIL: " + err); }
  });
}

exports.seatUserInGame = function(gameId, userId, name, ownerAdded, callback){
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

        if(game.emptySeats > 0){
          addToSeatList(game, userId, name);
        } else{
          addToWaitList(game, userId, name);
        }

        game.save(function(err){
          if(err){
            console.log("Error saving game");
            console.log(err);
            callback(err);
          } else{
            if(game.emailNotifications && !ownerAdded && !game.owner.equals(userId)){
              emailSender.notifyOwnerOnJoin(game, userId);
            }
            notifyPlayers(game, userId);
            playerPoolRepo.addUserToGameOwnerPlayerPool(game, userId, callback);
          }
        });
    });
}

function notifyPlayers(game, playerId){
  var gameAlmostFull = ((game.filledSeats == Math.ceil(game.seats * .8)) || (game.seats <= 4 && game.emptySeats == 1));
  for(var i = 0; i < game.seatCollection.length; i++){
    var seat = game.seatCollection[i];
    if(gameAlmostFull && seat.notifyOnThreshold){
      emailSender.notifyPlayerOnThreshold(game, seat.user);
    } else if(seat.notifyOnJoin){
      emailSender.notifyPlayerOnJoin(game, seat.user, playerId);
    }
  }
}

function addToSeatList(game, userId, name){
  for(var i = 0; i < game.seatCollection.length; i++){
      var seat = game.seatCollection[i];
      if(!seat.user && !seat.name){
          if(userId){
            seat.user = userId;
          }
          if(name){
            seat.name = name;
          }
          break;
      }
  }
}

function addToWaitList(game, userId, name){
  var model = {};
  if(userId){
    model.user = userId;
  }
  if(name){
    model.name = name;
  }

  var seat = new seatModel(model);

  game.waitListCollection.push(seat);
}

function sortWaitList(game){
  game.waitListCollection.sort(function(a, b){
    return a.created.getTime() - b.created.getTime();
  });
}

exports.setNotificationStatus = function(game, seatId, userId, notifyPropertyName, notify, callback){
  for(var i = 0; i < game.seatCollection.length; i++){
    var seat = game.seatCollection[i];
    if(seat._id == seatId){
      if(!seat.user == userId){
        callback("Seat ID doesn't match logged in user");
        return;
      }

      seat[notifyPropertyName] = notify;
      game.save(callback);
      return;
    }
  }
}
