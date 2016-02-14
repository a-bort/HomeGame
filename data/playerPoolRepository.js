var ObjectId = require('mongoose').Types.ObjectId;

var userModel = require('../models/user').user;
var playerModel = require('../models/user').player;
var userRepo = require('../data/userRepository');

exports.addUserToGameOwnerPlayerPool = function(game, userId, callback){
  var ownerId = game.owner;

  if(ownerId.equals(userId)){
    callback();
    return;
  };

  userRepo.getUserWithPlayerPool(ownerId, function(err, owner){
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
      if(player.user && player.user._id.equals(userId)){
        callback();
        return;
      }
    }

    var newPlayer = new playerModel({user: userId});
    owner.playerPool.push(newPlayer);

    owner.save(function(err){
      if(err){
        console.log(err);
      }
      callback(err);
    });
  });
}
