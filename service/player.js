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
    },
    async removeItemFromPlayer (itemName, targetPlayerId) {
      // TODO: do this with one query
      const targetPlayerItems = await new Promise((resolve, reject) => {
        r.table('players').filter({id: targetPlayerId})('items').run(connection, (err, cursor) => {
          if (err) return reject(err)
          cursor.toArray((err, results) => {
            if (err) return reject(err)
            resolve(results[0])
          })
        })
      })
      const itemIndex = targetPlayerItems.map(i => i.name).indexOf(itemName)
      await new Promise((resolve, reject) => {
        r.table('players').filter({id: targetPlayerId}).update({
          items: r.row('items').deleteAt(itemIndex)
        }).run(connection, (err, cursor) => {
          if (err) return reject(err)
          return resolve()
        })
      })
      return Promise.resolve()
    },
    async declareWinner (playerId, gameId) {
      await new Promise((resolve, reject) => {
        r.table('games').filter({id: gameId}).update({
          winnerId: playerId
        }).run(connection, (err, cursor) => {
          if (err) return reject(err)
          return resolve()
        })
      })
      return Promise.resolve()
    }
  }
}
