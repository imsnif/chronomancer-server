'use strict'
const r = require('rethinkdb')
const WebSocket = require('ws')
const changeFeeds = require('./changefeeds')

const { tables } = require('../config')

function getInitData (tableName, connection, gameId) {
  const filter = tableName === 'games' ? {id: gameId} : {gameId}
  return new Promise((resolve, reject) => {
    r.db('chronomancer').table(tableName).filter(filter)
    .run(connection, (err, cursor) => {
      if (err) return reject(err)
      cursor.toArray((err, result) => {
        if (err) return reject(err)
        resolve(result)
      })
    })
  })
}

module.exports = function (server, connection) {
  connection.use('chronomancer')
  const { getPlayer } = require('../service/player')(connection)
  const wss = new WebSocket.Server({ server })
  const feeds = changeFeeds(connection, wss)
  wss.on('connection', ws => {
    ws.once('message', async m => {
      const player = await getPlayer(m)
      if (!player || !player.gameId) return
      const { gameId } = player
      feeds.subscribePlayer(player.id, gameId, ws)
      const [ players, powers, timelines, games ] = await Promise.all(
        tables.map(tableName => getInitData(tableName, connection, gameId))
      )
      const message = {
        players, powers, timelines, games // TODO: filter games
      }
      ws.send(JSON.stringify(message))
    })
  })
  server.on('close', () => {
    feeds.cursors.forEach(cursor => {
      cursor.close()
    })
  })
  return wss
}
