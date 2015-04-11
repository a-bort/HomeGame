var gameModel = require('../models/game').game;
var seatModel = require('../models/game').seat;

exports.createSeatsForGame = function(game, currentUser){
    for(var i = 0; i < game.seats; i++){
        var seat = new seatModel({
            ownerId: currentUser._id
        });
        
        game.seatCollection.push(seat);
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