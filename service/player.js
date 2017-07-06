'use strict'
const r = require('rethinkdb')

module.exports = function playerService (connection) {
  return {
    appendItemToPlayer (id, item) {
      return new Promise((resolve, reject) => {
        r.table('players').filter({id}).update({
          items: r.row('items').append(item)
        }).run(connection, (err, result) => {
          if (err) return reject(err)
          resolve(result)
        })
      })
    },
    decrementPlayerActions (id) {
      return new Promise((resolve, reject) => {
        r.table('players').filter({id}).update({
          actions: r.row('actions').sub(1).default(0)
        }).run(connection, (err, result) => {
          if (err) return reject(err)
          resolve(result)
        })
      })
    },
    getPlayerActions (id) {
      return new Promise((resolve, reject) => {
        r.table('players').filter({id})('actions').run(connection, (err, cursor) => {
          if (err) return reject(err)
          cursor.toArray((err, results) => {
            if (err) return reject(err)
            resolve(results[0])
          })
        })
      })
    },
    getPlayer (id) {
      return new Promise((resolve, reject) => {
        r.table('players').filter({id}).run(connection, (err, cursor) => {
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
