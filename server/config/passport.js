const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const passportJWT = require("passport-jwt");
const JwtStrategy  = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
const User = require('mongoose').model('User')

module.exports = () => {

passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
  }, function(jwt_payload, done) {

  User.findOne({id: jwt_payload.sub}, function(err, user) {
      if (err) {
        console.log(err)
          return done(err, false);
      }
      if (user) {
        console.log(user)
          return done(null, user);
      } else {
        console.log("tuk")
          return done(null, false);
      }
  });
}));

}
