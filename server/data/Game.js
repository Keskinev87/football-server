const mongoose = require('mongoose')


let gameSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: false},
    shareableUrl: { type: String, required: false },
    secretCode: { type: Number, required: false },
    competitions: {type: Array, required: false },
    matches: { type: Array, required: false },
    creator:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dateCreated: { type: Date, required: true},
    description: { type: String, required: false },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }]
})

let Game = mongoose.model('Game', gameSchema)
module.exports = Game
