var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    id: String,
	token: String,
	email: String,
    name: String,
    active: { type: Boolean, default: true }
});

module.exports = mongoose.model('User', userSchema);