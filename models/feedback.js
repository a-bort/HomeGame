var mongoose = require('mongoose');

var feedbackSchema = new mongoose.Schema({
  userId: {required: false, type: mongoose.Schema.Types.ObjectId},
  feedback: String
});

exports.feedback = mongoose.model('Feedback', feedbackSchema);