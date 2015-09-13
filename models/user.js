var mongoose = require('mongoose');

var schemaOptions = {
  toObject: {
    virtuals: true
  }
  ,toJSON: {
    virtuals: true
  }
};

var playerSchema = new mongoose.Schema({
  user: {required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  confirmed: { type: Boolean, default: false },
  blocked: { type: Boolean, default: false}
});

var userSchema = new mongoose.Schema({
  id: String,
  token: String,
  email: String,
  name: String,
  customName: String,
  active: { type: Boolean, default: true },
  playerPool: [playerSchema],
  emailUpdatePrompted: { type: Boolean, default: false },
  isFacebook: Boolean,
  isGoogle: Boolean,
  googleImage: String
}, schemaOptions);

userSchema.virtual('displayName').get(function(){
  return this.customName || this.name;
});

userSchema.virtual('imageUrl').get(function(){
  if(this.isFacebook){
    return "http://graph.facebook.com/" + this.id + "/picture?type=square";
  } else if(this.isGoogle && this.googleImage){
    return this.googleImage;
  } else{
    return "/images/anon-user.png";
  }
});

exports.user = mongoose.model('User', userSchema);
exports.player = mongoose.model('Player', playerSchema);
