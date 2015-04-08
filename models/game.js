var mongoose = require('mongoose');

var seatSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    active: { type: Boolean, default: true }
});

var gameSchema = new mongoose.Schema({
    gameTemplateId: mongoose.Schema.Types.ObjectId,
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
	gameType: String,
    location: String,
    stakes: String,
    seats: Number,
    seatCollection: [seatSchema],
    waitListCollection: [seatSchema],
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