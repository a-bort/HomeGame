var userModel = require('../models/user').user;

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