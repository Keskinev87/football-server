const path = require('path')

let rootPath = path.normalize(path.join(__dirname, '/../../'))

module.exports = {
  development: {
    // db: 'mongodb://localhost:27017/footballdb',
    db: 'mongodb://keskinev87:master88@footballdb-shard-00-00-6kdu1.mongodb.net:27017,footballdb-shard-00-01-6kdu1.mongodb.net:27017,footballdb-shard-00-02-6kdu1.mongodb.net:27017/test?ssl=true&replicaSet=footballdb-shard-0&authSource=admin&retryWrites=true',
    port: process.env.PORT
  },
  staging: {
  },
  production: {
    db: 'mongodb://keskinev87:master88@footballdb-shard-00-00-6kdu1.mongodb.net:27017,footballdb-shard-00-01-6kdu1.mongodb.net:27017,footballdb-shard-00-02-6kdu1.mongodb.net:27017/test?ssl=true&replicaSet=footballdb-shard-0&authSource=admin&retryWrites=true',
    port: process.env.PORT
  }
}
