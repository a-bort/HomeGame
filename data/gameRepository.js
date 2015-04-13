var gameModel = require('../models/game').game;
var seatRepo = require('./seatRepository');

exports.saveGame = function(gameObject, userId, callback){
  gameObject.owner = userId;
  var id = gameObject._id;
  delete gameObject._id;
  if(!id){
    var game = new gameModel(gameObject);
    seatRepo.createSeatsForGame(game, userId);
    game.save(function(err){
      if(err){
        console.log(err);
      }
      
      callback(err);
    });
  }
  else{
    gameModel.update(
      {_id: id}, gameObject, {upsert: true}, function(err){
        if(err){
          console.log(err);
        }
        
        callback(err);
      }
    );
  }
}

exports.getGameById = function(gameId, callback){
    gameModel.findOne({_id: gameId}).populate('owner').populate('seatCollection.user').exec(function(err, game){
        callback(err, game);
    });
}

exports.getGamesByOwner = function(ownerId, callback){
  gameModel.find({owner: ownerId}, null, {sort: {date: 1}}, function(err, games){
    if(err){
      console.log(err);
      return;
    }
    callback(games);
  });
}

exports.getGamesByPlayer = function(playerId, callback){
  gameModel.find({'seatCollection.user': playerId}, null, {sort: {date: 1}}).populate('owner').exec(function(err, games){
    if(err){
      console.log(err);
      return;
    }
    callback(games);
  });
}

exports.isUserPlayingInGame = function(userId, game){
  for(var i = 0; i < game.seatCollection.length; i++){
    var seat = game.seatCollection[i];
    if(seat.active && seat.user && seat.user._id && seat.user._id.equals(userId)){
      return true;
    }
  }
  return false;
}

exports.leaveGame = function(gameId, userId, callback){
  gameModel.findOne({_id: gameId}, function(err, game){
    for(var i = 0; i < game.seatCollection.length; i++){
      var seat = game.seatCollection[i];
      if(seat.active && seat.user && seat.user.equals(userId)){
        game.seatCollection.splice(i, 1);
        seatRepo.configureSeatsAfterCancellation(game, userId);
        game.save(function(err){
          if(err){
            console.log(err);
          }
          
          callback(err);
        });
        break;
      }
    }
  })
}