let Prediction = require('../data/Prediction')
let Game = require('../data/Game')

module.exports = {
    updatePredictions: function(match) {
        return new Promise((resolve, reject) => {
            //find all predictions for this match
            Prediction.find({matchId: match.id}).then(predictions => {
                if(predictions) {
                    let goalsHome = match.score.fullTime.homeTeam
                    let goalsAway = match.score.fullTime.awayTeam
                    
                    let predictionPromises = []

                    for (let prediction of predictions) {
                        let predHome = prediction.homeTeamScore
                        let predAway = prediction.awayTeamScore
                        let predId = prediciton_id
                        
                        predictionPromises.push(resolvePrediction(goalsHome, goalsAway, predHome, predAway, predId))
                    }

                    Promise.all(predictionPromises).then(resolvedPredictions => {
                        resolve(resolvedPredictions)
                    }).catch(error => {
                        reject(error)
                    })

                    function resolvePrediction(goalsHome, goalsAway, predHome, predAway, predId) {
                        return new Promise((resolve, reject) => {
                            
                            let points = this.calculatePoints(goalsHome, goalsAway, predHome, predAway, prediction)

                            //update the prediction with the new score
                            Prediction.findOneAndUpdate({_id: predId}, {$set:{'points':points}}, {'new': true}, (err, updPrediction) => {
                                if (err) {
                                    reject(err)
                                }
                                if(updPrediction) {
                                    console.log("Updated Prediction")
                                    console.log(updPrediction)
                                    resolve("Updated Prediction: " + updPrediction._id)
                                }
                                else {
                                    console.log("No prediction was updated?!?")
                                    reject("No prediction was found?!?!")
                                }
                            })
                        })
                        
                    }

                } else {
                    console.log("No predictions for this match.")
                    reject("No predictions for this match")
                }
            }).catch(error => {
                console.log("Problem occured when searching for predictions")
                console.log(error)
                reject(error)
            })
        })
            
            
    },
    calculatePoints: function(goalsHome, goalsAway, predHome, predAway, prediction) {
        
        let points = 0 //initial points awarded for the prediction
        
        let rules = prediction.scoreRules

        //case exact tie (you play 1:1, match ends 1:1):
        if(predHome == predAway && predHome == goalsHome && predAway == goalsAway)
            points += Number(rules.exactTie)
            // console.log("Exact X")
        //case X but different goals (you play 1:1, match ends 2:2)""
        else if (predHome == predAway && goalsHome == goalsAway)
            points += Number(rules.tie)
            // console.log("X but different")
        //case exactMatch (you play 1:0, match ends 1:0):
        else if(goalsHome == predHome && goalsAway == predAway)
            points += Number(rules.exactMatch)
            // console.log("Exact match")
        //case goalDiff (you play 2:0, match ends 3:1):
        else if((goalsHome - goalsAway) == (predHome - predAway) && goalsHome != goalsAway )
            points += Number(rules.goalDiff)
            // console.log("Goal Diff")
        //case oneGoalDiff (you play 2:0, match ends 3:0, 2:1 or 1:0):
        else if((goalsHome == predHome && Math.abs(goalsAway - predAway) == 1) || (goalsAway == predAway && Math.abs(goalsHome - predHome) == 1))
            points += Number(rules.oneGoalDiff)
            // console.log("One Goal Diff")
        //case guessedWinner (none of the previous conditions is valid for you, but you still guessed the winner)
        else if(((goalsHome > goalsAway) && (predHome > predAway)) || ((goalsHome < goalsAway) && (predHome < predAway)))
            points += Number(rules.guessedWinner)
            // console.log("Guessed winner")
        else if (goalsHome == 0 && goalsAway == 0 && predHome == 0 && predAway == 0)
            point += Number(rules.zeroZero)
            // console.log("Zero - zero")
        else
            points = 0
            
            return points
            //case zeroZero
        	//TODO: complete the rules + probably make them with else if
    }
}

