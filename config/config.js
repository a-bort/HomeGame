var dev = true;

exports.fbCallback = dev ? 'http://localhost:3000/auth/facebook/callback' : 'http://homegame.a-bort.com/auth/facebook/callback';

exports.dbUri = dev ? 'localhost/homegame' : 'mongodb://homegame_user:tensfull0fsevens@ds053877.mongolab.com:53877/heroku_app36004460';

exports.port = process.env.PORT || 3000;

exports.passportSecret = 'tensfull0fsevens';
