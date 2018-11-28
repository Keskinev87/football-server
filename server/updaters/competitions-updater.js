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
    getFromApiAndSaveCompetition: function(competitionId) {
        return new Promise ((resolve, reject) => {
            console.log("Competition Id for Search: " + competitionId)
            
            let options = {
                host: env.apiRoot,
                path: '/v2/competitions/' + competitionId,
                headers: env.headers
            }
                
            http.get(options, (response) => {
                let data =''
        
                response.on('error', function() {
                    reject(error)
                })
                response.on('data', function (chunk) {
                    data += chunk
                });
                response.on('end', function() {
                    
                    let newCompetition = new Competition(JSON.parse(data));
    
                    Competition.findOne({id: newCompetition.id}).then(competition => {
             
                        if (competition) {
                            reject({error: "Competition already exists"})
                        }
                        else {
                            Competition.create(newCompetition).then(createdCompetition => {
                                resolve(createdCompetition)
                            }).catch(error => {
                                reject(error)
                            })
                        }       
                    })
                })
                    
            });
            
        })
        
        
        
    }
}
