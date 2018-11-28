const mongoose = require('mongoose')
const encryption = require('../utilities/encryption')


let userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  fullName: { type: String, required: true },
  games: { type: Array, required: false },
  salt: String,
  hashedPass: String,
  roles: [String],
  dateCreated: { type: Date, required: true }
})

userSchema.method({
  authenticate: function (password) {
    return encryption.generateHashedPassword(this.salt, password) === this.hashedPass
  }
})

let User = mongoose.model('User', userSchema)

module.exports = User
module.exports.seedAdminUser = () => {
  User.find({username: 'admin@admin.com'}).then(users => {
    if (users.length > 0) return

    let salt = encryption.generateSalt()
    let hashedPass = encryption.generateHashedPassword(salt, 'Master88#')
    let dateCreated = new Date()

    User.create({
      username: 'admin@admin.com',
      fullName: 'Admin',
      games:[],
      salt: salt,
      hashedPass: hashedPass,
      roles: ['Admin'],
      dateCreated: dateCreated
    })
  })
}
