var gameRepository = require('./gameRepository');
var gameModel = require('../models/game').game;
var seatModel = require('../models/game').seat;
var userModel = require('../models/user');
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
    }
    
    var ownerPlayerPool = game.owner.playerPool;
    for(var i = 0; i < ownerPlayerPool.length; i++){
      var player = ownerPlayerPool[i];
      if(player.user == userId && player.blocked){
        req.flash('error', 'Not Authorized');
        redirector.defaultRedirect(res);
        return;
      }
    }
    
    next();
  });
}