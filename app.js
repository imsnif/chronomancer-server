'use strict'
const r = require('rethinkdb')
const express = require('express')
const bodyParser = require('body-parser')

const http = require('http');
const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

module.exports = function (connection) {
  connection.use('chronomancer')
  app.post('/timeline/quest/:timelineName', async (req, res) => {
    try {
      const timelineName = req.params.timelineName
      const userId = req.headers.userid
      const itemType = await new Promise((resolve, reject) => {
        r.table('timelines').filter({name: timelineName})('type').run(connection, (err, cursor) => {
          if (err) return reject(err)
          cursor.toArray((err, results) => {
            if (err) return reject(err)
            resolve(results[0])
          })
        })
      })
      await new Promise((resolve, reject) => {
        r.table('players').filter({id: Number(userId)}).update({
          items: r.row('items').append({name: itemType, source: timelineName})
        }).run(connection, (err, result) => {
          if (err) return reject(err)
          resolve(result)
        })
      })
      res.sendStatus(200)
    } catch (e) {
      console.error(e.message)
      console.log(e.stack)
    }
  })
  return app
}
