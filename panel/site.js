const fs = require('fs')

const config = require('./config')
const db = require('./db')
const functions = require('./functions')
const { response } = require('express')


module.exports = (req, res) => {
    switch(req.method) {
        case 'GET':
            db.connection.collection('organizations').find({}).toArray((err, obj) => {
                if (!err && obj) {
                    let value = []
                    obj.forEach(el => {
                        delete el._id
                        delete el.acl
                        value.push(el)
                    })
                    res.json({type: typeof value, value: value})
                }else res.status(404).json({ error: 'not found' })
            })
            break
        case 'PUT':
            // res.json({value: req.body.name})
            db.connection.collection('organizations').find({ name : new RegExp(req.body.name) }).toArray( (err, obj) => {
                if (!err && obj) {
                    let value = []
                    obj.forEach(el => {
                        delete el._id
                        delete el.acl
                        value.push(el)
                    })
                    // res.json({type: typeof value, value: value})
                    res.json({type: typeof value, value: value})
                }else res.status(404).json({ error: 'not found' })
            })
            break
        default:
            res.status(405).json({ error: 'method not implemented' })
    }
}