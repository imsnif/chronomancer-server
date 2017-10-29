'use strict'
const r = require('rethinkdb')

module.exports = function timelineService (connection) {
  return {
    getTimelineItemType (timelineName) {
      return new Promise((resolve, reject) => {
        r.table('timelines').filter({name: timelineName})('type').run(connection, (err, cursor) => {
          if (err) return reject(err)
          cursor.toArray((err, results) => {
            if (err) return reject(err)
            resolve(results[0])
          })
        })
      })
    },
    getTimeline (timelineName) {
      return new Promise((resolve, reject) => {
        r.table('timelines').filter({name: timelineName}).run(connection, (err, cursor) => {
          if (err) return reject(err)
          cursor.toArray((err, results) => {
            if (err) return reject(err)
            resolve(results[0])
          })
        })
      })
    },
    lockTimeline (timelineName) {
      return new Promise((resolve, reject) => {
        r.table('timelines').filter({name: timelineName})
        .update({isLocked: true})
        .run(connection, async (err, cursor) => {
          if (err) return reject(err)
          resolve()
        })
      })
    },
    unlockTimeline (timelineName) {
      return new Promise((resolve, reject) => {
        r.table('timelines').filter({name: timelineName})
        .update({isLocked: false})
        .run(connection, (err, cursor) => {
          if (err) return reject(err)
          resolve()
        })
      })
    },
    addPlayerToTimeline (timelineName, userId) {
      return new Promise((resolve, reject) => {
        r.table('timelines').filter({name: timelineName})
        .update({
          players: r.row('players').append(userId)
        })
        .run(connection, (err, cursor) => {
          if (err) return reject(err)
          resolve()
        })
      })
    },
    removeOtherPlayersFromTimeline (timelineName, userId) {
      return new Promise((resolve, reject) => {
        r.table('timelines').filter({name: timelineName})
        .update({
          players: [userId]
        })
        .run(connection, (err, cursor) => {
          if (err) return reject(err)
          resolve()
        })
      })
    },
    removePlayersItemsFromTimeline (timelineName, playerIds) {
      return new Promise((resolve, reject) => {
        r.table('players')
        .getAll(r.args(playerIds))
        .update((row) => {
          return {
            'items': row('items')
              .filter((item) => item('source').ne(timelineName))
          }
        })
        .run(connection, (err, cursor) => {
          if (err) return reject(err)
          resolve()
        })
      })
    },
    async checkPlayerInTimeline (timelineName, playerId) {
      const { getTimeline } = require('../service/timeline')(connection)
      const { players } = await getTimeline(timelineName)
      return players.includes(playerId)
    },
    getPlayerTimelines (id) {
      return new Promise((resolve, reject) => {
        r.table('timelines').filter(r.row('players').contains(id)).run(connection, (err, cursor) => {
          if (err) return reject(err)
          cursor.toArray((err, results) => {
            if (err) return reject(err)
            resolve(results)
          })
        })
      })
    }
  }
}
