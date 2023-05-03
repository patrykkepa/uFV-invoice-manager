const winston = require('winston')
const express = require('express')
const expressSession = require('express-session')
const passport = require('passport')
const passportJson = require('passport-json')
const bodyParser = require('body-parser')

// common modules
const common = require('../config/common')

// local modules
const config = require('./config')
const db = require('./db')
const auth = require('./auth')
const rest = require('./rest')
const restFv = require('./restFv')
const site = require('./site')

// configuration and logging
common.loadConfig(config)
if(config.logToConsole) {
    config.logConfiguration.transports.push(new winston.transports.Console() )
} else {
    config.logConfiguration.transports.push(new winston.transports.File( { filename: config.logDir + '/' + config.toolName + '.log' } ))
}
config.logger = winston.createLogger(config.logConfiguration)

// express initialization
const app = express()
app.use(bodyParser.json())
app.use(expressSession({ secret: config.toolName, resave: false , saveUninitialized: true }))
// source of static content
app.use(express.static('static'))

// passport initialization
app.use(passport.initialize())
app.use(passport.session())
passport.use(new passportJson.Strategy(auth.checkCredentials))
passport.serializeUser(auth.serialize)
passport.deserializeUser(auth.deserialize)

// authentication endpoints
app.get('/auth', auth.whoami)
app.post('/auth', passport.authenticate('json'), auth.login)
app.delete('/auth', auth.logout)

// data endpoint
// app.all('/rest/:alias', auth.checkAuthenticated, rest)

app.get('/rest/:alias', auth.checkAuthenticated, rest)
app.put('/rest/:alias', auth.checkAuthenticated, rest)

app.post('/rest/fv', auth.checkAuthenticated, restFv.lookup)

// main process
process.title = (config.processPrefix || "") + config.toolName
db.init(() => {
    app.listen(config.panelPort, () => {
        config.logger.info('%s listening on port %d', config.toolName, config.panelPort)
    })
})