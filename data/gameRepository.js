var gameModel = require('../models/game').game;

exports.saveGame = function(gameObject, callback){
  var game = new gameModel(gameObject);
  game.save(function(err){
    if(err){
      console.log(err);
    }
    callback(err);
  });
}

exports.getGamesByOwner = function(ownerId, callback){
  return gameModel.find({ownerId: ownerId}, function(err, games){
    if(error){
      console.log(error);
      return;
    }
    callback(games);
  });
}