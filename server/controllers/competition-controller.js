const Competition = require('../data/Competition')

module.exports = {
    getAllCompetitions: (req, res) => {
      Competition.find({}).then(competitions => {
          res.send(competitions)
      })
    },
    getCompetitionsById: (req, res) => {
        let competitionIds = req.body.competitionIds
        Competition.find({ id: { $in: competitionIds} }, (err, competitions) => {
            if (err) res.status(500).send(err);
            else res.status(200).send(competitions);
        })
    },
    saveCompetition: (req, res) => {
      let newCompetition = new Competition(req.body);

      Competition.findOne({id: newCompetition.id}).then(competition => {
         
        if (competition) {
              res.status(401).json({error: 'Competition already exists'})
          }
          else {
            Competition.create(newCompetition, (err) => {
                if (err) res.status(500).json({error: "The game could not be created. Please try again later!"})
                else res.status(200).send('Competition Saved')
            })
            }
      })
    }
}
  
  