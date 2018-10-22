const Match = require('../data/Match')
const Game = require('../data/Game')

module.exports = {
    getAllMatches: (req, res) => {

      Match.find({}).then(matches => {
          res.send(matches)
      })

    },
    getByGameId: (req, res) => {

        let gameId = req.body.gameId


        Game.find({_id: gameId}).then((game) => {
            if(!game){
                res.status(404).json({error: "No game was found!"})
            }
            else {
                res.status(200).json(game.matches)
            }
        })

    },
    getByCompetitionId: (req, res) => {

        let competitionIds = req.body.competitionIds


        Match.find({'competition.id': {$in: competitionIds }}).then((matches) => {
            if (!matches) {
                res.status(404).json({error: "No matches found for this competition"})
            }
            else {
                res.status(200).json(matches)
            }
        }).catch((error) => {
            res.status(500).json({error: "Server error. Please try again later!"})
        })
    },
    getById: (req, res) => {

        let matchIdArr = req.body.matchIdArr


        Match.find({ id: { $in: matchIdArr} }, (err, matches) => {
            if (err) res.status(500).send(err);
            else res.status(200).send(matches);
        })

    },
    saveMatch: (req, res) => {

      let newMatch = new Match(req.body);


      Match.findOne({id: newMatch.id}).then(match => {
         
        if (match) {
              res.send('Match already exists')
        }
        else {
            Match.create(newMatch, (err) => {
                if (err) res.status(500).send(err)
                else res.status(200).send('Match Saved')
            })
        }
      })

    }
}
  
  