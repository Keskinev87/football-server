const mongoose = require('mongoose')

//TODO: add properties for long-term predictions
let saveErrorSchema = new mongoose.Schema({
    origin: {type: String, required: true},
    name: { type: String, required: true },
    message: { type: String, required: true},
    date: { type: Date, required: true },
    dateInMiliseconds: {type: Number, required: true}
})

let SaveError = mongoose.model('SaveError', saveErrorSchema)
module.exports = SaveError
