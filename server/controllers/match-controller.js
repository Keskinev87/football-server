const Match = require('../data/Match')

module.exports = {
    getAllMatches: (req, res) => {
      Match.find({}).then(matches => {
          res.send(matches)
      })
    },
    getMatchesById: (req, res) => {
        let matchIds = req.body.matchIds
        Match.find({ id: { $in: matchIds} }, (err, matches) => {
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
  
  