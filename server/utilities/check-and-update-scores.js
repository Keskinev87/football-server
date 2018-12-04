let LiveMatch = require('../data/LiveMatch')

module.exports = {
    checkAndUpdateScores: function(apiMatch, oldMatch) {
        return new Promise((resolve, reject) => {

                    //BIG TODO: ADD SCORERS, BOOKINGS etc. AFTER PURCHASING THE PAID PLAN

                    //declare booleans for all factors we are following. E.g. goals, bookings, changes etc.
                    let goalsChanged = false
                    
                
                    let oldResultHome = oldMatch.score.fullTime.homeTeam
                    let oldResultAway = oldMatch.score.fullTime.awayTeam
                    let newResultHome = apiMatch.score.fullTime.homeTeam
                    let newResultAway = apiMatch.score.fullTime.awayTeam
                    console.log("New result:")
                    console.log(newResultHome + " " + newResultAway + " Shown: " + new Date())

                    //check if the result changed
                    if (oldResultHome != newResultHome || oldResultAway != newResultAway){
                        goalsChanged = true
                    }
                    
                    //bookings - will be added later TODO

                    //final check if something has changed
                    if(goalsChanged == true) {
                            //update the score and status
                            LiveMatch.findOneAndUpdate({id: apiMatch.id},
                                {$set: {'score.fullTime': apiMatch.score.fullTime, 'status' : apiMatch.status}},
                                {'new': true},
                                (err, match) => {
                                  if (err) {
                                      reject(err)
                                  } else {
                                      resolve(match)
                                  }
                            })
                    } 
                    else {
                        resolve(undefined)
                    }
        })
    }
}