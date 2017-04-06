var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser= require('body-parser');
var passport = require('passport');
var jwt = require('express-jwt');
var auth = jwt({
  secret: 'MY_SECRET',
  userProperty: 'payload'
});
var mysql      = require('mysql');

var dbConnection = require('./dbConnection');
dbConnection.connect();

var app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/public',express.static(__dirname + "/public"));
app.use('/node_modules',express.static(__dirname+'/node_modules'));
app.use(passport.initialize());
// get controller from other js file using require()
var authenticationController = require('./server/controllers/authentication');
var profileController = require('./server/controllers/profile');
/* test connecting to mysql server successfully
dbConnection.get().query('SELECT * from account', function(err, rows, fields) {
  if (!err){
    console.log('The solution is: ', rows[0].firstname);
	
	}
  else
    console.log('Error while performing Query.');
});
*/ 
//dbConnection.end();


app.get('/',function(req,res){
	res.sendFile(__dirname+'/index.html');
});

// authentication
app.post('/api/user/register', authenticationController.register);
app.post('/api/user/login', authenticationController.login);
//profile
app.get('/api/profile', auth, profileController.profileRead);
app.post('/api/profile/updateUser',profileController.updateUser);

var port = process.env.PORT  || 5000;
app.listen(port, function(){
	console.log("cmpe 189 Successfull connected to mongodb server (local host: )"+port);
});