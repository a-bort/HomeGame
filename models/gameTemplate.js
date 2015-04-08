var mongoose = require('mongoose');

var gameTemplateSchema = new mongoose.Schema({
    userId: ObjectId,
	location: String,
    stakes: String,
    seats: Number,
    gameType: String,
    time: String,
    notes: String,
    active: { type: Boolean, default: true }
});

module.exports = mongoose.model('GameTemplate', gameTemplateSchema);