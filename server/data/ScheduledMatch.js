const mongoose = require('mongoose')

let scheduledMatchSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    dateStartInMiliseconds: { type: Number, required: true },
    status: {type: String, required: true}
})

let ScheduledMatch = mongoose.model('ScheduledMatch', scheduledMatchSchema)
module.exports = ScheduledMatch