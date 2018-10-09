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
    createGame: (req, res) => {
      let game = req.body //extract the game
      game.creator = req.user //set the game creator to be the current user
      //TODO: Add validations + check if user has 3 games. Every user will be limited to create a maximum of 3 games. Also - the games should be active. 
      
      Game.findOne({name: game.name}).then(resGame => {
          if (resGame) {
              res.status(401).json({error: "Such game already exists. Please choose a different name!"})
          } else {
              Game.create(game).then(newGame => {
                  User.findOneAndUpdate({_id: req.user._id}, { $push: { 'games': newGame} },(err, user) =>{
                      if(err) {
                          res.status(404).json({ error: "The game could not be saved. Please try to logout and login again" })
                      }
                      else {
                        res.status(200).json({success: "Game created successfully!"})
                      }
                  })
                  
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
  
  