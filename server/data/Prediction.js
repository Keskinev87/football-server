const mongoose = require('mongoose')

//TODO: add properties for long-term predictions
let predictionSchema = new mongoose.Schema({
    matchId: { type: Number, required: true },
    type: { type: String, required: true},
    homeTeamScore: { type: Number, required: true },
    awayTeamScore: { type: Number, required: true },
    gameId: {type: mongoose.Schema.Types.ObjectId, ref: 'Game'},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    scoreRules: {type: Object, required: true}, //the prediction can belong to any game with any different rules. When we search for it, we do it by match id. We have to know what the scoring rules are.
    points: {type: Number, required: false},
    scorer: {type: String, required: false}
})

let Prediction = mongoose.model('Prediction', predictionSchema)
module.exports = Prediction
