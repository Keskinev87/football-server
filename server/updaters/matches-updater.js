let moment = require('moment')
let http = require('http')
let Match = require('../data/Match')
let cron = require('node-cron')

module.exports = {
  
    getAndSaveMatches: function() {
        let apiToken = 'f8a83daa19804e2a966103601127b9b5'
        let competitions = "2013,2016,2021,2001,2018,2015,2002,2019,2003,2017,2014,2000"
        for (let i = 0; i<=365; i+=10) {
            //TODO: put the code bellow here in order to update the database for one year ahead. The limitation of the API is maximum of 10 days for filtering. 
            //This is why we make the update with loop
            //Reminder: The API provides 10 calls per minute. Put some delay between each iteration. 
        }
        let dateBegin = moment('2018-11-12')
        let dateTo = moment('2018-11-22')
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

            response.on('error', function() {
                console.log("error")
            })
            response.on('data', function (chunk) {
                data += chunk
            });
            response.on('end', function() {
                let matches = JSON.parse(data).matches
                matches.forEach((resMatch) => {
                    console.log(resMatch.utcDate)
                    console.log(typeof(resMatch.utcDate))
                    let dateMiliseconds = new Date(resMatch.utcDate).getTime()
                    resMatch.dateMiliseconds = dateMiliseconds

                    Match.findOne({id: resMatch.id}).then(match => {
         
                        if (match) {
                            console.log('Match already exists!') 
                        }
                        else {
                            Match.create(resMatch, (err) => {
                                if (err) {
                                    console.log(err)
                                    console.log(match)
                                }
                                else console.log('Match Saved')
                            })
                        }       
                    })
                })
            })
            
        });
        
    },
    updateMatchLive: function() {
        cron.schedule('0-59/10 * * * * *', () =>  {
            console.log('stoped task');
          })
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
        cron.schedule('1-5 1 0 * * *', () => {
            console.log("updated for today")
        }, {timezone: "Europe/Sofia"})    
    },
    checkIfMatchHasBegun: function() {
        //1. Check every 
    }
}