const mongoose = require('mongoose')

//TODO: add properties for long-term predictions
let predictionSchema = new mongoose.Schema({
    matchId: { type: String, required: true },
    type: { type: String, required: true},
    homeTeamScore: { type: Number, required: true },
    awayTeamScore: { type: Number, required: true }
})

let Prediction = mongoose.model('Prediction', predictionSchema)
module.exports = Prediction
