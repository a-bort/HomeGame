var gameModel = require('../models/game').game;
var seatRepo = require('./seatRepository');

exports.saveGame = function(gameObject, currentUser, callback){
  gameObject.owner = currentUser._id;
  var id = gameObject._id;
  delete gameObject._id;
  if(!id){
    var game = new gameModel(gameObject);
    seatRepo.createSeatsForGame(game, currentUser);
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
  gameModel.find({'seatCollection.user': playerId}, null, {sort: {date: 1}}, function(err, games){
    if(err){
      console.log(err);
      return;
    }
    callback(games);
  })
}