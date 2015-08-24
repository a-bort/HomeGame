var userModel = require('../models/user').user;

exports.getUserWithPlayerPool = function(userId, callback){
  var conditions = { _id: userId };
  
  userModel.findOne(conditions).populate('playerPool.user').exec(function(err, user){
    callback(err, user)
  });
}

exports.updateUser = function(user, callback){
  var conditions = { _id: user._id },
         update = { $set: {customName: user.customName, email: user.email} };
  
  userModel.update(conditions, update, {}, callback);
}

exports.updateUserEmail = function(user, email, callback){
  var conditions = { _id: user._id },
         update = { $set: {emailUpdatePrompted: true} };
  
  if(email){
    update.$set.email = email;
  }
  
  userModel.update(conditions, update, {}, callback);
}

exports.setUserDataAfterLogin = function(user, dataToSet, callback){
  var conditions = { _id: user._id };
  var update = { $set: null};
  
  if((dataToSet.isFacebook && !user.isFacebook) || (dataToSet.isGoogle && !user.isGoogle)){
    update.$set = {};
  
    update.$set.isFacebook = dataToSet.isFacebook;
    update.$set.isGoogle = dataToSet.isGoogle;
  } 
  if(dataToSet.googleImage && !user.googleImage){
    update.$set = update.$set || {};
  
    update.$set.googleImage = dataToSet.googleImage;
  }
  
  if (update.$set){
    userModel.update(conditions, update, {}, function(err){
      callback(err, user);
    });
  }
  else{
    callback(null, user);
  }
}