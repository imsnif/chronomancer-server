'use strict'
const r = require('rethinkdb')
const WebSocket = require('ws')

const { tables } = require('../config')

module.exports = function (connection, wss) {
  let changeFeeds = []
  tables.forEach(tableName => {
    r.table(tableName).changes().run(connection, (err, cursor) => {
      if (err) return // TODO: log
      changeFeeds.push(cursor)
      cursor.each((err, row) => {
        if (err) return // TODO: log
        wss.clients.forEach(ws => {
          try {
            if (ws.readyState === WebSocket.OPEN) {
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
  return changeFeeds
}
