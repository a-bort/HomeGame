module.exports = function(app, passport) {

  // Utility Classes
  var gameRepo = require('./data/gameRepository');
  var seatRepo = require('./data/seatRepository');

    // ============================
    // FB AUTH
    // ============================
    
    app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email'}));
    
    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
      successRedirect: '/mygames',
      failureRedirect: '/'
    }));
    
    // ================
    // Default Redirect
    // ================
    
    function defaultRedirect(res){
      res.redirect('/mygames');
    }
    
    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
		if (req.isAuthenticated()){
		  defaultRedirect(res);
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

    // ================
    // VIEW GAMES
    // =================
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
    
    // ======================
    // JOIN GAMES
    // ======================
    
    app.get('/join/:gameId', isLoggedIn, function(req, res) {
      gameRepo.getGameById(req.params.gameId, function(err, game){
        res.render('joinGame', {
            title: "Join a Game",
            user : req.user,
            game : game,
            userAttending : gameRepo.isUserPlayingInGame(req.user._id, game)
        });
      });
    });
    
    app.get('/join', isLoggedIn, function(req, res) {
      defaultRedirect(res);
    });
    
    app.post('/join', isLoggedIn, function(req, res){
      var gameId = req.body.gameId;
      seatRepo.seatUserInGame(gameId, req.user, function(err){
          if(err){
              res.json({error: err});
          } else{
              res.json({success: true});
          }
      });
    }); 
    
	  // =====================================
    // HOST A GAME
    // =====================================
    
    app.get('/host', isLoggedIn, function(req, res) {
      res.render('hostGame', {
			title: "Host a Game",
            user : req.user
        });
    });
    
    app.get('/host/:gameId', isLoggedIn, function(req, res) {
      gameRepo.getGameById(req.params.gameId, function(err, game){
        if(game.owner._id .equals(req.user._id)){
          res.render('hostGame', {
            title: "Host a Game",
            user : req.user,
            game: game
          });
        } 
        else{
          defaultRedirect(res);
        }
      });
    });
    
    app.post('/host/saveGame', isLoggedIn, function(req, res){
      gameRepo.saveGame(req.body, req.user, function(err){
        if(err){
          res.json({error: err});
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