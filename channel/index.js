'use strict'
const r = require('rethinkdb')
const WebSocket = require('ws')
const changeFeeds = require('./changefeeds')

const { tables } = require('../config')

module.exports = function (server, connection) {
  connection.use('chronomancer')
  const { getPlayer } = require('../service/player')(connection)
  const wss = new WebSocket.Server({ server })
  const feeds = changeFeeds(connection, wss)
  wss.on('connection', ws => {
    ws.once('message', async m => {
      const player = await getPlayer(m)
      if (player && player.gameId) {
        const { gameId } = player
        feeds.subscribePlayer(player.id, gameId, ws)
        const [ players, powers, timelines ] = await Promise.all(
          tables.map(tableName => new Promise((resolve, reject) => {
            r.db('chronomancer').table(tableName).filter({gameId})
            .run(connection, (err, cursor) => {
              if (err) return reject(err)
              cursor.toArray((err, result) => {
                if (err) return reject(err)
                resolve(result)
              })
            })
          }))
        )
        const message = {
          players, powers, timelines
        }
        ws.send(JSON.stringify(message))
      }
    })
  })
  server.on('close', () => {
    feeds.cursors.forEach(cursor => {
      cursor.close()
    })
  })
  return wss
}
