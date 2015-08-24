var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var User = require('../models/user').user;
var userRepo = require('../data/userRepository');

var configAuth = require('./auth');

module.exports = function(passport){

	// used to serialize the user for the session
  passport.serializeUser(function(user, done) {
      done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
      User.findOne({id: id}, function(err, user) {
          done(err, user);
      });
  });
	
	passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
			clientID        : configAuth.facebookAuth.clientID,
			clientSecret    : configAuth.facebookAuth.clientSecret,
			callbackURL     : configAuth.facebookAuth.callbackURL

		},
		
		function(token, refreshToken, profile, done) {

			// asynchronous
			process.nextTick(function() {
				// find the user in the database based on their facebook id
				User.findOne({ 'id' : profile.id }, function(err, user) {

					// if there is an error, stop everything and return that
					// ie an error connecting to the database
					if (err){
						return done(err);
					}

					// if the user is found, then log them in
					if (user) {
            return userRepo.setUserDataAfterLogin(user, {isFacebook: true, isGoogle: false}, done) //ensure its marked as facebook login
					} else {
						// if there is no user found with that facebook id, create them
						var newUser            = new User();

						// set all of the facebook information in our user model
						newUser.id    = profile.id; // set the users facebook id                   
						newUser.token = token; // we will save the token that facebook provides to the user                    
						newUser.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
						newUser.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
            newUser.isFacebook = true;

						// save our user to the database
						newUser.save(function(err) {
							if (err){
							   throw err;
							}
							// if successful, return the new user
							return done(null, newUser);
						});
					}

				});
			});

		})
	);

  passport.use(new GoogleStrategy({

        // pull in our app id and secret from our auth.js file
			clientID        : configAuth.googleAuth.clientID,
			clientSecret    : configAuth.googleAuth.clientSecret,
			callbackURL     : configAuth.googleAuth.callbackURL

		},
		
		function(token, refreshToken, profile, done) {

			// asynchronous
			process.nextTick(function() {
				// find the user in the database based on their facebook id
				User.findOne({ 'id' : profile.id }, function(err, user) {

					// if there is an error, stop everything and return that
					// ie an error connecting to the database
					if (err){
						return done(err);
					}
					// if the user is found, then log them in
					if (user) {
						return userRepo.setUserDataAfterLogin(user, {isFacebook: false, isGoogle: true, googleImage: profile._json.image.url}, done) //ensure its marked as google login
					} else {
						// if there is no user found with that google id, create them       
            var newUser            = new User();

						// set all of the google information in our user model
						newUser.id    = profile.id; // set the users google id                   
						newUser.token = token; // we will save the token that google provides to the user                    
						newUser.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
						newUser.email = profile.emails[0] ? profile.emails[0].value : ""; // google can return multiple emails so we'll take the first
            newUser.isGoogle = true;
            
						// save our user to the database
						newUser.save(function(err) {
							if (err){
							   throw err;
							}
							// if successful, return the new user
							return done(null, newUser);
						});
					}

				});
			});

		})
	);
  
}