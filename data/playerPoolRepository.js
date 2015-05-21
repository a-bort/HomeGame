var userModel = require('../models/user').user;
var playerModel = require('../models/user').player;

exports.addUserToGameOwnerPlayerPool = function(game, user, callback){
  var ownerId = game.owner;
  
  if(ownerId.equals(user._id)){
    callback();
    return;
  };
  
  userModel.findOne({_id: ownerId}, function(err, owner){
    if(err){
      callback(err);
      return;
    }
    
    if(!owner){
      callback("Unable to locate owner with id = " + ownerId);
      return;
    }
    
    for(var i = 0; i < owner.playerPool.length; i++){
      var player = owner.playerPool[i];
      if(player.user.equals(user._id)){
        callback();
        return;
      }
    }
    
    var newPlayer = new playerModel({user: user._id});
    owner.playerPool.push(newPlayer);
    
    owner.save(function(err){
      if(err){
        console.log(err);
      }
      callback(err);
    });
  });
}