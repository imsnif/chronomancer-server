'use strict'

const r = require('rethinkdb')
const { powerDurations } = require('../../config')
const _ = require('lodash')

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
      .filter({playerId: userId, timelineName})
      .run(conn, (err, cursor) => {
        if (err) return reject(err)
        cursor.toArray((err, results) => {
          if (err) return reject(err)
          resolve(results[0])
        })
      })
    })
  },
  getAllUserPowers (userId, timelineName, conn) {
    return new Promise((resolve, reject) => {
      r.db('chronomancer').table('powers')
      .filter({playerId: userId, timelineName})
      .run(conn, (err, cursor) => {
        if (err) return reject(err)
        cursor.toArray((err, results) => {
          if (err) return reject(err)
          resolve(results)
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
  },
  validatePowerTimes (power) {
    const duration = powerDurations[power.name]
    const range = 1000
    const now = new Date()
    const formatted = Object.assign({}, power, {
      startTime: (power && power.startTime + range > now.getTime()) || false,
      endTime: (power && power.endTime + range > now.getTime() + duration) || false
    })
    return _.omit(formatted, ['id'])
  },
  sortData (a, b) {
    const criteria = a.playerId && b.playerId ? 'playerId' : 'name'
    return a[criteria] > b[criteria] ? -1 : 1
  },
  failureTimeout (t) {
    return setTimeout(() => {
      t.fail('Timed out')
      t.end()
    }, 10000)
  },
  insertFakeData (tableName, data, connection) {
    return new Promise((resolve, reject) => {
      r.table(tableName).insert(data).run(connection, err => {
        if (err) return reject(err)
        resolve()
      })
    })
  }
}
