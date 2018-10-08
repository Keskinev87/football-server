const encryption = require('../utilities/encryption')
const User = require('mongoose').model('User')


const jwt = require('jsonwebtoken')
const passport = require('passport')

module.exports = {
  registerPost: (req, res) => {
    let reqUser = req.body
    console.log(reqUser)
    //TODO: method deleteUser
    //Validations:

    if (!reqUser.username || !reqUser.password || !reqUser.fullName) {
      res.status(401).json(error = "Missing username/password/name!") //missing field
    }
    else if(!validateEmail(reqUser.username)) {
      res.status(401).json({error: "Invalid email address!"}) //invalid e-mail address
    }
    else if(reqUser.password.length < 6) {
      res.status(401).json({error: "Password must be at least 6 characters long!"}) //invalid password
    }
    else {
      User.findOne({username: reqUser.username}).then(user => {
        if (user) {
          res.status(401).json({error: "User already Exists!"})
        }
        else {
          let salt = encryption.generateSalt()
          let hashedPassword = encryption.generateHashedPassword(salt, reqUser.password)
          User.create({
            username: reqUser.username,
            fullName: reqUser.fullName,
            salt: salt,
            hashedPass: hashedPassword
          }).then( resUser => {
            console.log("Result")
            console.log(resUser)
            res.status(200).json({success:"User successfuly created"})
          }).catch(error => {
            res.status(500).json({error: "Server error. Please try again later!"})
          })
        }
      })
      .catch(error => {
        res.status(500).json({error: "Server error. Please contact support!"})
      })
    }
    function validateEmail(email) {
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    }
    
  },
  loginPost: (req, res) => {
    let user = req.body
    let successMsg = "Login Successfull!"
    // let salt = encryption.generateSalt()
    // let hashedPassword = encryption.generateHashedPassword(salt, user.password)
    // user.password = hashedPassword
    passport.authenticate('local', {session: false}, (err, user, info) => {
      
      if (err || !user) {
          return res.status(401).json(
              {error: "Wrong password/username. Please try again!"}
          );
      }
     req.login(user, {session: false}, (err) => {
         if (err) {
             res.status(401).json({error: "Could not login. Please try again later!"});
         }
         // generate a signed son web token with the contents of user object and return it in the response
         const token = jwt.sign(user.toJSON(), 'your_jwt_secret');
         return res.status(200).json({user : user, token: token, success: successMsg });
      });
  })(req, res)
  },
  getUser: (req, res) => {
    console.log(req.user)

    User.find().then(user => {
      res.status(200).json(user)
    })
  },
  logout: (req, res) => {
    req.logout()
    res.status(200).json({succeess: "Ok"})
  }
}
