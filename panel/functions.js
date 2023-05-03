const crypto = require('crypto')
const fs = require('fs')

const { passwordStrength } = require('check-password-strength')

const config = require('./config')
const db = require('./db')

module.exports = {
    version: (payload, nextTick) => {
        nextTick({ status: 200, toolName: config.toolName, version: config.version })
    },
    validatePassword: (payload, nextTick) => {
        if(!payload.args) nextTick({ status: 400, error: 'no user to validate password' })
        else if(!payload.body.password) nextTick({ status: 400, error: 'no password given' })
        else {
            let passwordHash = crypto.createHash('sha256').update(payload.body.password).digest('hex')
            db.connection.collection('users').findOne({ uuid: payload.args, password: passwordHash }, (err, user) => {
                nextTick(err || !user ? { status: 401, error: 'wrong password' } : { status: 200 })
            })
        }
    },
    changePassword: (payload, nextTick) => {
        if(!payload.args) nextTick({ status: 400, error: 'no user to change password' })
        else if(!payload.body.password) nextTick({ status: 400, error: 'no password given' })
        else {
            let strength = passwordStrength(payload.body.password)
            strength.required = config.requiredPasswordStrength
            switch(payload.method) {
                case 'POST':
                    nextTick(strength)
                    break
                case 'PUT':
                    if(strength.id < strength.required) nextTick({ status: 400, error: 'password too weak' })
                    else
                        db.connection.collection('users').updateOne({ uuid: payload.body.uuid }, { $set: { password: crypto.createHash('sha256').update(payload.body.password).digest('hex') } }, (err, updated) => {
                            nextTick(err ? { status: 400, error: 'password not updated' } : { status: 200, info: "password updated"})
                        })
                    break
                default:
                    nextTick({ status: 405, error: 'method not implemented' })
            }
        }
    },
}