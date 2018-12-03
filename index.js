let env = process.env.NODE_ENV || 'development'
let cron = require('node-cron')
let settings = require('./server/config/settings')[env]

const app = require('express')()


let updaters = require('./server/updaters/index')

// updaters.matches.updateMatchLive()
// updaters.matches.updateMatchesForTheWeek()
// updaters.matches.getMatchesForToday()
// updaters.matches.checkIfMatchHasBegun()
updaters.matches.weeklyUpdate()
updaters.matches.dailyUpdate()
updaters.matches.matchStartedUpdate()

require('./server/config/database')(settings)
require('./server/config/express')(app)
require('./server/config/routes')(app)
require('./server/config/passport')()


// var interval = setInterval(updaters.matches.getMatch, 10000);
// setTimeout(updaters.competitions.saveCompetition, 10000);
// - Run to fill the database with competitions
// updaters.competitions.getAndSaveCompetitions() 
// Run to fill the database with matches

// updaters.matches.getAndSaveMatches() 


app.listen(settings.port)
console.log(`Server listening on port ${settings.port}...`)


  
