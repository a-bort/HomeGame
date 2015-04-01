var mongoose = require('mongoose');

var seatSchema = new mongoose.Schema({
    ownerId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    active: { type: Boolean, default: true }
});

var gameSchema = new mongoose.Schema({
    gameTemplateId: mongoose.Schema.Types.ObjectId,
    ownerId: mongoose.Schema.Types.ObjectId,
	  game: String,
    location: String,
    stakes: String,
    seats: [seatSchema],
    waitList: [seatSchema],
    gameFormat: String,
    date: Date,
    time: String,
    notes: String,
    active: { type: Boolean, default: true }
});

var game = mongoose.model('Game', gameSchema);
var seat = mongoose.model('Seat', seatSchema);

exports.game = game;
exports.seat = seat;