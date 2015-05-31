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

exports.emailPlayerPool = function(user, subject, html, text, callback){
  userRepo.getUserWithPlayerPool(user._id, function(err, user){
    if(err){
      callback(err);
      return;
    }
    
    for(var i = 0; i < user.playerPool.length; i++){
      var player = user.playerPool[i];
      
      var email = player.user ? player.user.email : null;
      if(email){
        exports.sendSingleEmail(email, subject, html, text, callback);
      } else{
        console.log("Bad email logic");
      }
    }
    callback(null);
  });
}

exports.sendSingleEmail = function(address, subject, html, text, callback){
  var opts = generateMailOptions;
  callback = callback || function(){};
  
  transporter.sendMail(mailOptions, function(err, info){
    if(err){
      console.log(err);
      callback(err);
    }
    callback(null, info);
  });
}

var generateMailOptions = function(address, subject, html, text){
  var opts = baseMailOptions;
  
  opts.to = address;
  opts.subject = subject;
  opts.text = text;
  opts.html = html;
  
  return opts;
}