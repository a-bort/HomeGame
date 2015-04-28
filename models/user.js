var mongoose = require('mongoose');

var playerSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  confirmed: { type: Boolean, default: false },
  blocked: { type: Boolean, default: false}
});

var userSchema = new mongoose.Schema({
  id: String,
  token: String,
  email: String,
  name: String,
  active: { type: Boolean, default: true },
  playerPool: [playerSchema]
});

module.exports = mongoose.model('User', userSchema);