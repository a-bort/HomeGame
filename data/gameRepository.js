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
  gameModel.find({ownerId: ownerId}, function(err, games){
    if(err){
      util.log(err);
      return;
    }
    callback(games);
  });
}