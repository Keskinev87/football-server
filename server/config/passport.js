const passport = require('passport')
const passportJWT = require("passport-jwt");
const JwtStrategy  = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
const User = require('mongoose').model('User')

module.exports = () => {

passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
  }, function(jwt_payload, done) {
  User.findOne({username: jwt_payload.username}, function(err, user) {
      if (err) {
          return done(err, false);
      }
      if (user) {
          return done(null, user);
      } else {
          return done(null, false);
      }
  });
}));

}