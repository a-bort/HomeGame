var FacebookStrategy = require('passport-facebook').Strategy;

var User = require('../models/user');

var configAuth = require('./auth');

module.exports = function(passport){

	// used to serialize the user for the session
    passport.serializeUser(function(user, done) {
		console.log('serialize');
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
	    console.log('deserialize');
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
			    console.log('Next tick');
				// find the user in the database based on their facebook id
				User.findOne({ 'id' : profile.id }, function(err, user) {

					// if there is an error, stop everything and return that
					// ie an error connecting to the database
					console.log('Finding user');
					if (err){
						console.log('error finding user');
						return done(err);
					}

					// if the user is found, then log them in
					if (user) {
						console.log('found user');
						return done(null, user); // user found, return that user
					} else {
						// if there is no user found with that facebook id, create them
						console.log('creating new user');
						var newUser            = new User();

						// set all of the facebook information in our user model
						newUser.id    = profile.id; // set the users facebook id                   
						newUser.token = token; // we will save the token that facebook provides to the user                    
						newUser.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
						newUser.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

						// save our user to the database
						console.log('saving new user');
						newUser.save(function(err) {
							if (err){
								console.log('error saving new user');
							   throw err;
							}
							console.log('new user saved');
							// if successful, return the new user
							return done(null, newUser);
						});
					}

				});
			});

		})
	);

}