module.exports = function(app, passport) {

  // Utility Classes
  var gameRepo = require('./data/gameRepository');

    // ============================
    // FB AUTH
    // ============================
    
    app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email'}));
    
    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }));
    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
		if (req.isAuthenticated()){
		  res.redirect('/profile');
		} else{
		  res.render('index', {title: "Home Game", message: req.flash('message')});
		}
    });

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
      res.render('profile', {
			title: "Home Game - " + req.user.name,
            user : req.user
        });
    });

    app.get('/mygames', isLoggedIn, function(req, res) {
      gameRepo.getGamesByOwner(req.user._id, function(ownedGames){
        gameRepo.getGamesByPlayer(req.user._id, function(playerGames){
          res.render('myGames', {
          title: "My Games",
                user : req.user,
                ownedGames: ownedGames,
                playerGames: playerGames
            });
        });
      });
    });
    
    app.get('/host', isLoggedIn, function(req, res) {
      res.render('hostGame', {
			title: "Host a Game",
            user : req.user
        });
    });
    
    app.get('/join/:gameId', isLoggedIn, function(req, res) {
      gameRepo.getGameById(req.params.gameId, function(err, game){
        res.render('joinGame', {
            title: "Join a Game",
            user : req.user,
            game : game
        });
      });
    });
    
    app.get('/join', isLoggedIn, function(req, res) {
      res.redirect('/profile');
    });
	
	  // =====================================
    // HOST A GAME
    // =====================================
    
    app.post('/host/saveGame', isLoggedIn, function(req, res){
      gameRepo.saveGame(req.body, req.user, function(err){
        if(err){
          res.json({error: error});
        } else{
          res.json({success: true});
        }
      });
    });
	
    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.flash('message', 'Logout Successful');
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}