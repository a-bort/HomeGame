var config = require('../config/config');
var baseMailOptions = config.baseMailOptions;

var sendgrid = require('sendgrid')(config.emailUser, config.emailPass);

var userRepo = require('../data/userRepository');

exports.emailPlayerPool = function(user, gameId, subject, html, text, callback){
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

    for(var i = 0; i < user.playerPool.length; i++){
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

exports.notifyOwnerOnJoin = function(game, playerId, joinedWaitlist){
  if(!game || !playerId){ return; }
  game = game.toJSON();
  sendNotificationEmail(game, playerId,
    function(name){
      return name + " has joined " + (joinedWaitlist ? "the waitlist for " : "")  + "your game";
    },
    function(name){
      var str = name + "&nbsp;joined your poker game! (" + game.dateString + ")";
      str = str + "<br><br>Currently <b>" + game.filledSeats + "/" + game.seats + "</b>&nbsp;seats are filled.";
      str = str + "<br><br><b><a href='" + config.baseUrl + game.joinGameUrl + "'>View Game Page</a></b>";
      return str;
    },
    function(name){
      return name + " just joined your game (" + game.date + "). Currently " + game.filledSeats + "/" + game.seats + " seats are filled.";
    },
    function(){});
}

exports.notifyOnCancel = function(game, playerId){
  game = game.toJSON();
  sendNotificationEmail(game, playerId,
    function(name){
      return name + " has left your game";
    },
    function(name){
      var str = name + "&nbsp;cancelled their reservation for your poker game. (" + game.dateString + ")";
      str = str + "<br><br>Currently <b>" + game.filledSeats + "/" + game.seats + "</b>&nbsp;seats are filled.";
      str = str + "<br><br><b><a href='" + config.baseUrl + game.joinGameUrl + "'>View Game Page</a></b>";
      return str;
    },
    function(name){
      return name + " just left your game on " + game.date + ". Currently " + game.filledSeats + "/" + game.seats + " seats are filled.";
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

var sendNotificationEmail = function(game, playerId, subject, html, text, callback){
  if(!game || !playerId) return;
  userRepo.getUserWithPlayerPool(game.owner, function(err1, owner){
    if(err1){
      callback(err);
      return;
    }
    userRepo.getUserWithPlayerPool(playerId, function(err2, player){
      if(err2){
        callback(err);
        return;
      }

      var theSubject = extractText(subject, player.name);
      var theHtml = extractText(html, player.name);
      var theText = extractText(text, player.name);
      exports.sendSingleEmail(owner.email, theSubject, theHtml, theText, function(){});
    });
  });
}

var extractText = function(input, playerName){
  return typeof input == "function" ? input(playerName) : input;
}

exports.sendSingleEmail = function(address, subject, html, text, callback){
  if(config.dev){
    //don't send mails from dev, it costs us
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
