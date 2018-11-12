const mongoose = require('mongoose')

//TODO: add properties for long-term predictions
let predictionSchema = new mongoose.Schema({
    matchId: { type: Number, required: true },
    type: { type: String, required: true},
    homeTeamScore: { type: Number, required: true },
    awayTeamScore: { type: Number, required: true },
    gameId: {type: mongoose.Schema.Types.ObjectId, ref: 'Game'},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    scorer: {type: String, required: false}
})

let Prediction = mongoose.model('Prediction', predictionSchema)
module.exports = Prediction
