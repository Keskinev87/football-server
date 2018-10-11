const http = require('http')

module.exports = {
    getMatch: function() {
        let apiToken = 'f8a83daa19804e2a966103601127b9b5'
        let options = {
            host: 'api.football-data.org',
            path: '/v2/competitions/2003',
            headers: {
                'X-Auth-Token': apiToken,
                'Content-Type': 'application/json'
            }
        }
        console.log("here")
        http.get(options, (response) => {
            console.log("and here")
            response.on('error', function() {
                console.log("error")
            })
            response.on('data', function (chunk) {
                console.log("body: " + chunk);
            });
            response.on('end', function() {
                console.log("success")
            })
            
        });

    }
}
