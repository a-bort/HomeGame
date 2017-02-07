module.exports = function(app, passport) {

  // Utility Classes
  var gameRepo = require('./data/gameRepository');
  var seatRepo = require('./data/seatRepository');
  var userRepo = require('./data/userRepository');
  var sharedRepo = require('./data/sharedRepository');
  var feedbackRepo = require('./data/feedbackRepository');
  var redirector = require('./data/redirector');
  var authorization = require('./data/authorization');

  var emailSender = require('./services/emailSender');


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

    // ============================
    // GOOGLE AUTH
    // ============================

    app.get('/auth/google', passport.authenticate('google', {scope: ['https://www.googleapis.com/auth/plus.login', 'email']}));

    app.get('/auth/google/callback', passport.authenticate('google', {
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
        res.locals.sharedModel = data || {};
        res.locals.sharedModel.errors = req.flash('error');
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
			title: "Profile",
            user : req.user
        });
    });

    app.post('/profile', isLoggedIn, function(req, res){
      var user = req.body.userModel;
      userRepo.updateUser(user, function(err){
        defaultJson(res, err);
      });
    });

    app.post('/updateEmail', isLoggedIn, function(req, res){
      var email = req.body.email;
      userRepo.updateUserEmail(req.user, email, function(err){
        defaultJson(res, err);
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
      if(!req.body.gameId){
        defaultJson(res, "Missing parameters");
        return;
      }

      gameRepo.leaveGame(req.body.gameId, req.user._id, function(err){
        defaultJson(res, err);
      });
    });

    app.post('/mygames/kick', isLoggedIn, function(req, res) {
      if(!req.body.gameId || !req.body.seatId){
        defaultJson(res, "Missing parameters");
        return;
      }
      gameRepo.kickPlayer(req.body.gameId, req.body.seatId, req.user._id, function(err){
        defaultJson(res, err);
      });
    });

    // ======================
    // JOIN GAMES
    // ======================

    app.get('/join/:gameId', isLoggedIn, authorization.userAuthorizedForGame, function(req, res) {
      var autoJoin = !!req.query.autoJoin;
      gameRepo.getGameById(req.params.gameId, function(err, game){
        if(err || !game){
          req.flash("error", "Error retrieving game");
          redirector.defaultRedirect(res);
          return;
        }
        userRepo.getUserWithPlayerPool(req.user._id, function(err2, fullUser){
          if(err2 || !fullUser){
            req.flash("error", "Error retrieving user details");
            redirector.defaultRedirect(res);
            return;
          }
          if(!gameRepo.isUserRegisteredForGame(req.user._id, game) && !gameRepo.isUserGameViewer(req.user._id, game)){
            seatRepo.addUserToViewerListByGame(game, req.user._id, function(err){
              renderJoinGame(req, res, game, fullUser, autoJoin);
            });
          } else{
            renderJoinGame(req, res, game, fullUser, autoJoin);
          }
        })
      });
    });

    function renderJoinGame(req, res, game, fullUser, autoJoin){
      res.render('joinGame', {
          title: "Join a Game",
          user : fullUser,
          game : game,
          autoJoin: autoJoin,
          userAttending : gameRepo.isUserRegisteredForGame(req.user._id, game),
          userViewing: gameRepo.isUserGameViewer(req.user._id, game)
      });
    }

    app.get('/join', isLoggedIn, function(req, res) {
      redirector.defaultRedirect(res);
    });

    app.post('/join', isLoggedIn, authorization.userAuthorizedForGame, function(req, res){
      var gameId = req.body.gameId;
      gameRepo.addUserToGame(gameId, req.user._id, null, false, function(err){
        defaultJson(res, err);
      });
    });

    app.post('/join/view', isLoggedIn, authorization.userAuthorizedForGame, function(req, res){
      var gameId = req.body.gameId;
      seatRepo.addUserToViewerList(gameId, req.user._id, function(err){
        defaultJson(res, err);
      });
    });

    app.post('/join/add', isLoggedIn, authorization.userOwnsGame, function(req, res){
      var gameId = req.body.gameId;
      var userId = req.body.userId;
      var name = req.body.name;

      gameRepo.addUserToGame(gameId, userId, name, true, function(err){
        defaultJson(res, err);
      })
    });

    function notification(propertyName){
      var thePropertyName = propertyName;
      var fn = function(req, res){
        var notify = req.body.notify;
        var gameId = req.body.gameId;
        var userId = req.user._id;

        gameRepo.getGameById(gameId, function(err, game){
          if(err){
            defaultJson(res, err);
            return;
          }

          seatRepo.setNotificationStatus(game, userId, thePropertyName, notify, function(err){
            defaultJson(res, err);
          });
        });
      }
      return fn;
    }

    app.post('/join/notifyOnJoin', isLoggedIn, notification("notifyOnJoin"));

    app.post('/join/notifyOnThreshold', isLoggedIn, notification("notifyOnThreshold"));

    app.post('/join/notifyOnComment', isLoggedIn, notification("notifyOnComment"));

    app.post('/join/comment', isLoggedIn, function(req, res){
      var gameId = req.body.gameId;
      var comment = req.body.comment;

      if(!comment){ defaultJson(res, "No Comment Passed"); return; }

      gameRepo.addCommentToGame(gameId, req.user._id, comment, function(err){
        if(err){
          console.log(err);
          defaultJson(res, err);
          return;
        }
        getCommentList(gameId, res);
      });
    });

    app.post('/join/deleteComment', isLoggedIn, function(req, res){
      var gameId = req.body.gameId;
      var commentId = req.body.commentId;

      if(!gameId || !commentId){ defaultJson(res, "Missing Game or Comment Id"); return; }

      gameRepo.removeCommentFromGame(gameId, commentId, req.user._id, function(err){
        if(err){
          console.log(err);
          defaultJson(res, err);
          return;
        }
        getCommentList(gameId, res);
      })
    });

    function getCommentList(gameId, res){
      gameRepo.getGameById(gameId, function(err, game){
        if(err){
          console.log(err);
          defaultJson(res, err);
          return;
        }
        res.json({success: true, comments: game.toJSON().comments});
      })
    }

	  // =====================================
    // HOST A GAME
    // =====================================

    app.get('/host', isLoggedIn, function(req, res) {
      gameRepo.getLatestGameByOwner(req.user._id, function(latestGame){
        if(latestGame && latestGame.toJSON){
          latestGame = latestGame.toJSON();
        } else{
          latestGame = {};
        }

        latestGame._id = '';
        latestGame.date = '';
        latestGame.seatCollection = [];

        res.render('hostGame', {
  			     title: "Host a Game",
             user : req.user,
             game: latestGame
        });
      });
    });

    app.get('/host/:gameId', isLoggedIn, function(req, res) {
      gameRepo.getGameById(req.params.gameId, function(err, game){
        if(game.owner._id .equals(req.user._id)){
          res.render('hostGame', {
            title: "Host a Game",
            user : req.user,
            game : game
          });
        }
        else{
          redirector.defaultRedirect(res);
        }
      });
    });

    app.post('/host/saveGame', isLoggedIn, function(req, res){
      var dataModel = req.body.dataModel;
      var extraOptions = req.body.extraOptions || {};
      gameRepo.saveGame(dataModel, extraOptions, req.user._id, function(err, gameId){
        defaultJson(res, err);
      });
    });

    // =====================================
    // PLAYER POOL =========================
    // =====================================

    app.get('/playerPool', isLoggedIn, function(req, res){
      userRepo.getUserWithPlayerPool(req.user._id, function(err, user){
        if(err){
          console.log('Error getting user with player pool');
          defaultRedirect(res);
        } else{
          res.render('playerPool', {
            title: 'Player Pool',
            playerPool: user.playerPool
          });
        }
      });
    });

    app.post('/playerPool/confirm', isLoggedIn, function(req, res){
      setConfirmedStatus(req, res, true);
    });

    app.post('/playerPool/block', isLoggedIn, function(req, res){
      setConfirmedStatus(req, res, false);
    })

    function setConfirmedStatus(req, res, doConfirm){
      if(!req.body.playerId){
        defaultJson(res, "No Player Id Passed");
        return;
      };

      var playerId = req.body.playerId;

      userRepo.getUserWithPlayerPool(req.user._id, function(err, user){
        if(err){
          console.log('Error getting user with player pool');
          defaultJson(res, err);
        } else{
          for(var i = 0; i < user.playerPool.length; i++){
            var player = user.playerPool[i];
            if(player._id == playerId){
              player.confirmed = doConfirm;
              player.blocked = !doConfirm;
              userRepo.updatePlayerPool(user, function(err){
                defaultJson(res, err);
              })
            }
          }
        }
      });
    }

    /*app.post('/contact/emailPlayerPool', isLoggedIn, function(req, res){
      var info = req.body;

      emailSender.emailPlayerPool(req.user, info.subject, info.html, info.text, function(err){
        defaultJson(res, err);
      });
    });*/


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

      feedbackRepo.submitFeedback(feedback, userId, function(err){
        defaultJson(res, err);
      });
    });

    // =====================================
    // PRIVACY ==============================
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

function defaultJson(res, err){
  if(res){
    if(err){
      res.json({error: err});
    } else{
      res.json({success: true});
    }
  }
}
