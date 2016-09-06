var gameModel = require('../models/game').game;
var seatModel = require('../models/game').seat;
var playerPoolRepo = require('./playerPoolRepository');
var emailSender = require('../services/emailSender');

exports.addSeatToGame = function(game, userId, name){
  var seat = new seatModel({user: userId, name: name});
  game.seatCollection.push(seat);
}

exports.configureSeatsAfterCancellation = function(game){
  var seats = game.seats;
  var count = getSeatCount(game);

  if(count < seats){
    for(var i = 0; i < seats-count; i++){
      if(game.waitListCollection.length > 0){
        exports.seatPlayerFromWaitlist(game);
      }
    }
  }
}

function getSeatCount(game){
  var count = 0;
  for(var i = 0; i < game.seatCollection.length; i++){
    if(game.seatCollection[i].active && game.seatCollection[i].user){
      count++;
    }
  }
  return count;
}

exports.seatPlayerFromWaitlist = function(game){
  sortWaitList(game);
  var waitlistSeat = game.waitListCollection[0];
  game.seatCollection.push(waitlistSeat);
  game.waitListCollection.splice(0, 1);
  emailSender.notifyMovedOffWaitlist(game, waitlistSeat.user, function(err){
    if(err){ console.log("DIDN'T SEND EMAIL: " + err); }
  });
}

exports.seatUserInGame = function(gameId, userId, name, ownerAdded, callback){
    gameModel.findOne({_id: gameId, active: true}, function(err, game){
        if(err){
            console.log(err);
            callback(err);
            return;
        }

        if(!game){
            callback("No game found");
            return;
        }

        if(game.emptySeats > 0){
          exports.addSeatToGame(game, userId, name);
        } else{
          addSeatToWaitlist(game, userId, name);
        }
        exports.removePlayerFromViewers(game, userId);

        game.save(function(err){
          if(err){
            console.log("Error saving game");
            console.log(err);
            callback(err);
          } else{
            if(game.emailNotifications && !ownerAdded && !game.owner.equals(userId)){
              emailSender.notifyOwnerOnJoin(game, userId);
            }
            notifyPlayers(game, userId);
            playerPoolRepo.addUserToGameOwnerPlayerPool(game, userId, callback);
          }
        });
    });
}

function notifyPlayers(game, playerId){
  var gameAlmostFull = ((game.filledSeats == Math.ceil(game.seats * .8)) || (game.seats <= 4 && game.emptySeats == 1));
  for(var i = 0; i < game.seatCollection.length; i++){
    var seat = game.seatCollection[i];
    if(gameAlmostFull && seat.notifyOnThreshold){
      emailSender.notifyPlayerOnThreshold(game, seat.user);
    } else if(seat.notifyOnJoin){
      emailSender.notifyPlayerOnJoin(game, seat.user, playerId);
    }
  }
}

function addSeatToWaitList(game, userId, name){
  var model = {};
  if(userId){
    model.user = userId;
  }
  if(name){
    model.name = name;
  }

  var seat = new seatModel(model);

  game.waitListCollection.push(seat);
}

function sortWaitList(game){
  game.waitListCollection.sort(function(a, b){
    return a.created.getTime() - b.created.getTime();
  });
}

exports.setNotificationStatus = function(game, userId, notifyPropertyName, notify, callback){
  var seat = exports.findSeatByUser(game, userId);
  if(seat == null){
    callback("No seat found for user");
    return;
  }

  seat[notifyPropertyName] = notify;
  game.save(callback);
}

exports.findSeatByUser = function(game, userId){
  for(var i = 0; i < game.seatCollection.length; i++){
    var seat = game.seatCollection[i];
    if(seat.user && seat.user._id.equals(userId)){
      return seat;
    }
  }
  for(var i = 0; i < game.waitListCollection.length; i++){
    var seat = game.waitListCollection[i];
    if(seat.user && seat.user._id.equals(userId)){
      return seat;
    }
  }
  for(var i = 0; i < game.viewerCollection.length; i++){
    var seat = game.viewerCollection[i];
    if(seat.user && seat.user._id.equals(userId)){
      return seat;
    }
  }
  return null;
}

exports.removePlayerFromGame = function(game, userId, addToViewers, callback){
  if(!tryLeaveSeatCollection(game, userId, addToViewers, callback)){
    if(!tryLeaveWaitListCollection(game, userId, addToViewers, callback)){
      callback("Couldn't find this player's seat");
    }
  }
}

function tryLeaveSeatCollection(game, userId, addToViewers, callback){
  for(var i = 0; i < game.seatCollection.length; i++){
    var seat = game.seatCollection[i];
    if(seat.user && seat.user._id.equals(userId)){
      game.seatCollection.splice(i, 1);
      exports.configureSeatsAfterCancellation(game);
      if(addToViewers){
        addViewer(game, seat.user._id);
      }
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

function tryLeaveWaitListCollection(game, userId, addToViewers, callback){
  for(var i = 0; i < game.waitListCollection.length; i++){
    var seat = game.waitListCollection[i];
    if(seat.user && seat.user._id.equals(userId)){
      game.waitListCollection.splice(i, 1);
      if(addToViewers){
        addViewer(game, seat.user._id);
      }
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

exports.addUserToViewerList = function(gameId, userId, callback){
    gameModel.findOne({_id: gameId, active: true}, function(err, game){
        if(err){
            console.log(err);
            callback(err);
            return;
        }

        if(!game){
            callback("No game found");
            return;
        }

        exports.addUserToViewerListByGame(game, userId, callback);
    });
}

exports.addUserToViewerListByGame = function(game, userId, callback){
    var success = addViewer(game, userId)

    if(success){
      game.save(function(err){
        if(err){
          console.log("Error saving game");
          console.log(err);
        }
        callback(err);
      });
    } else{
      callback("User already a viewer");
    }
}

function addViewer(game, userId){
  var viewerList = game.viewerCollection;

  for(var i = 0; i < viewerList.length; i++){
    var viewer = viewerList[i];
    if(viewer && viewer.user && viewer.user._id.equals(userId)){
      return false;
    }
  }

  viewerList.push(new seatModel({
    user: userId
  }));

  return true;
}

exports.removePlayerFromViewers = function(game, userId){
  var viewerList = game.viewerCollection;

  for(var i = 0; i < viewerList.length; i++){
    if(viewerList[i] && viewerList[i].user.equals(userId)){
      viewerList.splice(i, 1);
      return;
    }
  }
}
