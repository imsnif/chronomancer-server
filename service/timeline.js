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
        .run(connection, (err, cursor) => {
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
    }
  }
}
