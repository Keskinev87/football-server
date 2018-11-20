let Prediction = require('../data/Prediction')
let Game = require('../data/Game')

module.exports = {
    updatePrediction: function(match) {
        return new Promise((resolve, reject) => {
            //find all predictions for this match
            Prediction.find({matchId: match.id}).then(predictions => {
                if(predicitons) {
                    for (let prediction of predictions) {
                        let points = this.calculatePoints(match, prediction)
                    }
                }
            })

        })
    },
    calculatePoints: function(match, prediction) {
        let points = 0 //initial points awarded for the prediction
        let goalsHome = match.score.fullTime.homeTeam
        let goalsAway = match.score.fullTime.awayTeam
        let predHome = prediction.homeTeamScore
        let predAway = prediction.awayTeamScore
        
        //case exactMatch (you play 1:0, match ends 1:0)
        if(goalsHome == predHome && goalsAway == predAway)
            points += prediction.scoreRules.exactMatch
        //case goalDiff (you play 2:0, match ends 3:1)
        if((goalsHome - goalsAway) == (predHome - predAway) && predHome != predAway )
            points += prediction.scoreRules.goalDiff
        //case oneGoalDiff
        if((goalsHome == predHome && Math.abs(goalsAway - predAway) == 1) || (goalsAway == predAway && Math.abs(goalsHome - predHome) == 1))
            points += prediction.scoreRules.oneGoalDiff
        //case guessedWinner
        if()
            //case zeroZero
        	//TODO: complete the rules + probably make them with else if
        }
    }

}