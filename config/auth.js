var config = require('./config');

module.exports = {

    facebookAuth : {
        'clientID'      : config.fbClientId, // your App ID
        'clientSecret'  : config.fbClientSecrect, // your App Secret
        'callbackURL'   : config.fbCallback
    },
    
    googleAuth : {
        'clientID'      : config.googleClientId, // your App ID
        'clientSecret'  : config.googleClientSecrect, // your App Secret
        'callbackURL'   : config.googleCallback
    }

};