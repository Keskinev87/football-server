let env = process.env.NODE_ENV || 'development'

let settings = require('./server/config/settings')[env]

const app = require('express')()

require('./server/config/database')(settings)
require('./server/config/express')(app)
require('./server/config/routes')(app)
require('./server/config/passport')()
// let updaters = require('./server/updaters/index')

// var interval = setInterval(updaters.matches.getMatch, 10000);
// setTimeout(updaters.competitions.saveCompetition, 10000);
// - Run to fill the database with competitions
// updaters.competitions.getAndSaveCompetitions() 
// updaters.matches.getAndSaveMatches() - Run to fill the database with matches

app.listen(settings.port)
console.log(`Server listening on port ${settings.port}...`)


  
