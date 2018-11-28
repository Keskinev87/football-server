const Competition = require('../data/Competition')
const competitionUpdater = require('../updaters/competitions-updater')

module.exports = {
    getAllCompetitions: (req, res) => {
      Competition.find({}).then(competitions => {
          res.status(200).json(competitions)
      }).catch(error => {
          res.status(500)
      })
    },
    getCompetitionsById: (req, res) => {
        let competitionIds = req.body.competitionIds
        Competition.find({ id: { $in: competitionIds} }, (err, competitions) => {
            if (err) res.status(500);
            else res.status(200).json(competitions);
        })
    },
    saveCompetition: (req, res) => {
      let newCompetition = new Competition(req.body);

      Competition.findOne({_id: newCompetition.id}).then(competition => {
         
        if (competition) {
              res.status(401).json({error: 'Competition already exists'})
          }
          else {
            Competition.create(newCompetition, (err) => {
                if (err) res.status(500).json({error: "The game could not be created. Please try again later!"})
                else res.status(200).json(newCompetition)
            })
            }
      })
    },
    getAndSaveCompetitionsFromApi: (req, res) => {
        let availableCompetitions = [2013, 2016, 2021, 2001, 2018, 2015, 2002, 2019, 2003, 2017, 2014, 2000]
        let updatedCompetitions = []
        let errors = []
        if(req.user.roles[0] == "Admin") {
            for (let id of availableCompetitions) {
                competitionUpdater.getFromApiAndSaveCompetition(id).then((competition) => {
                    updatedCompetitions.push(competition)
                }).catch(error => {
                    errors.push(error)
                    console.log(error)
                })
            }
        res.status(200).json(updatedCompetitions)
        } else {
            res.status(403).json({error:"You are not authorized"})
        }

        
    }
}
  
  