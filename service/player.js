'use strict'
const r = require('rethinkdb')

module.exports = function playerService (connection) {
  return {
    appendItemToPlayer (userId, item, connection) {
      const id = Number(userId)
      return new Promise((resolve, reject) => {
        r.table('players').filter({id}).update({
          items: r.row('items').append(item)
        }).run(connection, (err, result) => {
          if (err) return reject(err)
          resolve(result)
        })
      })
    },
    decrementPlayerActions (userId, connection) {
      const id = Number(userId)
      return new Promise((resolve, reject) => {
        r.table('players').filter({id}).update({
          actions: r.row('actions').sub(1).default(0)
        }).run(connection, (err, result) => {
          if (err) return reject(err)
          resolve(result)
        })
      })
    },
    getPlayerActions (userId, conn) {
      const id = Number(userId)
      return new Promise((resolve, reject) => {
        r.table('players').filter({id})('actions').run(conn, (err, cursor) => {
          if (err) return reject(err)
          cursor.toArray((err, results) => {
            if (err) return reject(err)
            resolve(results[0])
          })
        })
      })
    }
  }
}
