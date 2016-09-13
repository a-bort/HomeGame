var gameModel = require('../models/game').game;
var commentModel = require('../models/game').comment;
var seatRepo = require('./seatRepository');
var emailSender = require('../services/emailSender');

exports.saveGame = function(gameObject, options, userId, callback){
  gameObject.owner = userId;
  var id = gameObject._id;
  delete gameObject._id;
  if(!id){
    var game = new gameModel(gameObject);
    if(game.seatHost){
      seatRepo.addSeatToGame(game, userId, "", null, game.emailNotifications, game.commentNotifications);
    } else{
      seatRepo.addViewer(game, userId, null, game.emailNotifications, game.commentNotifications);
    }
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
        }
        callback(err, id);
      }
    );
  }
}

exports.getGameById = function(gameId, callback){
    gameModel.findOne({_id: gameId})
              .populate('owner')
              .populate('seatCollection.user')
              .populate('waitListCollection.user')
              .populate('viewerCollection.user')
              .populate('comments.user')
    .exec(function(err, game){
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
  gameModel.find({$or: [{'seatCollection.user': playerId}, {'viewerCollection.user': playerId}]}, null, {sort: {date: -1}}).populate('owner').exec(function(err, games){
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

exports.addCommentToGame = function(gameId, userId, comment, callback){
  exports.getGameById(gameId, function(err, game){
    if(err){
      console.log("Error retrieving game");
      callback(err);
      return;
    }

    if(!game.comments){
      game.comments = [];
    }

    game.comments.push(new commentModel({
      user: userId,
      text: comment
    }));

    game.save(function(err){
      if(err){
        console.log("Error saving game after comment: " + err);
        callback(err);
        return;
      }

      seatRepo.iterateOverAllSeats(game, function(seat){
        if(seat.notifyOnComment && !seat.user._id.equals(userId)){
          emailSender.notifyOnComment(game, seat.user._id, userId);
        }
      });
      callback();
    });
  });
}

exports.removeCommentFromGame = function(gameId, commentId, userId, callback){
  exports.getGameById(gameId, function(err, game){
    if(err || !game.comments){
      console.log(err ? "Error retrieving game" : "No comments for game");
      callback(err);
      return;
    }

    for(var i = 0; i < game.comments.length; i++){
      var comment = game.comments[i];
      if(comment._id.equals(commentId)){
        if(comment.user._id.equals(userId)){
          game.comments.splice(i, 1);
          game.save(callback);
        } else{
          callback("User doesn't own this comment");
        }
        return;
      }
    }

    callback("Unable to locate comment");
  });
}

exports.isUserRegisteredForGame = function(userId, game){
  for(var i = 0; i < game.seatCollection.length; i++){
    var seat = game.seatCollection[i];
    if(seat.active && (seat.user._id || seat.user).equals(userId)){
      return true;
    }
  }
  for(var i = 0; i < game.waitListCollection.length; i++){
    var seat = game.waitListCollection[i];
    if(seat.active && (seat.user._id || seat.user).equals(userId)){
      return true;
    }
  }
  return false;
}

exports.isUserGameViewer = function(userId, game){
  for(var i = 0; i < game.viewerCollection.length; i++){
    var viewer = game.viewerCollection[i];
    if((viewer.user._id || viewer.user).equals(userId)){
      return true;
    }
  }
  return false;
}

exports.addUserToGame = function(gameId, userId, name, ownerAdded, callback){
  exports.getGameById(gameId, function(err, game){
    if(err){
      console.log(err);
      callback(err);
      return;
    }
    else if(!game){
        callback("No game found");
        return;
    }

    seatRepo.seatUserInGame(game, userId, name, ownerAdded, callback);
  });
}

exports.leaveGame = function(gameId, userId, callback){
  exports.getGameById(gameId, function(err, game){
    if(err){
      console.log(err);
      callback(err);
      return;
    }
    seatRepo.removePlayerFromGame(game, userId, true, callback)
  });
}

exports.kickPlayer = function(gameId, userIdToKick, userId, callback){
  exports.getGameById(gameId, function(err, game){
    if(err || !game){
      callback(err);
      return;
    }

    if(!game.owner._id.equals(userId)){
      callback("Not Authorized");
      return;
    }

    seatRepo.removePlayerFromGame(game, userIdToKick, false, callback);
  });
}
