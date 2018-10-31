const encryption = require('../utilities/encryption')
const User = require('mongoose').model('User')


const jwt = require('jsonwebtoken')
const passport = require('passport')

module.exports = {
  registerPost: (req, res) => {
    let reqUser = req.body
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
    let reqUser = req.body
    
    User.findOne({username: reqUser.username}).then(user => { //check if user exists
      if (user) {
        if (user.authenticate(reqUser.password)) { //check if password is ok
          const token = jwt.sign(reqUser, 'secret');  //generate a token
          res.status(200).json({success: "Login successfull!", token: token}) //send token to front-end
          console.log(token)
        }
        else {          
          res.status(401).json({error: "Wrong password!"})  //the password doesn't match
        }
      } else {
        res.status(404).json({error: "Wrong username"}) //the username doesn't match
      }
    }).catch(error => {
      res.status(500).json({error: "Login failed. Please try again later!"}) //something wrong with the server
    })
    
    
     
  },
  getUser: (req, res) => {
    console.log(req.user)

    User.findOne({username: req.user.username}).then(user => {
      res.status(200).json(user)
    })
  },
  logout: (req, res) => {
    req.logout()
    res.status(200).json({succeess: "Ok"})
  }
}
