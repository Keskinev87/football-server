const http = require('http')
const Competition = require('../data/Competition')

module.exports = {
    updateCompetitions: function() {
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
    getAndSaveCompetitions: function() {
        let apiToken = 'f8a83daa19804e2a966103601127b9b5'
        let availableCompetitions = [2013, 2016, 2021, 2001, 2018, 2015, 2002, 2019, 2003, 2017, 2014, 2000]
        availableCompetitions.forEach((element) => {
            let comPath = "/v2/competitions/" + element
            let options = {
                host: 'api.football-data.org',
                path: comPath,
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
                    let newCompetition = new Competition(JSON.parse(data));

                    Competition.findOne({id: newCompetition.id}).then(competition => {
         
                    if (competition) {
                        console.log('Competition already exists') 
                    }
                    else {
                        Competition.create(newCompetition, (err) => {
                            if (err) {
                                console.log(err)
                                console.log(element)
                            }
                            else console.log('Competition Saved')
                        })
                    }       
                    })
                })
                
            });
        })
        
        
    }
}
