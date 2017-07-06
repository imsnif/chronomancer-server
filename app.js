'use strict'
const r = require('rethinkdb')
const express = require('express')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

function getTimelineItemType (timelineName, connection) {
  return new Promise((resolve, reject) => {
    r.table('timelines').filter({name: timelineName})('type').run(connection, (err, cursor) => {
      if (err) return reject(err)
      cursor.toArray((err, results) => {
        if (err) return reject(err)
        resolve(results[0])
      })
    })
  })
}

function appendItemToPlayer (userId, item, connection) {
  const id = Number(userId)
  return new Promise((resolve, reject) => {
    r.table('players').filter({id}).update({
      items: r.row('items').append(item)
    }).run(connection, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

function decrementPlayerActions (userId, connection) {
  const id = Number(userId)
  return new Promise((resolve, reject) => {
    r.table('players').filter({id}).update({
      actions: r.row('actions').sub(1).default(0)
    }).run(connection, (err, result) => {
      if (err) return reject(err)
      resolve(result)
    })
  })
}

function getPlayerActions (userId, conn) {
  const id = Number(userId)
  return new Promise((resolve, reject) => {
    r.db('chronomancer').table('players').filter({id})('actions').run(conn, (err, cursor) => {
      if (err) return reject(err)
      cursor.toArray((err, results) => {
        if (err) return reject(err)
        resolve(results[0])
      })
    })
  })
}

module.exports = function (connection) {
  connection.use('chronomancer')
  app.post('/timeline/quest/:timelineName', async (req, res) => {
    try {
      const timelineName = req.params.timelineName
      const userId = req.headers.userid
      const itemType = await getTimelineItemType(timelineName, connection)
      const actionsLeft = await getPlayerActions(userId, connection)
      if (actionsLeft > 1) { // TODO: move to validation layer
        await appendItemToPlayer(userId, {name: itemType, source: timelineName}, connection)
        await decrementPlayerActions(userId, connection)
        res.sendStatus(200)
      } else {
        res.status(403).json({error: 'No actions left!'})
      }
    } catch (e) {
      console.error(e.message)
      console.log(e.stack)
    }
  })
  return app
}
