var userModel = require('../models/user').user;

exports.getSharedData = function(req, callback){
  if(req.user){
    userModel.findOne({_id: req.user._id}, function(err, user){
      if(err || !user){
        defaultCallback(callback);
      }
      callback({email: user.email, showEmailPrompt: !user.emailUpdatePrompted});
    });
    return;
  }
  callback({
    email: "",
    showEmailPrompt: false
  });
}

function defaultCallback(callback){
  callback({
    email: "",
    showEmailPrompt: false
  });
}