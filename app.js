
/**
 * Module dependencies.
 */

var express = require('express')
  , app = express()
  , port = process.env.PORT || 3000
  , path = require('path')
  , mongoose = require('mongoose')
  , passport = require('passport')
  , flash = require('connect-flash')
  
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , session = require('express-session')
  
  , favicon = require('serve-favicon');

//public path
app.use(express.static(path.join(__dirname, 'public')));

 //view stuff
app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));

var uri = 'localhost';
//var uri = 'mongodb://homegame_app:tensfullofseven@ds061721.mongolab.com:61721/heroku_app36004460';

var db = mongoose.connect(uri, 'homegame');

require('./config/passport')(passport); // pass passport for configuration

// all environments
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser());

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

//passport setup
app.use(session({ 
	secret: 'tensfullofsevens',
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//routes
require('./routes.js')(app, passport);

app.listen(port);
console.log("Listening on " + port);
