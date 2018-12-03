const mongoose = require('mongoose')

//TODO: add properties for long-term predictions
let updateLoggerSchema = new mongoose.Schema({
    updater: {type: String, required: true},
    message: { type: String, required: false},
    error: {type: String, required: false},
    dateSaved: {type: Date, required: true, default: Date.now},
    dateInMiliseconds: {type: Number, default: new Date().getTime()}
})

updateLoggerSchema.methods.logStatus = function logStatus (updater, message, error) {
    let log = {updater: updater, message: message, error: error}
    UpdateLogger.create(log).catch(error => {
        console.log(error)
    })
};

let UpdateLogger = mongoose.model('UpdateLogger', updateLoggerSchema)
module.exports = UpdateLogger
module.exports = {
    logStatus: (updater, message, error) => {
        let log = {updater: updater, message: message, error: error}
        UpdateLogger.create(log).catch(error => {
            console.log(error)
        })
    }
}

