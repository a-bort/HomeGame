var gameModel = require('../models/game').game;
var seatModel = require('../models/game').seat;

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
      exports.addSeatToGame(game, userId);
    }
  }
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
        
        for(var i = 0; i < game.seatCollection.length; i++){
            var seat = game.seatCollection[i];
            if(!seat.user){
                seat.user = userId;
                break;
            }
        }
        
        game.save(function(err){
          if(err){
            console.log(err);
          }
          callback(err);
        });
    });
}