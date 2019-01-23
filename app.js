
/**
 * Module dependencies.
 */

var config = require('./config/config')

  , express = require('express')
  , app = express()
  , port = process.env.PORT || config.port
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

var uri = config.dbUri;

var db = mongoose.connect(uri);

require('./config/passport')(passport); // pass passport for configuration

// all environments
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser());

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

//passport setup
app.use(session({
	secret: config.passportSecret,
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//force https
app.use (function (req, res, next) {
  if (config.dev || (req.connection && req.connection.encrypted)) {
    // request was via https, so do no special handling
    next();
  } else {
    // request was via http, so redirect to https
    res.redirect('https://' + req.headers.host + req.url);
  }
});

//routes
require('./routes.js')(app, passport);

app.listen(port);
console.log("Listening on " + port);
