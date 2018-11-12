const home = require('./home-controller')
const users = require('./users-controller')
const matches = require('./match-controller')
const competitions = require('./competition-controller')
const games = require('./games-controller')
const predictions = require('./predictions-controller')

module.exports = {
  home: home,
  users: users,
  matches: matches,
  competitions: competitions,
  games: games,
  predictions: predictions
}
