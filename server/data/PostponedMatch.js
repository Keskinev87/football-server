const mongoose = require('mongoose')

let postponedMatchSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    competition: { type: Object, required: true },
    season: { type: Object, required: true },
    utcDate: { type: Date, required: true},
    status: { type: String, required: true},
    matchday: { type: Number, required: true},
    stage: { type: String, required: true},
    group: { type: String, required: false},
    lastUpdated: { type: Date, required: true},
    homeTeam: { type: Object, required: true},
    awayTeam: { type: Object, required: true},
    score: { type: Object, required: false},
    referees: { type: Array, required: false},
    goals: { type: Array, required: false },
    bookings: { type: Array, required: false },
    substitutions: { type: Array, required: false},
    dateMiliseconds: { type: Number, required: false}
  })

  let PostponedMatch = mongoose.model('PostponedMatch', postponedMatchSchema)
  module.exports = PostponedMatch