const crypto = require('crypto')
const fs = require('fs')

const { passwordStrength } = require('check-password-strength')

const config = require('./config')
const db = require('./db')

module.exports = {
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
    fv_lookup: (payload, nextTick) => {
        switch(payload.body.key) {
          case 'number':
                db.connection.collection('organizations').aggregate([
                    {
                      "$unwind": "$fv"
                    },
                    {
                      "$match": {
                        "fv.number": payload.body.value
                      }
                    },
                    {
                      "$project": {
                          "_id": 0,
                          "author": "$fv.author",
                          "upload_date": "$fv.upload_date",
                          "date": "$fv.date",
                          "net_amount": "$fv.net_amount",
                          "gross_amount": "$fv.gross_amount",
                          "status": "$fv.status",
                          "company": "$fv.company",
                          "field": "$fv.field",
                          "number": "$fv.number",
                      }
                    }
                    ]).toArray( (err, obj) => {
                let value = []
                if (!err && obj) {
                    obj.forEach(el => {
                        delete el._id
                        delete el.acl
                        value.push(el)
                    })
                }
                nextTick(err || !obj ? { status: 400, error: 'not found' } : { 
                    status: 200, value: value, type: typeof value
                })
            })
            break
            case 'author':
              db.connection.collection('organizations').aggregate([
                  {
                    "$unwind": "$fv"
                  },
                  {
                    "$match": {
                      "fv.author": payload.body.value
                    }
                  },
                  {
                    "$project": {
                        "_id": 0,
                        "author": "$fv.author",
                        "upload_date": "$fv.upload_date",
                        "date": "$fv.date",
                        "net_amount": "$fv.net_amount",
                        "gross_amount": "$fv.gross_amount",
                        "status": "$fv.status",
                        "company": "$fv.company",
                        "field": "$fv.field",
                        "number": "$fv.number",
                    }
                  }
                  ]).toArray( (err, obj) => {
            let value = []
            if (!err && obj) {
                obj.forEach(el => {
                    delete el._id
                    delete el.acl
                    value.push(el)
                })
            }
            nextTick(err || !obj ? { status: 400, error: 'not found' } : { 
                status: 200, value: value, type: typeof value
            })
          })
          break
          case 'date':
            db.connection.collection('organizations').aggregate([
                {
                  "$unwind": "$fv"
                },
                {
                  "$match": {
                    "fv.date": payload.body.value
                  }
                },
                {
                  "$project": {
                      "_id": 0,
                      "author": "$fv.author",
                      "upload_date": "$fv.upload_date",
                      "date": "$fv.date",
                      "net_amount": "$fv.net_amount",
                      "gross_amount": "$fv.gross_amount",
                      "status": "$fv.status",
                      "company": "$fv.company",
                      "field": "$fv.field",
                      "number": "$fv.number",
                  }
                }
                ]).toArray( (err, obj) => {
            let value = []
            if (!err && obj) {
                obj.forEach(el => {
                    delete el._id
                    delete el.acl
                    value.push(el)
                })
            }
            nextTick(err || !obj ? { status: 400, error: 'not found' } : { 
                status: 200, value: value, type: typeof value
            })
        })
        break
        case 'status':
          db.connection.collection('organizations').aggregate([
              {
                "$unwind": "$fv"
              },
              {
                "$match": {
                  "fv.status": payload.body.value
                }
              },
              {
                "$project": {
                    "_id": 0,
                    "author": "$fv.author",
                    "upload_date": "$fv.upload_date",
                    "date": "$fv.date",
                    "net_amount": "$fv.net_amount",
                    "gross_amount": "$fv.gross_amount",
                    "status": "$fv.status",
                    "company": "$fv.company",
                    "field": "$fv.field",
                    "number": "$fv.number",
                }
              }
              ]).toArray( (err, obj) => {
        let value = []
        if (!err && obj) {
            obj.forEach(el => {
                delete el._id
                delete el.acl
                value.push(el)
            })
        }
        nextTick(err || !obj ? { status: 400, error: 'not found' } : { 
            status: 200, value: value, type: typeof value
        })
      })
      break
            default:
                nextTick({staus: 405, error: 'method not implemented'})
        }
    }
}