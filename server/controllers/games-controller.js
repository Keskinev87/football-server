const Game = require('../data/Game')
const User = require('../data/User')
const moment = require('moment')
const Prediction = require('../data/Prediction')

module.exports = {
    joinGameWithCode: (req, res) => {
        
        let secretCode = req.body.gameCode
        console.log("Secret code is:" + secretCode)
        let userGameIds = req.user.games
        console.log("User game ids: " + userGameIds.join(','))
        console.log(req.user)
        let userId = req.user._id
        
        Game.findOneAndUpdate({secretCode: secretCode, _id: {$nin: userGameIds}}, {$push : {'users': userId}}, (err, game) => {
            if(err) {
                res.status(500).json({error: "Server error"})
            } else if (!game) {
                res.status(404).json({error: "No such game found or you already participate in this one."})
            } else {
                User.findOneAndUpdate({_id: userId}, { $push:{'games': game._id}}, (err, user) => {
                    if(err) {
                        res.status(500).json("Server Error")
                    } else if(!user) {
                        res.status(404).json("User not found")
                    } else {
                        res.status(200).json(game)
                    }
                })
            }
        })
        

        //TODO: Make sure that the secret code of every game is unique since this is the only thing the game is searched by. 
        

    },
    getGamesByParticipant: (req, res) => {
        let reqGamesIds = []
        for (let game of req.user.games) {
            reqGamesIds.push(game._id)
        }
        
        Game.find({_id:{$in : reqGamesIds}}).then(games =>{
            if(games === undefined) {
                res.status(204)
            } else {
                console.log("Got games")
                res.status(200).json(games)
            }
        }).catch(error => {
            console.log(error)
            res.status(500)
        })
    },
    getGameByCreator: (req, res) => {

       Game.find({creator: req.user._id}).then(resGame => {
        if (resGame) {
            res.status(200).json(resGame)
        } else {
            res.status(404).json({error:"No games were found!"})
        }
       }).catch(error => {
           res.status(500).json({error:"Service not available. Please try again later!"})
       })

    },
    getGameById: (req, res) => {

        Game.find({_id: req._id}).then(resGame => {
            if (resGame) {
                res.status(200).json(resGame)
            } else {
                res.status(404).json({error:"No games were found!"})
            }
           }).catch(error => {
               res.status(500).json({error:"Service not available. Please try again later!"})
           })

    },
    createGame: (req, res) => {
      let game = req.body //extract the game
      game.creator = req.user._id 
      //set the game creator to be the current user
      game.admin = req.user._id //the user who creates the game is also admin. Admin can be changed in some cases. 
      game.dateCreated = new moment()


      //TODO: Add validations + check if user has 3 games. Every user will be limited to create a maximum of 3 games. Also - the games should be active.
      //check if the game already exists. Condition is: the admin is this user and the name is the same
      Game.findOne({admin: req.user} && {name: game.name}).then(resGame => {
          if (resGame) {
              res.status(401).json({error: "Such game already exists. Please choose a different name!"})
          } else {
              Game.create(game).then(newGame => {
                  User.findOneAndUpdate({_id: req.user._id}, { $push: { 'games': newGame._id} },(err, user) =>{
                      if(err) {
                          res.status(500).json({ error: "The game could not be saved. Please try to logout and login again" })
                      }
                      else if (!user) {
                          res.status(404).json({error: "User was not found!"})
                      } 
                      else {
                        res.status(200).json(newGame)
                      }
                  })
                  
              }).catch(error => {
                  console.log(error)
                  res.status(500).json({error: "The game could not be created. Please try again later"})
              })
          }
      }).catch(error => {
          res.status(500).json({error: "The game could not be created. Please try again later! "})
      })

    },
    addCompetitions: (req, res) => {
        
        let reqGameId = req.body._id
       
        let competitions = req.body.competitions
        console.log("COMPETITIONS:")
        console.log(competitions)

        Game.findOneAndUpdate({_id: reqGameId, admin: req.user._id}, {$set: {"competitions": competitions}}, {new: true}, (err, game) => {
            if(err) {
                console.log(err)
                res.status(404).json({ error: "Game could not be updated!"})
            } 
            else if (!game) {
                res.status(404).json({error: "Not found!"})
            }
            else {
                console.log(game)
                res.status(200).json(game)
            }
        })

    },
    addMatchesWithId: (req, res) => {

        let reqGameId = req.body.gameId
        let matches = req.body.matches
        

        //TODO: There should be a check if the game is a certain type. Only certain games will allow adding custom matches. 
        Game.findOneAndUpdate({_id: reqGameId, admin: req.user}, {$set: {matches: matches}}, (err, game) => {
            if(err) {
                res.status(404).json({ error: "Game could not be updated!"})
            }
            else if (!game) {
                res.status(404).json({ error: "Game not found!" })
            }
            else {
                // res.status(200).json({success: "Game updated successfully!"})
                res.status(200).json(game)
            }
        })

    },
    addMatchesWithCompetition: (req, res) => {

        let competitionIds = req.body.competitions
        let gameId = req.body._id
        

        Match.find({'competition.id': {$in: competitionIds }}).then((matches) => {
            if(!matches){
                res.status(404).json({error: "No matches found!"})
            } 
            else {
                Game.findOneAndUpdate({_id: gameId, admin: req.user}, {$set: {matches: matches}}, (err, game) => {
                    if(err) {
                        res.status(404).json({ error: "Game could not be updated!"})
                    }
                    else if (!match) {
                        res.status(404).json({ error: "Game not found!" })
                    }
                    else {
                        // res.status(200).json({success: "Game updated successfully!"})
                        res.status(200).json(game)
                    }
                })
            }
        })

    },
    saveGameRules: (req, res) => {
        let gameId = req.body._id
        let rules = req.body.scoreRules
        Game.findOneAndUpdate({_id: gameId}, {$set: {scoreRules: rules}}, {new: true}, (err, game) => {
            if(err) {
                res.status(500)
            } 
            else if (!game) {
                res.status(404)
            }
            else {
                res.status(200).json(game)
            }

        })
    },
    
    deleteGame: (req, res) => {

        //TODO: this should send e-mail if users are playing the game. They have to confirm, that they agree to the deletion. 

    },
    editGame: (req, res) => {

        //TODO: Not decided yet what the conditions for changing a game are. 

    }
}
  
  