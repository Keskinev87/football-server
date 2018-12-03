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
let UpdateLogger = require('../data/UpdateLogger')
let env = require('../utilities/env-variables')


let apiToken = 'f8a83daa19804e2a966103601127b9b5'
let rootPath = 'api.football-data.org'

module.exports = {

    weeklyUpdate: function() {
        //1. Get all matches for the week from own db,
        //2. Get all matches for the week from the API db, 
        //3. For each match in own db, check if the last updated Date is different from the same in API db,
        //4. If true, update the match in own db.

        cron.schedule('5 11 23 * * *', () => {
            return new Promise((resolve, reject) => {
                console.log("weekly update initiated...: " + new Date())
                //log the activity
                UpdateLogger.logStatus("Weekly Update", "Weekly update initiated...")
                
                //declare the filter dates
                let dateBegin = moment().subtract(2, 'days')
                let week = new Date().setDate(new Date().getDate())
                let dateTo = moment(week)
                //declare the competitions 
                let competitions = env.competitions

                let urlPath = "/v2/matches?competitions=" + competitions + "&dateFrom=" + dateBegin.format('YYYY-MM-DD') + "&dateTo=" + dateTo.format('YYYY-MM-DD')
                let options = {
                    host: env.apiRoot,
                    path: urlPath,
                    headers: env.headers
                }
                
                //send request to the API
                http.get(options, (response) => {
                    let data =''
                    let errorMessages = []

                    response.on('error', function() {
                        console.log("error")
                        //log error
                        UpdateLogger.logStatus("Weekly update","Did not get data from API",error)
                    })
                    response.on('data', function (chunk) {
                        data += chunk
                    });
                    response.on('end', function() {
                        console.log("Got data")
                        
                        //log the progress
                        UpdateLogger.logStatus("Weekly update", "Response from the API received")

                        let matches = JSON.parse(data).matches


                        let promises = []

                        for (let resMatch of matches) {
                            promises.push(updateMatch(resMatch))
                        }

                        Promise.all(promises).then(updatedMatches => {
                            resolve(updatedMatches)
                        }).catch(error => {
                            UpdateLogger.logStatus("Weekly Update","Some error occured when resolving all promises", error)

                            reject(error)
                        })

                        function updateMatch(resMatch) {
                            return new Promise((resolve, reject) => {
                                Match.replaceOne({id: resMatch.id, lastUpdated: {$ne: resMatch.lastUpdated}},resMatch).then(updatedMatch => {
                                    console.log("After Update Try: ")
                                    console.log(resMatch.id)
                                    console.log(updatedMatch)
                                    resolve(updatedMatch)
                                }).catch(error => {
                                    console.log("Error: " + resMatch.id)
                                    console.log(error)
                                    reject(error)
                                })
                                
                            })
                        }
                    
                    })
                })
            })
                
            
        },{timezone: 'Europe/Sofia'}) 
    },
    dailyUpdate: function() {
        //1. At the beginning of the day, check all matches that are scheduled for the same day,
        //2. Save their id and date in a separate collection in the database,
        //3. If there are any matches for the day, start a scheduled task to check if the match has begun.
        cron.schedule('15 24 0 * * *', () => {
            return new Promise((resolve, reject) => {
                let today = new Date()
                today = today.getTime()
                let tomorrow = new Date()
                tomorrow.setDate(new Date().getDate() + 2)
                tomorrow.setHours(0)
                tomorrow.setMinutes(0)
                tomorrow.setSeconds(0)
                tomorrow = tomorrow.getTime()
    
                //log the status
                console.log("Daily Update")
                console.log("Today"+ new Date(today))
                console.log("Tomorrow" + new Date(tomorrow))
                UpdateLogger.logStatus("Daily Update", "Daily update initiated...")
    
    
                Match.find({dateMiliseconds: { $gt: today, $lt: tomorrow }}).then(matches => {
                   //if any matches are found, save them in the list with scheduled matches for the day
                   if(matches) {
                       UpdateLogger.logStatus("Daily Update", "Found some matches for today")
                       console.log("Found matches")
                       let promises = []
                       for (let match of matches) {
                           promises.push(moveToScheduled(match))
                       }
                       Promise.all(promises).then(movedMatches => {
                           UpdateLogger.logStatus("Daily Update", "Resolved with moved matches")
                           resolve(movedMatches)
                       }).catch(error => {
                           UpdateLogger.logStatus("Daily Update", "Rejected with error", error)
                           reject(error)
                       })
                   } else {
                       resolve("No matches today")
                   }
                }).catch(error => {
                   reject(error)
                })
    
                function moveToScheduled(match) {
                    return new Promise((resolve, reject) => {
                        ScheduledMatch.findOne({id:match.id}).then(resMatch => {
                            if(resMatch) {
                                resolve(resMatch.id + "Is already there")
                            }
                            //if not, save it
                            if(!resMatch){
                                match._id = mongoose.Types.ObjectId()
                                match.isNew = true
                                ScheduledMatch.create(match).then(savedMatch => {
                                    resolve("Id added: " + savedMatch.id)
                                }).catch(error => {
                                    console.log(error)
                                    console.log("Match could not be moved: " + match.id)
                                    reject("Match could not be moved: " + match.id)
                                })
                            }
                        }).catch(error => {
                            console.log(error)
                            reject("Scheduled match find failed..." + match.id)
                        })
                    })
                }
            })
        },  {timezone: "Europe/Sofia"})    
   },
   matchStartedUpdate: function() {
    //1. Check if a match has begun
    //2. If yes - start an interval (the function updateMatchLive)
        cron.schedule('50 1-59 * * * *', () => {
            return new Promise((resolve, reject) => {
                let loggerName = "Match Start Updater"
                let curTime = new Date()
                curTime = curTime.getTime()
                console.log("Checking if match has began")
                UpdateLogger.logStatus(loggerName, "Check if match started initiated...")
    
                ScheduledMatch.find({dateMiliseconds: {$lt : curTime}, status: {$ne: "FINISHED" || "CANCELED" || "POSTPONED"}}).then(matches => {
                    if (matches) {
                        UpdateLogger.logStatus(loggerName, "Some matches just started...")
                        let promises = []
                        for (let match of matches) {
                            promises.push(moveToLiveMatches(match))
                            //check if the match isn't there already
                        }
                        Promise.all(promises).then(movedMatches => {
                            UpdateLogger.logStatus(loggerName, "Resolved with some moved matches...")
                            resolve(movedMatches)
                        }).catch(error => {
                            UpdateLogger.logStatus(loggerName,"Rejected with an error", error)
                            reject(error)
                        })
                    }
                }).catch(error => {
                    reject(error)
                })
    
                function moveToLiveMatches(match) {
                    return new Promise((resolve, reject) => {
                        LiveMatch.findOne({id: match.id}).then(foundMatch => {
                            if(!foundMatch) {
                                //add the match to the collection with live matches
                                match._id = mongoose.Types.ObjectId();
                                match.isNew = true
                                LiveMatch.create(match).then(movedMatch => {
                                    ScheduledMatch.deleteOne({_id: movedMatch._id}).then(deletedMatch => {
                                        resolve("Match moved: " + deletedMatch)
                                    }).catch(error => {
                                        console.log("Scheduled match removal failed")
                                        reject(error)
                                    })
                                }).catch(error => {
                                    console.log("Live match create failed")
                                    reject(error)
                                })
                            }
                        }).catch(error => {
                            console.log("Live Match finding failed")
                            reject(error)
                        })
                    })
                }
            })
        },{timezone: 'Europe/London'}) 

        
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
       
    }
    
}