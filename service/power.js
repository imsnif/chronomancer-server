'use strict'
const r = require('rethinkdb')
const { powerDurations } = require('../config')

module.exports = function (connection) {
  return {
    createPower (powerStats) {
      const now = new Date()
      const power = Object.assign({}, powerStats, {
        gameId: 1,
        startTime: now.getTime(),
        endTime: now.getTime() + (powerDurations[powerStats.name] || 0),
        target: powerStats.target || {
          type: 'timeline',
          name: powerStats.timelineName
        },
        allies: [],
        enemies: []
      })
      return new Promise((resolve, reject) => {
        r.table('powers')
        .insert(power)
        .run(connection, (err, cursor) => {
          if (err) return reject(err)
          resolve()
        })
      })
    },
    deletePower (power) {
      return new Promise((resolve, reject) => {
        r.table('powers').get(power.id).delete().run(connection, (err, result) => {
          if (err) return reject(err)
          resolve()
        })
      })
    },
    powerHasSufficientScore (power) {
      const positive = power.allies.map(a => a.score).reduce((sum, item) => sum + item, 0) + 1
      const negative = power.enemies.map(a => a.score).reduce((sum, item) => sum + item, 0)
      return (positive - negative > 0)
    },
    getPowersToResolve () {
      return new Promise((resolve, reject) => {
        const now = new Date()
        r.table('powers').filter({gameId: 1})
        .filter(r.row('endTime').lt(now.getTime()))
        .run(connection, (err, cursor) => {
          if (err) return reject(err)
          cursor.toArray(async (err, powers) => {
            if (err) return reject(err)
            resolve(powers)
          })
        })
      })
    },
    getPower (playerId, timelineName) {
      return new Promise((resolve, reject) => {
        r.table('powers').filter({gameId: 1})
        .filter({playerId, timelineName})
        .run(connection, (err, cursor) => {
          if (err) return reject(err)
          cursor.toArray(async (err, powers) => {
            if (err) return reject(err)
            resolve(powers[0])
          })
        })
      })
    }
  }
}
