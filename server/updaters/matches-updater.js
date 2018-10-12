let moment = require('moment')
let http = require('http')
let Match = require('../data/Match')

module.exports = {
    updateMatches: function() {
        let apiToken = 'f8a83daa19804e2a966103601127b9b5'
        let options = {
            host: 'api.football-data.org',
            path: '/v2/competitions',
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
                let allCompetitions = JSON.parse(data).competitions
                let availableCompetitions = []
                allCompetitions.forEach(element => {
                    if (element.plan == "TIER_ONE") {
                        availableCompetitions.push(element.id)
                    }
                });
                
            })
            
        });
    },
    getAndSaveMatches: function() {
        let apiToken = 'f8a83daa19804e2a966103601127b9b5'
        let competitions = "2013,2016,2021,2001,2018,2015,2002,2019,2003,2017,2014,2000"
        for (let i = 0; i<=365; i+=10) {
            //TODO: put the code bellow here in order to update the database for one year ahead. The limitation of the API is maximum of 10 days for filtering. 
            //This is why we make the update with loop
            //Reminder: The API provides 10 calls per minute. Put some delay between each iteration. 
        }
        let dateBegin = moment('2018-10-31')
        let dateTo = moment('2018-11-10')
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
        
    }
}