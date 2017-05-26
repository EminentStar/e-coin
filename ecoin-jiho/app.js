var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');


mongoose.connect('mongodb://localhost/loginapp');
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');

var User = require('./models/user');

// Init App
var app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});



// POST REQUESTS
app.post('/add_money', function(req, res) {
    
    console.log("POST ADD_MONEY");
    console.log("current balance : " + req.user.currentBalance);
    console.log("add amount : " + 1000);

    console.log("HERE add amount : " + req.body.amount);


    var total = req.user.currentBalance + 1000;
    console.log("user:" + req.user.username + " total:" + total);
        
    User.updateBalance(
        req.user.username,
        total
    );

    res.redirect('/');


});





app.post('/send_money', function(req, res) {

    console.log("POST SEND_MONEY");
    console.log("username : " + req.user.username);
    console.log(" : " + req.user.currentBalance);

    // var receiver = req.body.receiver;


    //console.log("receiver current balance : " + req.body.receiver.currentBalance);

    //console.log("amount : " + req.body.amount);


    var receiver = req.body.receiver;

    console.log("HERE receiver : " + receiver);


    // console.log("receiver[name] : " + o.name);
    // console.log("receiver[currentBalance] : " + receiver[currentBalance]);



    User.updateBalance(
        req.user.username,
        req.user.currentBalance - req.body.amount
    );

    // User.updateBalance(
    //     receiver[username],
    //     receiver[currentBalance] + req.body.amount
    // );


    res.redirect('/');


});





app.use('/', routes);
app.use('/users', users);

// Set Port
app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});