const home = require('./home-controller')
const users = require('./users-controller')
const matches = require('./match-controller')
const competitions = require('./competition-controller')

module.exports = {
  home: home,
  users: users,
  matches: matches,
  competitions: competitions
}
