'use strict'
const r = require('rethinkdb')
const WebSocket = require('ws')

const { tables } = require('../config')

module.exports = function (connection, wss) {
  let cursors = []
  let players = []
  tables.forEach(tableName => {
    r.table(tableName).changes().run(connection, (err, cursor) => {
      if (err) return // TODO: log
      cursors.push(cursor)
      cursor.each((err, row) => {
        if (err) return // TODO: log
        players.forEach(({gameId, ws}) => {
          try {
            if (ws.readyState === WebSocket.OPEN && row.new_val.gameId === gameId) {
              const data = JSON.stringify({[tableName]: row.new_val})
              ws.send(data)
            }
          } catch (e) {
            console.error(e)
          }
        })
      })
    })
  })
  return {
    cursors,
    subscribePlayer: (playerId, gameId, ws) => {
      players.push({playerId, gameId, ws}) // TODO: remove first
    }
  }
}
