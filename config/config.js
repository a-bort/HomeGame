exports.fbCallback = process.env.FB_CALLBACK;
exports.dbUri = process.env.MONGOLAB_URI;
exports.port = process.env.PORT;
exports.passportSecret = process.env.PASSPORT_SECRET;

exports.baseMailOptions = {
  from: 'Homegame Alerts <noreply@homegame.a-bort.com>'
}

exports.gmailUser = process.env.GMAIL_USER;
exports.gmailPass = process.env.GMAIL_PASS;