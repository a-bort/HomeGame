var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    id: String,
    name: String,
    active: { type: Boolean, default: true }
});

var user = mongoose.model('user', alertSchema)

module.exports = user;