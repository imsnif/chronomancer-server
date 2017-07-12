'use strict'
const r = require('rethinkdb')
const WebSocket = require('ws')
const changeFeeds = require('./changefeeds')

const { tables } = require('../config')

module.exports = function (server, connection) {
  connection.use('chronomancer')
  const wss = new WebSocket.Server({ server })
  wss.on('connection', ws => {
    Promise.all(
      tables.map(tableName => new Promise((resolve, reject) => {
        r.db('chronomancer').table(tableName).run(connection, (err, cursor) => {
          if (err) return reject(err)
          cursor.toArray((err, result) => {
            if (err) return reject(err)
            resolve(result)
          })
        })
      }))
    ).then(([players, powers, timelines]) => {
      const message = {
        players, powers, timelines
      }
      ws.send(JSON.stringify(message))
    })
  })
  const feeds = changeFeeds(connection, wss)
  server.on('close', () => {
    feeds.forEach(cursor => {
      cursor.close()
    })
  })
  return wss
}
