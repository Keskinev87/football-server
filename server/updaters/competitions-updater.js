const http = require('http')
const Competition = require('../data/Competition')
const env = require('../utilities/env-variables')

module.exports = {
   
    updateCompetitions: function() {
        
        let options = {
            host: env.apiRoot,
            path: '/v2/competitions',
            headers: env.headers
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
    getFromApiAndSaveCompetition: function() {
        return new Promise((resolve, reject) => {
            let options = {
                host: env.apiRoot,
                path: '/v2/competitions/?plan=TIER_ONE',
                headers: env.headers
            }
                
            http.get(options, (response) => {
                let data =''
        
                response.on('error', function() {
                    return(error)
                })
                response.on('data', function (chunk) {
                    data += chunk
                });
                response.on('end', function() {
                   
                    let parsedData = JSON.parse(data)
                   
                    let competitions = parsedData.competitions;
                    
                    let promises = []
                    
                    for(let competition of competitions) {
                        promises.push(saveCompetitions(competition))
                    }

                    Promise.all(promises).then((responseCompetitions) => {
                        resolve(responseCompetitions)
                    }).catch(error => {
                        reject(error)
                    })

                   
                    
                })
                    
            });

            function saveCompetitions(competition) {
                
                return new Promise((resolve, reject) => {
                    Competition.findOne({id: competition.id}).then(foundCompetition => {
                        // console.log(competition)
                        if (foundCompetition) {
                            reject("Already There")
                        }
                        else {
                            Competition.create(competition).then(createdCompetition => {
                                console.log("Created one" + createdCompetition.id)
                                resolve(createdCompetition)
                            }).catch(error => {
                                reject(error)
                            })
                        }       
                    }).catch(error => {
                        reject(error)
                    })

                })
            }
        
        })
    }
}
                
