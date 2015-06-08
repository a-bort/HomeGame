var config = require('../config/config');
var baseMailOptions = config.baseMailOptions;

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: config.gmailUser,
    pass: config.gmailPass
  }
});

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

exports.sendSingleEmail = function(address, subject, html, text, callback){
  var opts = generateMailOptions(address, subject, html, text);
  callback = callback || function(){};

  transporter.sendMail(opts, function(err, info){
    if(err){
      console.log(err);
      callback(err);
    }
    callback(null, info);
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

  return opts;
}
