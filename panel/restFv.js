const fs = require('fs')

const config = require('./config')
const db = require('./db')
const functions = require('./functions')
const { response } = require('express')


const restFv = module.exports = {
  lookup: (req, res, nextTick) => {
    switch(req.body.key) {
      case 'number':
            db.connection.collection('organizations').aggregate([
                {
                  "$unwind": "$fv"
                },
                {
                  "$match": {
                    "fv.number": req.body.value
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
        case 'author':
          db.connection.collection('organizations').aggregate([
              {
                "$unwind": "$fv"
              },
              {
                "$match": {
                  "fv.author": req.body.value
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
      case 'date':
        db.connection.collection('organizations').aggregate([
            {
              "$unwind": "$fv"
            },
            {
              "$match": {
                "fv.date": req.body.value
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
    case 'status':
      db.connection.collection('organizations').aggregate([
          {
            "$unwind": "$fv"
          },
          {
            "$match": {
              "fv.status": req.body.value
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
        default:
            res.status(405).json({ error: 'method not implemented' })
    }
  }
}

