'use strict'
const r = require('rethinkdb')

module.exports = function timelineService (connection) {
  return {
    getTimelineItemType (timelineName, connection) {
      return new Promise((resolve, reject) => {
        r.table('timelines').filter({name: timelineName})('type').run(connection, (err, cursor) => {
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
