var gameModel = require('../models/game').game;
var seatRepo = require('./seatRepository');
var emailSender = require('../services/emailSender');

exports.saveGame = function(gameObject, seatHost, userId, callback){
  gameObject.owner = userId;
  var id = gameObject._id;
  delete gameObject._id;
  if(!id){
    var game = new gameModel(gameObject);
    seatRepo.createSeatsForGame(game, userId, seatHost);
    game.save(function(err, obj){
      if(err){
        console.log(err);
      }

      callback(err, obj._id);
    });
  }
  else{
    gameModel.update(
      {_id: id}, gameObject, {upsert: true}, function(err){
        if(err){
          console.log(err);
          callback(err, id);
          return;
        }

        seatRepo.ensureSeatCountIsAccurate(id, callback);
      }
    );
  }
}

exports.getGameById = function(gameId, callback){
    gameModel.findOne({_id: gameId}).populate('owner').populate('seatCollection.user').populate('waitListCollection.user').exec(function(err, game){
        callback(err, game);
    });
}

exports.getLatestGameByOwner = function(ownerId, callback){
  exports.getGamesByOwner(ownerId, function(games){
    callback(games && games.length > 0 ? games[0] : null);
  })
}

exports.getGamesByOwner = function(ownerId, callback){
  gameModel.find({owner: ownerId}, null, {sort: {date: -1}}, function(err, games){
    if(err){
      console.log(err);
    }
    callback(games);
  });
}

exports.getGamesByPlayer = function(playerId, callback){
  gameModel.find({'seatCollection.user': playerId}, null, {sort: {date: -1}}).populate('owner').exec(function(err, games){
    if(err){
      console.log(err);
    }
    callback(games);
  });
}

exports.getWaitlistedGames = function(playerId, callback){
  gameModel.find({'waitListCollection.user': playerId}, null, {sort: {date: -1}}).populate('owner').exec(function(err, games){
    if(err){
      console.log(err);
    }
    callback(games);
  });
}

exports.isUserRegisteredForGame = function(userId, game){
  for(var i = 0; i < game.seatCollection.length; i++){
    var seat = game.seatCollection[i];
    if(seat.active && seat.user && seat.user._id && seat.user._id.equals(userId)){
      return true;
    }
  }
  for(var i = 0; i < game.waitListCollection.length; i++){
    var seat = game.waitListCollection[i];
    if(seat.active && seat.user && seat.user._id && seat.user._id.equals(userId)){
      return true;
    }
  }
  return false;
}

exports.leaveGame = function(gameId, user, callback){
  gameModel.findOne({_id: gameId}, function(err, game){
    if(err || !game){
      callback(err);
    }

    if(!tryLeaveSeatCollection(game, user._id, callback)){
      if(!tryLeaveWaitListCollection(game, user._id, callback)){
        callback("Couldn't find this player's seat");
      }
    }
  });
}

function tryLeaveSeatCollection(game, userId, callback){
  for(var i = 0; i < game.seatCollection.length; i++){
    var seat = game.seatCollection[i];
    if(seat.active && seat.user && seat.user.equals(userId)){
      game.seatCollection.splice(i, 1);
      seatRepo.configureSeatsAfterCancellation(game, userId);
      game.save(function(err){
        if(err){
          console.log(err);
          callback(err);
        } else{
          if(game.emailNotifications){
            emailSender.notifyOnCancel(game, userId);
          }
          callback();
        }
      });
      return true;
    }
  }
  return false;
}

function tryLeaveWaitListCollection(game, userId, callback){
  for(var i = 0; i < game.waitListCollection.length; i++){
    var seat = game.waitListCollection[i];
    if(seat.active && seat.user && seat.user.equals(userId)){
      game.waitListCollection.splice(i, 1);
      game.save(function(err){
        if(err){
          console.log(err);
        }

        callback(err);
      });
      return true;
    }
  }
  return false;
}
