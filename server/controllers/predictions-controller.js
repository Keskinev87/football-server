const Game = require('../data/Game')
const User = require('../data/User')
const moment = require('moment')
const Prediction = require('../data/Prediction')

module.exports = {

    makeMatchPrediction: (req, res) => {
        
        let prediction = req.body
        let userId = req.user._id
        prediction.userId = userId
        prediction.type = "match" // other types refer to long term prediction. 

       Prediction.create(prediction).then((resPrediction) => {
           res.status(200).json(resPrediction)
       }).catch(error => {
           res.status(500).json({error: "Prediction could not be saved"})
       })
    },
    getMatchPredictionsForUser: (req, res) => {
        console.log("User id for predictions")
        let userId = req.user._id
       
        console.log(userId)

        Prediction.find({userId: userId}).then(predictions => {
            if (!predictions) {
                res.status(404)
            } else {
                res.status(200).json(predictions)
            }
        }).catch(error => {
            res.status(500).json({error: "Couldn't fetch predictions"})
        })

    }

}