var mongoose = require('mongoose');

var seatSchema = new mongoose.Schema({
    ownerId: ObjectId,
    userId: ObjectId,
    active: { type: Boolean, default: true }
});

var gameSchema = new mongoose.Schema({
    gameTemplateId: ObjectId,
    ownerId: ObjectId,
	  location: String,
    stakes: String,
    seats: [seatSchema],
    waitList: [seatSchema],
    gameType: String,
    date: Date,
    time: String,
    notes: String,
    active: { type: Boolean, default: true }
});

var game = mongoose.model('Game', gameSchema);
var seat = mongoose.model('Seat', seatSchema);

exports.game = game;
exports.seat = seat;