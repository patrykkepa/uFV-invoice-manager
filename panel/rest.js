const fs = require('fs')

const config = require('./config')
const db = require('./db')
const functions = require('./functions')


module.exports = (req, res) => {
    if(!req.params.alias) {
        res.status(400).json({ error: 'bad request' })
        return
    }
    let acl = []
    if(req.user.acl) acl = acl.concat(req.user.acl)
    if(req.user.organization && req.user.organization.acl) acl = acl.concat(req.user.organization.acl)
    let ace = acl.find(el => el.alias == req.params.alias)
    if(!ace || !ace.methods || !ace.methods.includes(req.method)) {
        res.status(403).json({ error: 'permission denied' })
        return
    }
    if(ace.collection) {
        switch(req.method) {
            case 'GET':
                db.connection.collection(ace.collection).findOne({ uuid: ace.uuid }, (err, obj) => {
                    if(!err && obj) {
                        let value = ace.key ? ace.key.split('.').reduce((previous, current) => previous[current], obj) : obj
                        delete value._id
                        res.json({ type: typeof value, value: value })
                    } else res.status(404).json({ error: 'not found' })
                })
                break
            case 'PUT':
                let value = req.body.value || null
                let update = {}
                if(ace.key) {
                    update[ace.key] = value
                } else if(value) {
                    delete value._id
                    delete value.uuid
                    Object.assign(update, value)
                } else {
                    res.status(400).json({ error: 'bad update request' })
                    break
                }
                db.connection.collection(ace.collection).updateOne({ uuid: ace.uuid }, { $set: update }, (err) => {
                    if(!err) {
                        res.json({ type: typeof value, value: value })
                    } else res.status(406).json({ error: 'update failed' })
                })
                break
            default:
                res.status(405).json({ error: 'method not implemented' })
        }
    } else if(ace.function && functions[ace.function] && typeof functions[ace.function] == 'function') {
        let payload = {
            acl: acl,
            method: req.method,
            args: ace.args,
            query: req.query,
            body: req.body,
        }
        functions[ace.function](payload, (retval) => {
            let status = retval.status ? retval.status : 200
            delete retval.status
            res.status(status).json(retval)    
        })
    } else {
        res.status(405).json({ error: 'method not implemented' })
    }
}