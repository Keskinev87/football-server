const mongoose = require('mongoose')
const Match = require('./Match')

let competitionSchema = new mongoose.Schema({
    id: { type:Number, required: true },
    area: {type: Object, required: true },
    name: { type: String, required: true},
    code: { type: Number, required: true},
    plan: { type: String, required: true},
    currentSeason: { type: Object, required: true },
    seasons: { type: Array, required: false },
    lastUpdated: {type: Date, required: true},
    matches: { type: Array, required: false}

})

let Competition = mongoose.model('Competition', competitionSchema)
module.exports = Competition