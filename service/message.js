'use strict'
const r = require('rethinkdb')

module.exports = function (connection) {
  return {
    createMessage (messageStats) {
      const now = new Date()
      const message = Object.assign({}, messageStats, {
        gameId: 1,
        startTime: now.getTime(),
        text: messageStats.text,
        readBy: []
      })
      return new Promise((resolve, reject) => {
        r.table('messages')
        .insert(message)
        .run(connection, (err, cursor) => {
          if (err) return reject(err)
          resolve()
        })
      })
    },
    async markMessagesAsRead (playerId, timestamp) {
      return new Promise((resolve, reject) => {
        r.table('messages')
        .filter(r.row('startTime').lt(Number(timestamp) + 1))
        .update({
          readBy: r.branch(
            r.row('readBy').contains(playerId),
            r.row('readBy'),
            r.row('readBy').append(playerId)
          )
        }).run(connection, (err, cursor) => {
          if (err) return reject(err)
          resolve()
        })
      })
    }
  }
}
