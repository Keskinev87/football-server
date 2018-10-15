const controllers = require('../controllers')
const passport = require('passport')
const auth = require('./auth')


module.exports = (app) => {
  // app.use('/user', passport.authenticate('jwt', {session: false}));
  app.post('/user/login', controllers.users.loginPost)
  app.post('/user/register', controllers.users.registerPost)
  app.get('/user/get', passport.authenticate('jwt', {session: false}), controllers.users.getUser)
  app.post('/users/logout', controllers.users.logout)
  app.get('/matches/getAll', controllers.matches.getAllMatches)
  app.post('/game/joinWithCode', passport.authenticate('jwt', {session: false}), controllers.games.joinGameWithCode)
  app.get('/game/getByCreator', passport.authenticate('jwt', {session: false}), controllers.games.getGameByCreator)
  app.get('/game/getById', passport.authenticate('jwt', {session: false}), controllers.games.getGameById)
  app.post('/game/create', passport.authenticate('jwt', {session: false}), controllers.games.createGame)
  app.post('/game/addCompetitions', passport.authenticate('jwt', {session: false}), controllers.games.addCompetitions)
  app.post('/game/addMatches', passport.authenticate('jwt', {session: false}), controllers.games.addCompetitions)
  app.post('/matches/saveMatch', passport.authenticate('jwt', {session: false}), controllers.matches.saveMatch)
  app.post('/matches/getMatchesById',passport.authenticate('jwt', {session: false}), controllers.matches.getMatchesById)
  app.get('/competitions/getAll', controllers.competitions.getAllCompetitions)
  app.post('/competitions/saveCompetition', passport.authenticate('jwt', {session: false}), controllers.competitions.saveCompetition)
  app.post('/competitions/getCompetitionById', passport.authenticate('jwt', {session: false}), controllers.competitions.getCompetitionsById)

  app.all('*', (req, res) => {
    res.status(404).send('404 Not Found!')
    res.end()
  })
}
