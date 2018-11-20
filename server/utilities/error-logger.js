let SaveError = require('../data/SaveError')

module.exports = {
    logError: function(error, origin) {
        error.origin = origin
        error.date = new Date()
        error.dateInMiliseconds = new Date().getTime()
        SaveError.create(error).catch(err => {
            console.log(err)
        })
    }
}