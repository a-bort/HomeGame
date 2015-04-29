var gameModel = require('../models/game').game;
var seatModel = require('../models/game').seat;
var userModel = require('../models/user').user;
var playerModel = require('../models/user').player;

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
            addUserToGameOwnerPlayerPool(game, user, callback);
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

function addUserToGameOwnerPlayerPool(game, user, callback){
  var ownerId = game.owner;
  userModel.findOne({_id: ownerId}, function(err, owner){
    if(err){
      callback(err);
      return;
    }
    
    if(!owner){
      callback("Unable to locate owner with id = " + ownerId);
      return;
    }
    
    for(var i = 0; i < owner.playerPool.length; i++){
      var player = owner.playerPool[i];
      if(player.user.equals(user._id)){
        callback();
        return;
      }
    }
    
    var newPlayer = new playerModel({user: userId});
    owner.playerPool.push(newPlayer);
    
    owner.save(function(err){
      if(err){
        console.log(err);
      }
      callback(err);
    });
  });
}