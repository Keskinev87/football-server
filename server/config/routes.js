const controllers = require('../controllers')
const passport = require('passport')
const auth = require('./auth')


module.exports = (app) => {
  // app.use('/user', passport.authenticate('jwt', {session: false}));
  app.post('/user/login', controllers.users.loginPost)
  app.post('/user/register', controllers.users.registerPost)
  app.get('/user/get', passport.authenticate('jwt', {session: false}), controllers.users.getUser)
  app.post('/users/logout', controllers.users.logout)
  app.get('/game/getAll', passport.authenticate('jwt', {session:false}), controllers.games.getGamesByParticipant)
  app.post('/game/joinWithCode', passport.authenticate('jwt', {session: false}), controllers.games.joinGameWithCode)
  app.post('/game/makePrediction', passport.authenticate('jwt', {session: false}), controllers.games.makePrediction)
  app.get('/game/getByCreator', passport.authenticate('jwt', {session: false}), controllers.games.getGameByCreator)
  app.post('/game/getById', passport.authenticate('jwt', {session: false}), controllers.games.getGameById)
  app.post('/game/create', passport.authenticate('jwt', {session: false}), controllers.games.createGame )
  app.post('/game/addCompetitions', passport.authenticate('jwt', {session: false}), controllers.games.addCompetitions)
  app.post('/game/addMatchesWithId', passport.authenticate('jwt', {session: false}), controllers.games.addMatchesWithId)
  app.post('/game/addMatchesWithCompetition', passport.authenticate('jwt', {session: false}), controllers.games.addMatchesWithCompetition)
  app.get('/matches/getAll', controllers.matches.getAllMatches)
  app.post('/matches/getByGameId', passport.authenticate('jwt', {session: false}), controllers.matches.getByGameId)
  app.get('/matches/getByCompetitionId', passport.authenticate('jwt', {session: false}), controllers.matches.getByCompetitionId)
  app.post('/matches/getById',passport.authenticate('jwt', {session: false}), controllers.matches.getById)
  app.post('/matches/saveMatch', passport.authenticate('jwt', {session: false}), controllers.matches.saveMatch)
  app.get('/competitions/getAll', passport.authenticate('jwt', {session: false}), controllers.competitions.getAllCompetitions)
  app.post('/competitions/saveCompetition', passport.authenticate('jwt', {session: false}), controllers.competitions.saveCompetition)
  app.post('/competitions/getCompetitionById', passport.authenticate('jwt', {session: false}), controllers.competitions.getCompetitionsById)

  app.all('*', (req, res) => {
    res.status(404).send('404 Not Found!')
    res.end() 
  })
}
