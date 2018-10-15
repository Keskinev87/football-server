const mongoose = require('mongoose')


let gameSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true},
    shareableUrl: { type: String, required: false },
    secretCode: { type: Number, required: false },
    competitions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Competition', required: false }],
    matches: { type: Array, required: false },
    creator:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    description: { type: String, required: false },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }]
})

let Game = mongoose.model('Game', gameSchema)
module.exports = Game
