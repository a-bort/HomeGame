var feedbackModel = require('../models/feedback').feedback;

exports.submitFeedback = function(feedback, userId, callback){
  var obj = {feedback: feedback};
  
  if(userId){
    obj.userId = userId;
  }
  
  var f = new feedbackModel(obj);
  f.save(function(err){
    if(err){
      console.log(err);
    }
    callback(err);
  });
}