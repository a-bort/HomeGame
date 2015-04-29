var gameModel = require('../models/game').game;
var seatModel = require('../models/game').seat;
var userModel = require('../models/user');

exports.createSeatsForGame = function(game, userId){
    for(var i = 0; i < game.seats; i++){
        exports.addSeatToGame(game, userId);
    }
}

exports.addSeatToGame = function(game, userId){
  var seat = new seatModel({
    ownerId: userId
  });
  
  game.seatCollection.push(seat);
}

exports.configureSeatsAfterCancellation = function(game, userId){
  var count = 0;
  var seats = game.seats;
  for(var i = 0; i < game.seatCollection.length; i++){
    if(game.seatCollection[i].active){
      count++;
    }
  }
  
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

exports.seatPlayerFromWaitlist = function(game){
  sortWaitList(game);
  game.seatCollection.push(game.waitListCollection[0]);
  game.waitListCollection.splice(0, 1);
}

exports.seatUserInGame = function(gameId, userId, callback){
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
        
        if(game.emptySeats > 0){
          addUserToSeatList(game, userId);
        } else{
          addUserToWaitList(game, userId);
        }
        
        game.save(function(err){
          if(err){
            console.log(err);
          }
          callback(err);
        });
    });
}

function addUserToSeatList(game, userId){
  for(var i = 0; i < game.seatCollection.length; i++){
      var seat = game.seatCollection[i];
      if(!seat.user){
          seat.user = userId;
          break;
      }
  }
}

function addUserToWaitList(game, userId){
  var seat = new seatModel({
    user: userId
  });
  
  game.waitListCollection.push(seat);
}

function sortWaitList(game){
  game.waitListCollection.sort(function(a, b){
    return a.created.getTime() - b.created.getTime();
  });
}

function addUserToGameOwnerPlayerPool(game, userId, callback){
  
}