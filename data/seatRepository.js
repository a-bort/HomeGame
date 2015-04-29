var gameModel = require('../models/game').game;
var seatModel = require('../models/game').seat;
var playerPoolRepo = require('./playerPoolRepository');

exports.createSeatsForGame = function(game, userId){
    for(var i = 0; i < game.seats; i++){
        exports.addSeatToGame(game, userId);
    }
}

exports.addSeatToGame = function(game, userId){
  var seat = new seatModel({});
  
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

exports.seatUserInGame = function(gameId, user, callback){
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
          addUserToSeatList(game, user);
        } else{
          addUserToWaitList(game, user);
        }
        
        game.save(function(err){
          if(err){
            console.log(err);
            callback(err);
          } else{
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