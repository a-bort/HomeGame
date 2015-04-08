var gameModel = require('../models/game').game;
var seatRepo = require('./seatRepository');

exports.saveGame = function(gameObject, currentUser, callback){
  gameObject.owner = currentUser._id;
  var game = new gameModel(gameObject);
  seatRepo.createSeatsForGame(game, currentUser);
  game.save(function(err){
    if(err){
      util.log(err);
    }
    
    callback(err);
  });
}

exports.getGameById = function(gameId, callback){
    gameModel.findOne({_id: gameId}).populate('owner').populate('seatCollection.user').exec(function(err, game){
        callback(err, game);
    });
}

exports.getGamesByOwner = function(ownerId, callback){
  gameModel.find({owner: ownerId}, function(err, games){
    if(err){
      console.log(err);
      return;
    }
    callback(games);
  });
}

exports.getGamesByPlayer = function(playerId, callback){
  gameModel.find({'seatCollection.user': playerId}, function(err, games){
    if(err){
      console.log(err);
      return;
    }
    callback(games);
  })
}