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

exports.seatTypes = ['player', 'waitlist', 'viewer'];

var seatSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    active: { type: Boolean, default: true }, //deprecated
    created: { type: Date, default: new Date()},
    name: { type: String },
    type: { type: String, enum: exports.seatTypes},
    notifyOnJoin: { type: Boolean },
    notifyOnThreshold: { type: Boolean },
    notifyOnComment: { type: Boolean },
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
    viewerCollection: [seatSchema],
    gameFormat: String,
    date: Date,
    time: Date,
    notes: String,
    seatHost: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    commentNotifications: { type: Boolean, default: false },
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
    if(seat.user || seat.name){
      count++;
    }
  }
  return count;
});

gameSchema.virtual('emptySeats').get(function(){
  return this.seats - this.filledSeats;
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

gameSchema.methods.userIsSeated = function(userId){
  for(var i = 0; i < this.seatCollection.length; i++){
    var seat = this.seatCollection[i];
    if(seat.active && seat.user && (seat.user._id || seat.user).equals(userId)){
      return true;
    }
  }
  for(var i = 0; i < this.waitListCollection.length; i++){
    var seat = this.waitListCollection[i];
    if(seat.active && seat.user && (seat.user._id || seat.user).equals(userId)){
      return true;
    }
  }
  return false;
};

gameSchema.methods.userIsViewer = function(userId){
  for(var i = 0; i < this.viewerCollection.length; i++){
    var viewer = this.viewerCollection[i];
    if(viewer.user._id.equals(userId)){
      return true;
    }
  }
  return false;
}

gameSchema.methods.addViewer = function(userId, seat){
  seat = seat ? seat : new exports.seat({
    user: userId,
    notifyOnJoin: false,
    notifyOnComment: false
  });
  seat.type = 'viewer';
  this.viewerCollection.push(seat);
}

gameSchema.methods.extractViewerByUserId = function(userId){
  if(userId == null) return null;

  var idx = -1;
  for(var i = 0; i < this.viewerCollection.length; i++){
    var viewer = this.viewerCollection[i];
    if(viewer.user._id.equals(userId)){
      idx = i;
      break;
    }
  }
  if(idx >= 0){
    return this.viewerCollection.splice(idx, 1)[0];
  }
  return null;
}

gameSchema.methods.extractSeatById = function(seatId){
  if(seatId == null) return null;

  var idx = -1;
  for(var i = 0; i < this.seatCollection.length; i++){
    var seat = this.seatCollection[i];
    if(seat._id.equals(seatId)){
      idx = i;
      break;
    }
  }
  if(idx >= 0){
    return this.seatCollection.splice(idx, 1)[0];
  }

  for(var i = 0; i < this.waitListCollection.length; i++){
    var seat = this.waitListCollection[i];
    if(seat._id.equals(seatId)){
      idx = i;
      break;
    }
  }
  if(idx >= 0){
    return this.waitListCollection.splice(idx, 1)[0];
  }

  return null;
};

gameSchema.methods.configureSeatsAfterCancellation = function(){
  if(this.emptySeats && this.waitListCollection.length > 0){
    for(var i = 0; i < this.emptySeats; i++){
      var seat = this.waitListCollection.splice(0, 1)[0];
      this.seatCollection.push(seat);
      return seat;
    }
  }
  return null;
}

var game = mongoose.model('Game', gameSchema);
var seat = mongoose.model('Seat', seatSchema);
var comment = mongoose.model('Comment', commentSchema);

exports.game = game;
exports.seat = seat;
exports.comment = comment;
