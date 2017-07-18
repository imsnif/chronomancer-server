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
    },
    addAlly (allyId, timelineName, playerId) {
      const aId = allyId
      return new Promise((resolve, reject) => {
        r.table('powers')
        .filter({gameId: 1, timelineName, playerId})
        .update({
          allies: r.branch(
            r.row('allies').map(a => a('id')).contains(aId), // already contains aId
            r.row('allies').map(a => { // find aId and increment score by 1
              return r.branch(
                a('id').eq(aId),
                a.merge({score: a('score').add(1)}),
                a
              )
            }),
            r.row('allies').append({id: aId, score: 1}) // append aId with score of 1
          )
        }).run(connection, (err, result) => {
          if (err) return reject(err)
          resolve(result)
        })
      })
    },
    addEnemy (enemyId, timelineName, playerId) {
      const eId = enemyId
      return new Promise((resolve, reject) => {
        r.table('powers')
        .filter({gameId: 1, timelineName, playerId})
        .update({
          enemies: r.branch(
            r.row('enemies').map(e => e('id')).contains(eId), // already contains eId
            r.row('enemies').map(e => { // find eId and increment score by 1
              return r.branch(
                e('id').eq(eId),
                e.merge({score: e('score').add(1)}),
                e
              )
            }),
            r.row('enemies').append({id: eId, score: 1}) // append eId with score of 1
          )
        }).run(connection, (err, result) => {
          if (err) return reject(err)
          resolve(result)
        })
      })
    }
  }
}
