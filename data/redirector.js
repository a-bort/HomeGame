exports.getRedirectUrlFromLogin = function(req){
  var redirect = req.flash('redirect');
  return redirectUrl = redirect.length ? decodeURIComponent(redirect[0]) : '/mygames';
}