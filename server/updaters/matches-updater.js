let moment = require('moment')
let http = require('http')
let Match = require('../data/Match')
let cron = require('node-cron')
let ScheduledMatch = require('../data/ScheduledMatch')
let LiveMatch = require('../data/LiveMatch')
let errorLogger = require('../utilities/error-logger')
let checkAndUpdateScores = require('../utilities/check-and-update-scores')
let predictionUpdater = require('./prediction-updater')
let mongoose = require('mongoose')


let apiToken = 'f8a83daa19804e2a966103601127b9b5'
let rootPath = 'api.football-data.org'

module.exports = {
  
    getAndSaveMatches: function(dateBegin, dateTo) {

        return new Promise((resolve, reject) => {
//USED TO GET MATCHES FROM THE API FOR THE SELECTED PERIOD

            let competitions = "2013,2016,2021,2001,2018,2015,2002,2019,2003,2017,2014,2000"
            // for (let i = 0; i<=365; i+=10) {
                //TODO: put the code bellow here in order to update the database for one year ahead. The limitation of the API is maximum of 10 days for filtering. 
                //This is why we make the update with loop
                //Reminder: The API provides 10 calls per minute. Put some delay between each iteration. 
            // }
            let urlPath = "/v2/matches" + "?" + "competitions" + "=" + competitions + "&" + "dateFrom=" + dateBegin.format('YYYY-MM-DD') + "&" +"dateTo=" + dateTo.format('YYYY-MM-DD')
            console.log(urlPath)
            let options = {
                host: 'api.football-data.org',
                path: urlPath,
                headers: {
                    'X-Auth-Token': apiToken,
                    'Content-Type': 'application/json'
                }
            }
            http.get(options, (response) => {
                let data =''
                let errorMessages = []

                response.on('error', function() {
                    console.log("error")
                })
                response.on('data', function (chunk) {
                    data += chunk
                });
                response.on('end', function() {
                    console.log("Got data")
                    console.log(data)
                    let matches = JSON.parse(data).matches


                    let promises = []

                    for (let resMatch of matches) {
                        promises.push(saveMatch(resMatch))
                    }

                    Promise.all(promises).then(savedMatches => {
                        resolve(savedMatches)
                    }).catch(error => [
                        reject(error)
                    ])

                    function saveMatch(resMatch) {
                        return new Promise((resolve, reject) => {
                            let dateMiliseconds = new Date(resMatch.utcDate).getTime()
                            resMatch.dateMiliseconds = dateMiliseconds
                            
        
                            Match.findOne({id: resMatch.id}).then(match => {
                
                                if (match) {
                                    resolve("Match already there: " + match.id)
                                }
                                else {
                                    Match.create(resMatch).then( createdMatch => {
                                        resolve("Match saved: " + createdMatch.id)
                                    }).catch(error => {
                                        console.log(error)
                                        reject(error)
                                    })
                                }       
                            }).catch(error => {
                                console.log(error)
                                reject(error)
                            })
                        })
                    }
                
                })
                return errorMessages
            });
        })
       
    },
    updateMatchLive: function(match) {
        //USED TO UPDATE THE MATCH WHILE IT IS LIVE BY ASKING THE API FOR CHANGES EVERY 10 SECONDS
        
        //1. Gets started by "checkIfMatchHasBegun" whenever a match starts
        //2. Updates the match live until it finishes.
        //3. Whenever the match is finished, stop the interval
        //4. TODO: Manage the canceled/postponed case

        //find the match which is live in our DB. We will constantly compare it to the same from the API
        LiveMatch.findOne({id: match.id}).then(resMatch => {
            //all variables to connect with the API
            let stop = false //this will stop the interval when the match ends
            let urlPath = "/v2/matches/" + resMatch.id
            let options = {
                host: rootPath,
                path: urlPath,
                headers: {
                    'X-Auth-Token': apiToken,
                    'Content-Type': 'application/json'
                }
            }
            console.log("The Url: ")
            console.log(rootPath + urlPath)
            //set interval to update the match every X seconds

            let timer = setInterval(function(){
             
                //send request every X sec to check if the match is updated
                if(!stop) {
                    http.get(options, (response) => {
                        let data = ''
            
                        response.on('error', function() {
                            console.log("error")
                        })
                        response.on('data', function (chunk) {
                            data += chunk
                        });
                        response.on('end', function() {
                            let apiMatch = JSON.parse(data).match
                            
                            //check if the match has finished
                            if(apiMatch.status == "FINISHED") {
                                stop = true
                                predictionUpdater.updatePrediction(apiMatch)
                                //TODO - DELETE THE MATCH FROM LIVE AND UPDATE IT
                                console.log("Stopped at:")
                                console.log(new Date())
                            } else {
                                //Check if something has changed and update the match if necessarry
                                checkAndUpdateScores.checkAndUpdateScores(apiMatch, resMatch).then(match => {
                                    console.log("Promise Check And Update Returned:")
                                }).catch(error => {
                                    console.log(error)
                                })
                            }
                        })
                    })
                    
                } 
                else {
                    clearInterval(timer)
                }    
            },60000)
        }).catch(error => {
            console.log("No such match!")
        })
        
    },
    checkIfMatchHasBegun: function() {
        //1. Check if a match has begun
        //2. If yes - start an interval (the function updateMatchLive)
        cron.schedule('1 1-59 * * * *', () => {
            
            let curTime = new Date()
            curTime = curTime.getTime()
            console.log("Checking if match has began")
            ScheduledMatch.find({dateMiliseconds: {$lt : curTime}, status: {$ne: "FINISHED"}}).then(matches => {
                if (matches) {
                    for (let match of matches) {

                        //check if the match isn't there already
                        LiveMatch.findOne({id: match.id}).then(foundMatch => {
                            if(!foundMatch) {
                                //add the match to the collection with live matches
                                match._id = mongoose.Types.ObjectId();
                                match.isNew = true
                                LiveMatch.create(match).then(() => {
                                    this.updateMatchLive(match)
                                    ScheduledMatch.deleteOne({_id: match._id}).then(() => {
                                        console.log("Match deleted from scheduled")
                                        Match.findOneAndUpdate({id: match.id}, {$set :{'status' : match.status}})
                                            .catch(error => {
                                                console.log("The match was added to live, but not updated")
                                            })
                                    }).catch(error => {
                                        console.log("Scheduled match removal failed")
                                    })
                                }).catch(error => {
                                    console.log("Live match create failed")
                                })
                            }
                        }).catch(error => {
                            console.log("Live Match finding failed")
                        })
                        
                    }
                }
            }).catch(error => {
                console.log("Server error ocurred")
            })

            console.log('Checked if match began...')
        },{timezone: 'Europe/London'}) 

        
    },
    updateMatchesForTheWeek: function() {
        //1. Get all matches for the week from own db,
        //2. Get all matches for the week from the API db, 
        //3. For each match in own db, check if the last updated Date is different from the same in API db,
        //4. If true, update the match in own db.

        let task = cron.schedule('0-59/10 * * * * *', () => {
            console.log("Live update!")
        },{scheduled: false})

        let matchBegun = true
        cron.schedule('1,15 * 0 * * *', () => {
            
            if(matchBegun) {
                task.start()
                matchBegun = false
            } else if(!matchBegun) {
                task.stop()
            }

            console.log('updated matches for the week')
        },{timezone: 'Europe/Sofia'}) 
    },
    getMatchesForToday: function() {
         //1. At the beginning of the day, check all matches that are scheduled for the same day,
         //2. Save their id and date in a separate collection in the database,
         //3. If there are any matches for the day, start a scheduled task to check if the match has begun.
        cron.schedule('5 14 0 * * *', () => {
            let today = new Date()
            today.setDate(new Date().getDate() - 1)
            today = today.getTime()
            let tomorrow = new Date()
            tomorrow.setDate(new Date().getDate() + 1)
            tomorrow.setHours(0)
            tomorrow.setMinutes(0)
            tomorrow.setSeconds(0)
            tomorrow = tomorrow.getTime()
            console.log("getMatchesForToday")
            console.log(tomorrow)
            Match.find({dateMiliseconds: { $gt: today, $lt: tomorrow }}).then(matches => {
                //if any matches are found, save them in the list with scheduled matches for the day
                if(matches) {
                    for (let match of matches) {
                        
                        //check if the match is already there
                        ScheduledMatch.findOne({id:match.id}).then(resMatch => {
                            if(resMatch) {
                                console.log("Already there")
                            }
                            //if not, save it
                            if(!resMatch){
                                match._id = mongoose.Types.ObjectId()
                                match.isNew = true
                                ScheduledMatch.create(match).then(savedMatch => {
                                    console.log("Match added to schedule:")
                                    console.log("Id: " + savedMatch.id)
                                }).catch(error => {
                                    //log the error
                                    console.log(error)
                                    errorLogger.logError(error, "GetMatchesForToday - Create Scheduled Match")
                                })
                            }
                            
                        }).catch(error => {
                            console.log(error)
                            errorLogger.logError(error, "GetMatchesForToday - Try find a scheduled match")
                        })
                    }
                }
            }).catch(error => {
                errorLogger.logError(error, "GetMatchesForToday - Try find a match for today")
            })
        }, {timezone: "Europe/Sofia"})    
    }
    
}