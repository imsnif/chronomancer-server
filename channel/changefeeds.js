'use strict'
const r = require('rethinkdb')
const WebSocket = require('ws')

const { tables } = require('../config')

module.exports = function (connection) {
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
            if (ws.readyState === WebSocket.OPEN && (
              (row && row.new_val && row.new_val.gameId === gameId) ||
              (row && row.old_val && row.old_val.gameId === gameId) ||
              (tableName === 'games') // TODO: filter by gameId
            )) {
              const content = row.new_val || Object.assign({}, row.old_val, {name: false})
              // sending without a name deletes the entity
              const data = JSON.stringify({[tableName]: content})
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
