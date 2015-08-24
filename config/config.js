exports.fbCallback = process.env.FB_CALLBACK;
exports.fbClientId = process.env.FB_CLIENT_ID;
exports.fbClientSecrect = process.env.FB_CLIENT_SECRET;

exports.googleCallback = process.env.GOOGLE_CALLBACK;
exports.googleClientId = process.env.GOOGLE_CLIENT_ID;
exports.googleClientSecrect = process.env.GOOGLE_CLIENT_SECRET;

exports.dbUri = process.env.MONGOLAB_URI;
exports.port = process.env.PORT;
exports.passportSecret = process.env.PASSPORT_SECRET;

exports.baseMailOptions = {
  from: 'Homegame Alerts <noreply@homegame.a-bort.com>'
}

exports.gmailUser = process.env.GMAIL_USER;
exports.gmailPass = process.env.GMAIL_PASS;