var gameRepository = require('./gameRepository');
var gameModel = require('../models/game').game;
var seatModel = require('../models/game').seat;
var userModel = require('../models/user').user;
var redirector = require('./redirector');

exports.userAuthorizedForGame = function(req, res, next){
  var gameId = req.body.gameId || req.params.gameId || req.query.gameId;
  var userId = req.user._id;

  if(!gameId){
    console.log('Request missing gameId param');
    redirector.defaultRedirect(res);
    return;
  }

  gameRepository.getGameById(gameId, function(err, game){
    if(err || !game){
      console.log('Error finding game');
      redirector.defaultRedirect(res);
      return;
    }

    var ownerPlayerPool = game.owner.playerPool;

    for(var i = 0; i < ownerPlayerPool.length; i++){
      var player = ownerPlayerPool[i];

      if(player.user && player.user.equals(userId) && player.blocked){
        req.flash('error', 'Not authorized, contact the game owner if you think this is a mistake');
        redirector.defaultRedirect(res);
        return;
      }
    }

    next();
  });
}

exports.userOwnsGame = function(req, res, next){
  var gameId = req.body.gameId || req.params.gameId || req.query.gameId;
  var userId = req.user._id;

  if(!gameId){
    console.log('Request missing gameId param');
    redirector.defaultRedirect(res);
    return;
  }

  gameRepository.getGameById(gameId, function(err, game){
    if(err || !game){
      console.log('Error finding game');
      redirector.defaultRedirect(res);
      return;
    }

    if(!game.owner._id.equals(userId)){
      req.flash('error', 'Not authorized, contact the game owner if you think this is a mistake');
      redirector.defaultRedirect(res);
      return;
    }

    next();
  });

}
