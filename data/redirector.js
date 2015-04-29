exports.getRedirectUrlFromLogin = function(req){
  var redirect = req.flash('redirect');
  return redirectUrl = redirect.length ? decodeURIComponent(redirect[0]) : '/mygames';
}

exports.defaultRedirect = function (res){
  res.redirect('/mygames');
}
    
exports.redirectToUrlParam = function(url){
  console.log(url);
}