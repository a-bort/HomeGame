var gameModel = require('/models/game');

exports.getGamesByOwner = function(ownerId, callback){
  return gameModel.find({ownerId: ownerId}, function(err, games){
    if(error){
      console.log(error);
      return;
    }
    callback(games);
  });
}