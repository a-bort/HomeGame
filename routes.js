module.exports = function(app, passport) {

  // Utility Classes
  var gameRepo = require('./data/gameRepository');
  var seatRepo = require('./data/seatRepository');
  var userRepo = require('./data/userRepository');
  var sharedRepo = require('./data/sharedRepository');
  var feedbackRepo = require('./data/feedbackRepository');
  var redirector = require('./data/redirector');
  var authorization = require('./data/authorization');
  
  
    // ============================
    // FB AUTH
    // ============================
    
    app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email'}));
    
    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
      failureRedirect: '/'
    }), function(req, res){
      var redirectUrl = redirector.getRedirectUrlFromLogin(req);
      res.redirect(redirectUrl);
    });
    
    // ==============================
    // GLOBAL FILTER
    // ==============================
    
    app.all('*', function(req, res, next){
      sharedRepo.getSharedData(req, function(data){
        res.locals.sharedModel = data;
        next();
      });
    });
    
    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
		if (req.isAuthenticated()){
		  redirector.defaultRedirect(res);
		} else{
		  res.render('index', {title: "Home Game", message: req.flash('message')});
		}
    });
    
    app.get('/redirect/:redirectUrl', function(req, res) {
		if (req.isAuthenticated()){
		  redirector.redirectToUrlParam(req.params.redirectUrl);
		} else{
      req.flash('redirect', req.params.redirectUrl);
		  res.render('index', {title: "Home Game", message: req.flash('message')});
		}
    });

    app.get('/logout', function(req, res){
      req.logout();
      res.redirect('/');
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

    app.post('/profile', isLoggedIn, function(req, res){
      var user = req.body.userModel;
      userRepo.updateUser(user, function(err){
        if(err){
          res.json({error: err});
        } else{
          res.json({success: true});
        }
      });
    });
    
    app.post('/updateEmail', isLoggedIn, function(req, res){
      var email = req.body.email;
      userRepo.updateUserEmail(req.user, email, function(err){
        if(err){
          res.json({error: err});
        } else{
          res.json({success: true});
        }
      });
    });
    // ================
    // VIEW GAMES
    // =================
    app.get('/mygames', isLoggedIn, function(req, res) {
      gameRepo.getGamesByOwner(req.user._id, function(ownedGames){
        gameRepo.getGamesByPlayer(req.user._id, function(playerGames){
          gameRepo.getWaitlistedGames(req.user._id, function(waitlistedGames){
            res.render('myGames', {
                  title: "My Games",
                  user : req.user,
                  ownedGames: ownedGames,
                  playerGames: playerGames,
                  waitlistedGames: waitlistedGames
              });
          });
        });
      });
    });
    
    app.post('/mygames/leave', isLoggedIn, function(req, res) {
      gameRepo.leaveGame(req.body.gameId, req.user._id, function(err){
        if(err){
          res.json({error: err});
        } else{
          res.json({success: true});
        }
      });
    });
    
    // ======================
    // JOIN GAMES
    // ======================
    
    app.get('/join/:gameId', isLoggedIn, authorization.userAuthorizedForGame, function(req, res) {
      var autoJoin = !!req.query.autoJoin;
      gameRepo.getGameById(req.params.gameId, function(err, game){
        if(err || !game){
          redirector.defaultRedirect(res);
          return;
        }
        res.render('joinGame', {
            title: "Join a Game",
            user : req.user,
            game : game,
            autoJoin: autoJoin,
            userAttending : gameRepo.isUserRegisteredForGame(req.user._id, game)
        });
      });
    });
    
    app.get('/join', isLoggedIn, function(req, res) {
      redirector.defaultRedirect(res);
    });
    
    app.post('/join', isLoggedIn, authorization.userAuthorizedForGame, function(req, res){
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
          redirector.defaultRedirect(res);
        }
      });
    });
    
    app.post('/host/saveGame', isLoggedIn, function(req, res){
      gameRepo.saveGame(req.body, req.user._id, function(err){
        if(err){
          res.json({error: err});
        } else{
          res.json({success: true});
        }
      });
    });
	
    // =====================================
    // ABOUT ==============================
    // =====================================
    app.get('/about', function(req, res) {
        res.render('about', {
          title: "About Home Game"
        });
    });
    
    app.post('/feedback', function(req, res){
      var feedback = req.body.feedback;
      var userId = null;
      if(req.user){
        userId = req.user._id;
      }
      
      console.log(feedback);
      console.log(userId);
      
      feedbackRepo.submitFeedback(feedback, userId, function(err){
        if(err){
          res.json({error: err});
        } else{
          res.json({success: true});
        }
      });
    });
    
    // =====================================
    // ABOUT ==============================
    // =====================================
    
    app.get('/privacy', function(req, res) {
        res.render('privacy', {
          title: "Home Game Privacy Policy"
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
    res.redirect('/redirect/' + encodeURIComponent(req.url));
}