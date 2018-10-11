const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const passport = require('passport')


module.exports = (app) => {
  //CORS Middleware
  app.use(function (req, res, next) {
  //Enabling CORS
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization');
    res.header('Content-Type', 'application/json');
    if (req.method == 'OPTIONS') {
      res.status(200).send("Ok");
      res.end();
    }
    else next();
  });
  app.use(cookieParser())
  app.use(bodyParser.json())
  app.use(passport.initialize())
  app.use(express.static('public'))


  console.log('Express ready!')
}
