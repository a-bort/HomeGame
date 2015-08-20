var mongoose = require('mongoose');
var dateTimeFormatter = require('../util/dateTimeFormatter');

var schemaOptions = {
  toObject: {
    virtuals: true
  }
  ,toJSON: {
    virtuals: true
  }
};

var seatSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    active: { type: Boolean, default: true },
    created: { type: Date, default: new Date()}
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
    time: Date,
    notes: String,
    active: { type: Boolean, default: true }
}, schemaOptions);

gameSchema.virtual('dateString').get(function(){
  return dateTimeFormatter.formatDateString(this.date);
});

gameSchema.virtual('timeString').get(function(){
  return dateTimeFormatter.formatTimeString(this.time);
});

gameSchema.virtual('pastGame').get(function(){
  var now = new Date();
  var today = new Date(now.toDateString());
  var gameDate = new Date(this.date.toDateString());
  
  return gameDate < today;
});

gameSchema.virtual('filledSeats').get(function(){
  var count = 0;
  for(var i = 0; i < this.seatCollection.length; i++){
    var seat = this.seatCollection[i];
    if(seat.user && seat.active){
      count++;
    }
  }
  return count;
});

gameSchema.virtual('emptySeats').get(function(){
  var count = 0;
  for(var i = 0; i < this.seatCollection.length; i++){
    var seat = this.seatCollection[i];
    if(!seat.user && seat.active){
      count++;
    }
  }
  return count;
});

gameSchema.virtual('multiSeats').get(function(){
  return this.emptySeats > 1 || this.emptySeats == 0;
});

gameSchema.virtual('joinGameUrl').get(function(){
  return "/join/" + this._id;
});

gameSchema.virtual('editGameUrl').get(function(){
  return "/host/" + this._id;
});

var game = mongoose.model('Game', gameSchema);
var seat = mongoose.model('Seat', seatSchema);

exports.game = game;
exports.seat = seat;