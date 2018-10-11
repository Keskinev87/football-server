const http = require('http')

module.exports = {
    getCompetitions: function() {
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
                        availableCompetitions.push(element)
                        console.log("id: " + element.id);
                    }
                });
                
            })
            
        });

    }
}
