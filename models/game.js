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
    created: { type: Date, default: new Date()},
    name: { type: String },
    notifyOnJoin: { type: Boolean },
    notifyOnThreshold: { type: Boolean },
    guestSeatsAdded: [{ type: mongoose.Schema.Types.ObjectId }]
});

var commentSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    date: { type: Date, default: new Date() },
    text: String
}, schemaOptions);

commentSchema.virtual('dateString').get(function(){
  return dateTimeFormatter.formatDateString(this.date);
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
    emailNotifications: { type: Boolean, default: true },
    dayOfNotification: { type: Boolean, default: false },
    allowedGuests: { type: Number, default: 0 },
    targetFilledSeats: Number,
    cancelled: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    comments: [commentSchema]
}, schemaOptions);

gameSchema.virtual('dateString').get(function(){
  return dateTimeFormatter.formatDateString(this.date);
});

gameSchema.virtual('timeString').get(function(){
  return dateTimeFormatter.formatTimeString(this.time);
});

gameSchema.virtual('pastGame').get(function(){
  if(!this.date) return false;
  var now = new Date();
  var today = new Date(now.toDateString());
  var gameDate = new Date(this.date.toDateString());

  return gameDate < today;
});

gameSchema.virtual('filledSeats').get(function(){
  var count = 0;
  for(var i = 0; i < this.seatCollection.length; i++){
    var seat = this.seatCollection[i];
    if((seat.user || seat.name) && seat.active){
      count++;
    }
  }
  return count;
});

gameSchema.virtual('emptySeats').get(function(){
  var count = 0;
  for(var i = 0; i < this.seatCollection.length; i++){
    var seat = this.seatCollection[i];
    if(!seat.user && !seat.name && seat.active){
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
var comment = mongoose.model('Comment', commentSchema);

exports.game = game;
exports.seat = seat;
exports.comment = comment;
