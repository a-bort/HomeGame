var gameModel = require('../models/game').game;
var seatModel = require('../models/game').seat;
var playerPoolRepo = require('./playerPoolRepository');
var emailSender = require('../services/emailSender');

exports.addSeatToGame = function(game, userId, name, viewerSeat, notifyOnJoin, notifyOnComment){
  var seat = viewerSeat ? viewerSeat : new seatModel({user: userId, name: name, notifyOnJoin: !!notifyOnJoin, notifyOnComment: !!notifyOnComment});
  game.seatCollection.push(seat);
}

exports.configureSeatsAfterCancellation = function(game){
  var seats = game.seats;
  var count = getSeatCount(game);

  if(count < seats){
    for(var i = 0; i < seats-count; i++){
      if(game.waitListCollection.length > 0){
        return exports.seatPlayerFromWaitlist(game);
      }
    }
  }
  return null;
}

function getSeatCount(game){
  var count = 0;
  for(var i = 0; i < game.seatCollection.length; i++){
    var seat = game.seatCollection[i];
    if(seat.active && (seat.user || seat.name)){
      count++;
    }
  }
  return count;
}

exports.seatPlayerFromWaitlist = function(game){
  sortWaitList(game);
  var waitlistSeat = game.waitListCollection[0];
  game.seatCollection.push(waitlistSeat);
  return game.waitListCollection.splice(0, 1)[0];
  //emailSender.notifyMovedOffWaitlist(game, waitlistSeat.user, function(err){
  //  if(err){ console.log("DIDN'T SEND EMAIL: " + err); }
  //});
}

function notifyPlayers(joined, game, playerId, waitlistSeat){
  exports.iterateOverAllSeats(game, function(seat){
    //Only notify players who have the join/leave notifications enabled
    if(seat.notifyOnJoin && seat.user){
      var recipientId = seat.user._id;
      //If someone just joined, and this seat isn't them, tell them about it
      if(joined && !recipientId.equals(playerId)){
        emailSender.notifyOnJoin(game, recipientId, playerId);
      }
      //If someone just cancelled, don't notify the player who just cancelled or the player who just came off the waitlist
      else if(!joined && !recipientId.equals(playerId)){
        emailSender.notifyOnCancel(game, recipientId, playerId, waitlistPlayerId);
      }
      //If someone just cancelled, and this is the player who just moved off the waitlist, let them know in a special way
      else if(!joined && waitlistPlayerId != null && recipientId.equals(waitlistPlayerId)){
        emailSender.notifyMovedOffWaitlist(game, playerId);
      }
    }
  });
}

exports.iterateOverAllSeats = function(game, eachFn){
  game.seatCollection.forEach(eachFn);
  game.waitListCollection.forEach(eachFn);
  game.viewerCollection.forEach(eachFn);
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
    var success = exports.addViewer(game, userId)

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

exports.addViewer = function(game, userId, seat, notifyOnJoin, notifyOnComment){
  var viewerList = game.viewerCollection;

  if(!userId) return false;

  for(var i = 0; i < viewerList.length; i++){
    var viewer = viewerList[i];
    if(viewer && viewer.user && viewer.user._id.equals(userId)){
      return false;
    }
  }
  seat = seat ? seat : new seatModel({
    user: userId,
    type: 'viewer',
    notifyOnJoin: !!notifyOnJoin,
    notifyOnComment: !!notifyOnComment
  });
  seat.type = 'viewer';
  viewerList.push(seat);

  return true;
}
