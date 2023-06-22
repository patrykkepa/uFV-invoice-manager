const mongodb = require('mongodb')
const config = require('./config')

const db = module.exports = {

    connection: null,

    init: (nextTick) => {
        try {
            mongodb.MongoClient.connect(config.dbUrl, config.dbOptions, (err, connection) => {
                if(!err) {
                    db.connection = connection.db(config.dbName)
                    db.users = db.connection.collection('users')
                    db.organizations = db.connection.collection('organizations')
                    nextTick()
                } else {
                    throw new Error('Failed to connect to db')
                }
            })
        } catch(ex) {
            console.error('FATAL! %s', ex.message)
            process.exit(1)
        }
    },

    users: null,
    notes: null,

    ObjectId: mongodb.ObjectId
}