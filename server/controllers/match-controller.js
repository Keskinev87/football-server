const Match = require('../data/Match')
const Game = require('../data/Game')
const User = require('../data/User')
const LiveMatch = require('../data/LiveMatch')
const matchesUpdater = require('../updaters/matches-updater')
let moment = require('moment')

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
    getPendingByCompetitionId: (req, res) => {
        console.log(req.body)
        let competitionIds = req.body
        let today = new Date()
        today.setHours(0)
        today.setMinutes(0)
        today.setSeconds(0)
        today = today.getTime()
        

        let theDayAfterTomorrow = new Date()
        theDayAfterTomorrow.setDate(new Date().getDate() + 2) 
        theDayAfterTomorrow = theDayAfterTomorrow.getTime()
        

        

        Match.find({'competition.id': {$in: competitionIds}, 'dateMiliseconds':{$gt: today, $lt: theDayAfterTomorrow}}).then(matches => {
            if(!matches) {
                res.status(404).json({error: "No matches found"})
            }
            else {
                console.log("Got pending matches by id: " + matches.length)
                res.status(200).json(matches)
            }
        }).catch(error => {
            console.log(error)
            res.status(500).json({error: "Some server error"})
        })

        // User.findOne({_id: userId}).then((user) => {
        //     console.log("found him")
        //     let competitionIds = []
        //     console.log(user.games)
        //     for (let game of user.games) {
        //         competitionIds.concat(game.competitionIds)
        //     }
        //     console.log(competitionIds)
        //     Match.find({'competition.id': {$in: competitionIds }}).then((matches) => {
        //         if (!matches) {
        //             res.status(404).json({error: "No matches found for this competition"})
        //         }
        //         else {
        //             res.status(200).json(matches)
        //         }
        //     }).catch((error) => {
        //         res.status(500).json({error: "Server error. Please try again later!"})
        //     })
        // }).catch((error) => {
        //     res.status(500).json({error: "Server error finding the user"})
        // })


        
    },
    getById: (req, res) => {

        let matchIdArr = req.body.matchIdArr


        Match.find({ id: { $in: matchIdArr} }, (err, matches) => {
            if (err) res.status(500).send(err);
            else res.status(200).send(matches);
        })

    },
    getMatchesbyDate: (req, res) => {
        let today = new Date().getTime()
        let tomorrowsDate = new Date()
        tomorrowsDate = tomorrowsDate.setDate(new Date().getDate() + 4)
        console.log(tomorrowsDate)
        console.log(typeof(tomorrowsDate))

        Match.find({dateMiliseconds : {$gt: today, $lt : tomorrowsDate}}).then(matches => {
            if(!matches) {
                res.status(404)
            }
            else
                res.status(200).json(matches)
        }).catch(error => {
            res.status(500)
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

    },
    getLiveScores: (req, res) => {
        LiveMatch.find({}).then(matches => {
            res.status(200).json(matches)
        }).catch(error => {
            res.status(500).json("Server error")
        })
    },
    getMatchesFromApi: (req, res) => {
        let from = req.body.from
        let to = req.body.to
        console.log("From" + from)
        console.log("To" + to)
        
        let dateBegin = moment(from)
        let dateTo = moment(to)

        // let dateBegin = moment('2018-11-24')
        // let dateTo = moment('2018-11-29')
        
        if(req.user.roles[0] == "Admin") {
            matchesUpdater.getAndSaveMatches(dateBegin, dateTo)
                .then(savedMatches => {
                res.status(200).json(savedMatches)
                })
                .catch(error => {
                    res.status(500).json(error)
                })     
        } else {
            res.status(403).json()
        }

    }
}
  
  