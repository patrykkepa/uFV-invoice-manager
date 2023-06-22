const crypto = require('crypto')

const config = require('./config')
const db = require('./db')

const bindOrganization = (user, nextTick) => {
    delete user._id
    delete user.password
    if(user.organization) {
        db.organizations.findOne({ uuid: user.organization }, (err, organization) => {
            if(!err && organization) {
                user.organization = organization
            }
            nextTick(null, user)
        })
    } else return nextTick(null, user)
}

const auth = module.exports = {
    checkCredentials: (username, password, nextTick) => {
        let passwordHash = crypto.createHash('sha256').update(password).digest('hex')
        db.users.findOne({ username: username, password: passwordHash }, (err, user) => {
            if(err || !user) {
                config.logger.warn('Authentication failed for %s', username)
                return nextTick(null, false)
            }
            config.logger.verbose('Authentication succeded for %s', username)
            bindOrganization(user, nextTick)
        })
    },
    checkAuthenticated: (req, res, nextTick) => {
        if(req.isAuthenticated()) return nextTick()
        res.status(401).json({})
    },
    serialize: (user, nextTick) => { nextTick(null, user.uuid) },
    deserialize: (uuid, nextTick) => {
        db.users.findOne({ uuid }, (err, user) => {
            if(err || !user) {
                nextTick('No such user', null)
            } else {
                bindOrganization(user, nextTick)
            }
        })
    },
    login: (req, res) => {
        if(req.user) config.logger.debug('%s logged in', req.user.username)
        auth.whoami(req, res)
    },
    logout: (req, res) => {
        if(req.user) config.logger.debug('%s logged out', req.user.username)
        req.logout(() => {
            res.json({})        
        })
    },
    whoami: (req, res) => {
        if(req.user) {
            let endpoints = []
            if(req.user.acl) {
                endpoints = req.user.acl.map(ace => {
                    return { alias: ace.alias, methods: ace.methods }
                }) 
            }
            if(req.user.organization && req.user.organization.acl) {
                for(let ace of req.user.organization.acl) {
                    endpoints.push({ alias: ace.alias, methods: ace.methods })
                }
            }
            res.json({ uuid: req.user.uuid, username: req.user.username, organization: req.user.organization.name, endpoints })
        } else {
            res.json({})
        }
    }
}