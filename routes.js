module.exports = function(app, passport) {

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
    // LOGIN ===============================
    // =====================================
    // show the login form
    //app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
    //    res.render('login', { message: req.flash('loginMessage') }); 
    //});

    // process the login form
    // app.post('/login', do all our passport stuff here);

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    //app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
    //   res.render('signup', { message: req.flash('signupMessage') });
    //});

    // process the signup form
    // app.post('/signup', do all our passport stuff here);

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile', {
			title: "Home Game - " + req.user.name,
            user : req.user // get the user out of session and pass to template
        });
    });

	
	//FB AUTH
	
	app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email'}));
	
	app.get('/auth/facebook/callback', passport.authenticate('facebook', {
		successRedirect: '/profile',
		failureRedirect: '/'
	}));
	
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