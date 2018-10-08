const Game = require('../data/Game')
const User = require('../data/User')

module.exports = {
    getGameById: (req, res) => {

       Game.find({creator: req.user}).then(resGame => {
        if (resGame) {
            res.status(200).json(resGame)
        } else {
            res.status(404).json({error:"No games were found!"})
        }
       }).catch(error => {
           res.status(500).json({error:"Service not available. Please try again later!"})
       })
    },
    saveGame: (req, res) => {
      let game = req.body
      game.creator = req.user
      console.log(req.user)
      //TODO: Add validations
      
      Game.findOne({name: game.name}).then(resGame => {
          if (resGame) {
              res.status(401).json({error: "Such game already exists. Please choose a different name!"})
          } else {
              Game.create(game).then(success => {
                  User.findOne({_id: req.user._id}).then(resUser => {
                      console.log(resUser)
                  }).catch(error => {
                      console.log(error)
                  })
                  res.status(200).json({success: "Game created successfully!"})
              }).catch(error => {
                  console.log(error)
                  res.status(500).json({error: "The game could not be created. Please try again later"})
              })
          }
      }).catch(error => {
          res.status(500).json({error: "The game could not be created. Please try again later 2"})
      })
    },
    editGame: (req, res) => {

    },
    deleteGame: (req, res) => {
        
    }
}
  
  