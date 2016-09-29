var config = require('../config/config');
var baseMailOptions = config.baseMailOptions;

var sendgrid = require('sendgrid')(config.emailUser, config.emailPass);

var userRepo = require('../data/userRepository');

/*exports.emailPlayerPool = function(user, gameId, subject, html, text, callback){
  html = setGameUrls(html, gameId);
  userRepo.getUserWithPlayerPool(user._id, function(err, user){
    if(err){
      callback(err);
      return;
    }

    if(!user){
      callback("Unable to load player pool to email. No emails were sent.");
      return;
    }

    for(var i = 0;i < user.playerPool.length; i++){
      var player = user.playerPool[i];

      //if(!player.confirmed || player.blocked) continue;

      var user = player.user;
      if(user && user.email){
        exports.sendSingleEmail(user.email, subject, html, text);
      } else{
        console.log("Bad email logic");
      }
    }
    callback(null);
  });
}

exports.notifyOwnerOnJoin = function(game, playerId){
  if(!game || !playerId){ return; }
  game = game.toJSON();
  sendNotificationEmail(game.owner, playerId,
    function(name){
      return name + " has joined your game";
    },
    function(name){
      var str = name + "&nbsp;joined your poker game! (" + game.dateString + ")";
      str += "<br><br>Currently <b>" + game.filledSeats + "/" + game.seats + "</b>&nbsp;seats are filled.";
      str += game.waitListCollection.length ? ("<br><br>" + game.waitListCollection.length + " players on the waitlist") : "";
      str += "<br><br><b><a href='" + config.baseUrl + game.joinGameUrl + "'>View Game Page</a></b>";
      return str;
    },
    function(name){
      return name + " just joined your game (" + game.date + "). Currently " + game.filledSeats + "/" + game.seats + " seats are filled.";
    },
    function(){});
}*/

exports.notifyOnJoin = function(game, recipientId, playerId){
  if(!game || !recipientId){ return; }
  game = game.toJSON();
  var recipientIsOwner = recipientId.equals(game.owner._id);
  sendPlayerNotificationEmail(recipientId, playerId, game.owner,
    function(playerName, ownerName){
      var yourText = recipientIsOwner ? "your" : (ownerName + "'s");
      return "Another player has joined "  + yourText + " game";
    },
    function(playerName, ownerName){
      var yourText = recipientIsOwner ? "your" : (ownerName + "'s");
      var str = playerName + " joined " + yourText + " poker game! (" + game.dateString + ")";
      str += "<br><br>Currently <b>" + game.filledSeats + "/" + game.seats + "</b>&nbsp;seats are filled.";
      str += game.waitListCollection.length ? ("<br><br>" + game.waitListCollection.length + " players on the waitlist") : "";
      str += "<br><br><b><a href='" + config.baseUrl + game.joinGameUrl + "'>View Game Page</a></b>";
      return str;
    },
    function(playerName, ownerName){
      var yourText = recipientIsOwner ? "your" : (ownerName + "'s");
      return playerName + " just joined " + yourText + " game (" + game.dateString + "). Currently " + game.filledSeats + "/" + game.seats + " seats are filled.";
    },
    function(){});
}

/*exports.notifyPlayerOnThreshold = function(game, recipientId){
  if(!game || !recipientId){ return; }
  game = game.toJSON();
  sendNotificationEmail(recipientId, game.owner,
    function(name){
      return name + "'s game on " + game.dateString + " is almost full!";
    },
    function(name){
      var str = name + "'s game on " + game.dateString + " is almost full";
      str = str + "<br><br>Currently <b>" + game.filledSeats + "/" + game.seats + "</b>&nbsp;seats are filled.";
      str = str + "<br><br><b><a href='" + config.baseUrl + game.joinGameUrl + "'>View Game Page</a></b>";
      return str;
    },
    function(name){
      return name +"'s game on " + game.dateString + " is almost full. Currently " + game.filledSeats + "/" + game.seats + " seats are filled.";
    },
    function(){});
}*/

exports.notifyOnComment = function(game, recipientId, playerId){
  if(!game || !recipientId || !game.comments.length){ return; }
  game = game.toJSON();
  var recipientIsOwner = recipientId.equals(game.owner._id);
  sendPlayerNotificationEmail(recipientId, playerId, game.owner,
    function(playerName, ownerName){
      var yourText = recipientIsOwner ? "your" : (ownerName + "'s");
      return "Someone commented on "  + yourText + " game [" + game.dateString + "]";
    },
    function(playerName, ownerName){
      var comment = game.comments[game.comments.length - 1];
      var str = "On " + comment.dateString + ", " + playerName + " wrote:<br/><br/>"
      str += "\"" + comment.text + "\"" + "<br/><br/>";
      str += "See the rest of the conversation below<br/>";
      str += "<br><br><b><a href='" + config.baseUrl + game.joinGameUrl + "'>View Game Page</a></b>";
      return str;
    },
    function(playerName, ownerName){
      var comment = game.comments[game.comments.length - 1];
      var str = "On " + comment.dateString + ", " + playerName + " wrote: \"" + comment.text + "\"" + " See the rest of the conversation on the game page";
      return str;
    },
    function(){});
}

exports.notifyOnCancel = function(game, recipientId, playerId, waitlistedId){
  game = game.toJSON();
  var recipientIsOwner = recipientId.equals(game.owner._id);
  sendCancelNotificationEmail(recipientId, playerId, game.owner._id, waitlistedId,
    function(playerName, ownerName, newlySeatedName){
      var yourText = recipientIsOwner ? "your" : (ownerName + "'s");
      return playerName + " has left " + yourText + " game";
    },
    function(playerName, ownerName, newlySeatedName){
      var yourText = recipientIsOwner ? "your" : (ownerName + "'s");
      var str = playerName + "&nbsp;cancelled their reservation for " + yourText + " poker game. (" + game.dateString + ")";
      if(!!newlySeatedName){
        str += "<br>" + newlySeatedName + " has been moved off the waitlist to take their place.";
      }
      str += "<br><br>Currently <b>" + game.filledSeats + "/" + game.seats + "</b>&nbsp;seats are filled.";
      str += "<br><br><b><a href='" + config.baseUrl + game.joinGameUrl + "'>View Game Page</a></b>";
      return str;
    },
    function(playerName, ownerName, newlySeatedName){
      var yourText = recipientIsOwner ? "your" : (ownerName + "'s");
      return playerName + " just left " + yourText + " game on " + game.dateString + ". Currently " + game.filledSeats + "/" + game.seats + " seats are filled.";
    },
    function(){});
}

exports.notifyMovedOffWaitlist = function(game, playerId, callback){
  if(!game || !playerId) return;

  game = game.toJSON();
  userRepo.getUserWithPlayerPool(playerId, function(err1, player){
    if(err1){
      callback(err1);
      return;
    }
    userRepo.getUserWithPlayerPool(game.owner, function(err2, owner){
      if(err2){
        callback(err2);
        return;
      }

      var theSubject = "You're off the Waitlist!";
      var theHtml = "You have been moved off of the waitlist for " + owner.name + "'s poker game on " + game.dateString;
      theHtml += "<br><br><b><a href='" + config.baseUrl + game.joinGameUrl + "'>View Game Page</a></b>";
      var theText = "You have been moved off of the waitlist for " + owner.name + "'s poker game on " + game.dateString;
      exports.sendSingleEmail(player.email, theSubject, theHtml, theText, function(){});
    });
  });
}

var sendNotificationEmail = function(recipientId, playerId, subject, html, text, callback){
  if(!recipientId || !playerId) return;
  userRepo.getUserWithPlayerPool(recipientId, function(err1, recipient){
    if(err1){
      callback(err);
      return;
    }
    userRepo.getUserWithPlayerPool(playerId, function(err2, player){
      if(err2){
        callback(err2);
        return;
      }

      var theSubject = extractText(subject, player.name);
      var theHtml = extractText(html, player.name);
      var theText = extractText(text, player.name);
      exports.sendSingleEmail(recipient.email, theSubject, theHtml, theText, function(){});
    });
  });
}

var sendPlayerNotificationEmail = function(recipientId, playerId, ownerId, subject, html, text, callback){
  if(!recipientId || !playerId) return;
  userRepo.getUserWithPlayerPool(recipientId, function(err1, recipient){
    if(err1){
      callback(err);
      return;
    }
    userRepo.getUserWithPlayerPool(playerId, function(err2, player){
      if(err2){
        callback(err2);
        return;
      }

      userRepo.getUserWithPlayerPool(ownerId, function(err3, owner){
        if(err3){
          callback(err3);
          return;
        }

        var theSubject = extractText(subject, player.name, owner.name);
        var theHtml = extractText(html, player.name, owner.name);
        var theText = extractText(text, player.name, owner.name);
        exports.sendSingleEmail(recipient.email, theSubject, theHtml, theText, function(){});
      });
    });
  });
}

var sendCancelNotificationEmail = function(recipientId, playerId, ownerId, newlySeatedId, subject, html, text, callback){
  if(!recipientId || !playerId) return;
  userRepo.getUserWithPlayerPool(recipientId, function(err1, recipient){
    if(err1){
      callback(err);
      return;
    }
    userRepo.getUserWithPlayerPool(playerId, function(err2, player){
      if(err2){
        callback(err2);
        return;
      }

      userRepo.getUserWithPlayerPool(ownerId, function(err3, owner){
        if(err3){
          callback(err3);
          return;
        }

        userRepo.getUserWithPlayerPool(newlySeatedId, function(err4, newlySeatedPlayer){
          if(err4){
            callback(err4);
            return;
          }

          newlySeatedPlayer = newlySeatedPlayer || {};

          var theSubject = extractText(subject, player.name, owner.name, newlySeatedPlayer.name);
          var theHtml = extractText(html, player.name, owner.name, newlySeatedPlayer.name);
          var theText = extractText(text, player.name, owner.name, newlySeatedPlayer.name);
          exports.sendSingleEmail(recipient.email, theSubject, theHtml, theText, function(){});
        });
      });
    });
  });
}

var extractText = function(input, playerName, ownerName, newlySeatedPlayer){
  return typeof input == "function" ? input(playerName, ownerName, newlySeatedPlayer) : input;
}

exports.sendSingleEmail = function(address, subject, html, text, callback){
  if(config.dev){
    //don't send mails from dev, it costs us
    console.log("Email would be sent -- address: " + address + " -- subject: " + subject + " -- html: " + html + " -- text: " + text);
    callback("No emails from dev");
    return;
  }

  var email = generateMailOptions(address, subject, html, text);
  callback = callback || function(){};
  sendgrid.send(email, function(err, info){
    if(err){
      console.log(err);
      callback(err);
    } else{
      callback(null, info);
    }
  });
}

var setGameUrls = function(html, gameId){
  //Need an HTML parser, find links with name="join-link" and name="page-link" and append the HREF with gameId and autoJoin=true for join link
  return html;
}

var generateMailOptions = function(address, subject, html, text){
  var opts = baseMailOptions;

  opts.to = address;
  opts.subject = subject;
  opts.text = text;
  opts.html = html;

  var email = new sendgrid.Email(opts);
  return email;
}
