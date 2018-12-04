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
    
                ScheduledMatch.find({dateMiliseconds: {$lt : curTime}, status: {$ne: "FINISHED" || "CANCELED" || "SUSPENDED" || "POSTPONED"}}).then(matches => {
                    if (matches.length > 0) {
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
                    } else {
                        console.log("No matches added to schedule")
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
        },{timezone: 'Europe/Sofia'}) 

        
    },
    liveUpdate: function() {
        //USED TO UPDATE THE MATCH WHILE IT IS LIVE BY ASKING THE API FOR CHANGES EVERY 10 SECONDS
        
        //1. Gets started by "checkIfMatchHasBegun" whenever a match starts
        //2. Updates the match live until it finishes.
        //3. Whenever the match is finished, stop the interval
        //4. TODO: Manage the canceled/postponed case
        cron.schedule('50 1-59 * * * *', () => {
            return new Promise((resolve, reject) => {
                //TODO: add the canceled promises logic
                LiveMatch.find({}).then(resMatches => {
                    console.log("Searching for live matches...")
                    //if any matches are live, begin updating them
                    if(resMatches.length > 0) {
                        let updatePromises = []
                        let resolvePredictionPromises = []
                        let finishedMatchesPromises = []
                        let canceledPromises =[]

                        for (let resMatch of resMatches) {
                            //check if match has finished. If finished - update the match, update all predictions for this match, delete it from LiveMatches
                            if(resMatch.status === "FINISHED"){
                                //we will fill several arrays with promises here. All of the promises are declared below
                                resolvePredictionPromises.push(resolvePredictions(resMatch))
                                finishedMatchesPromises.push(resolveFinishedMatch(resMatch))
                            }
                            else if(resMatch.status === "CANCELED" || "POSTPONED" || "SUSPENDED"){
                                //TODO: Handle if the match was canceled, postponed or suspended
                            } else {
                                //The match is still live. Update it...
                                //Send request to the external API
                                updatePromises.push(getAndUpdateLiveMatch(resMatch))
                            }
                        }

                        //begin resolving the promises IF there are some
                        if (updatePromises.length > 0) {
                            Promise.all(updatePromises).then(updatedMatches => {
                                UpdateLogger.logStatus("Live Updater", "Updated some matches")
                            }).catch(error => {
                                console.log(error)
                            })
                        }

                        if (resolvePredictionPromises.length > 0) {
                            Promise.all(resolvePredictionPromises).then(updatedPredictions => {
                                UpdateLogger.logStatus("Live updater", "Updated the predictions")
                            }).catch(error => {
                                console.log(error)
                                UpdateLogger.logStatus("Live updater", "Some error when updating the predictions")
                            })
                        }

                        if (finishedMatchesPromises.length > 0) {
                            Promise.all(finishedMatchesPromises).then(resolvedMatches => {
                                for (let match of resolvedMatches) {
                                    deleteFinishedMatch(match).then(deletedMatch => {
                                        console.log("Match deleted: " + deletedMatch.id)
                                    }).catch(error => {
                                        console.log("Error when deleting live match:")
                                        console.log(error)
                                        UpdateLogger.logStatus("Live updater", "Error occured when deleting match", error)
                                    })
                                }
                            }).catch(error => {
                                console.log("Error from resolve finished matches")
                                console.log(error)
                                UpdateLogger.logStatus("Live updater", "Error occured when resolving the finished matches", error)
                            })
                        }

                        //resolve the promise
                        resolve("The live updater finished")


                    } else {
                        console.log("No Live Matches")
                        resolve("No matches found")
                    }
                    //all variables to connect with the API
                
                }).catch(error => {
                    console.log("No such match!")
                    UpdateLogger.logStatus("Live updater", "Error when searching for LiveMatches - first step ", error)
                    reject(error)
                })

                //promise for updating match in play. For now, we will only update the result. The scorer is not included in the free plan of the API
                function getAndUpdateLiveMatch(match) {

                    return new Promise((resolve, reject) => {
                        //the API options
                        let urlPath = "/v2/matches/" + resMatch.id
                        let options = {
                            host: env.apiRoot,
                            path: urlPath,
                            headers: env.headers
                        }
                        http.get(options, (response) => {
                            let data = ''
                
                            response.on('error', function() {
                                UpdateLogger.logStatus("Live updater","Could not get match from the API", error)
                                reject(error)
                            })
                            response.on('data', function (chunk) {
                                data += chunk
                            });
                            response.on('end', function() {
                                let apiMatch = JSON.parse(data).match
                                    //Check if something has changed and update the match if necessarry
                                    checkAndUpdateScores.checkAndUpdateScores(apiMatch, resMatch).then(match => {
                                        resolve("Match updated:" + match.id)
                                    }).catch(error => {
                                        UpdateLogger.logStatus("Live updater", "Error occured when updating the match" + match.id, error)
                                        reject(error)
                                    })
                                
                            })
                        })
                    }) 
                }

                //promise for finished match
                function resolvePredictions(match) {
                    return new Promise((resolve, reject) => {
                        predictionUpdater.updatePredictions(match).then(updatedPredictions => {
                            resolve(updatedPredictions)
                        }).catch(error => {
                            reject(error)
                        })
                    })
                }

                function resolveFinishedMatch(match) {
                    return new Promise((resolve, reject) => {
                        Match.findOneAndUpdate({id: match.id}, {$set: {'status': match.status, 'score': match.score}},(err, updatedMatch) =>{
                            if(err) {
                                reject(err)
                            } else {
                                resolve(updatedMatch)
                            }
                        })
                    })
                }

                function deleteFinishedMatch(match) {
                    return new Promise((resolve, reject) => {
                        LiveMatch.findOneAndDelete({id: match.id}, (err, res) => {
                            if(err) {
                                reject(err)
                            }
                            else {
                                resolve("Match deleted from live matches: " + match.id)
                            }
                        })
                    })
                }


            })
        }, {timezone: 'Europe/Sofia'})
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