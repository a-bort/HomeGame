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
  fromname: 'Homegame Alerts',
  from: 'noreply@homegame.a-bort.com'
}

exports.dev = process.env.DEV;
exports.emailUser = process.env.SENDGRID_USERNAME;
exports.emailPass = process.env.SENDGRID_PASSWORD;

exports.baseUrl = process.env.BASE_URL || "homegame.a-bort.com";
