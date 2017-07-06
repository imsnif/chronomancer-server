'use strict'

const r = require('rethinkdb')

module.exports = {
  getPlayerItems (id, conn) {
    return new Promise((resolve, reject) => {
      r.db('chronomancer').table('players').filter({id})('items').run(conn, (err, cursor) => {
        if (err) return reject(err)
        cursor.toArray((err, results) => {
          if (err) return reject(err)
          resolve(results[0])
        })
      })
    })
  },
  getPlayerActions (id, conn) {
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
}