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
  },
  getTimeline (name, conn) {
    return new Promise((resolve, reject) => {
      r.db('chronomancer').table('timelines').filter({name}).run(conn, (err, cursor) => {
        if (err) return reject(err)
        cursor.toArray((err, results) => {
          if (err) return reject(err)
          resolve(results[0])
        })
      })
    })
  },
  createPower (power, conn) {
    return new Promise((resolve, reject) => {
      r.db('chronomancer').table('powers')
      .insert(power)
      .run(conn, (err, cursor) => {
        if (err) return reject(err)
        resolve()
      })
    })
  },
  getPower (userId, timelineName, conn) {
    return new Promise((resolve, reject) => {
      r.db('chronomancer').table('powers')
      .filter({userId, timelineName})
      .run(conn, (err, cursor) => {
        if (err) return reject(err)
        cursor.toArray((err, results) => {
          if (err) return reject(err)
          resolve(results[0])
        })
      })
    })
  },
  getAllPowers (conn) {
    return new Promise((resolve, reject) => {
      r.db('chronomancer').table('powers')
      .run(conn, (err, cursor) => {
        if (err) return reject(err)
        cursor.toArray((err, results) => {
          if (err) return reject(err)
          resolve(results)
        })
      })
    })
  }
}
