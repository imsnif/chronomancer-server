'use strict'
const r = require('rethinkdb')
const changeFeeds = require('./changefeeds')
const passport = require('passport')
const express = require('express')

const { tables } = require('../config')

function getInitData (tableName, connection, gameId, playerId) {
  const filter = tableName === 'games' ? {id: gameId} : {gameId}
  return new Promise((resolve, reject) => {
    r.db('chronomancer').table(tableName).filter(filter)
    .run(connection, (err, cursor) => {
      if (err) return reject(err)
      cursor.toArray((err, result) => {
        if (err) return reject(err)
        if (tableName === 'messages') {
          const formatted = result.map(m => Object.assign({}, m, { // TODO: move elsewhere
            readBy: undefined,
            read: m.readBy.includes(playerId)
          }))
          return resolve(formatted)
        }
        resolve(result)
      })
    })
  })
}

module.exports = function (app, connection) {
  connection.use('chronomancer')
  const { getPlayer } = require('../service/player')(connection)
  const feeds = changeFeeds(connection)
  const router = express.Router()
  router.use(passport.authenticate('facebook-token', {session: false}))
  router.ws('/feed', async (ws, req) => {
    const player = await getPlayer(req.user.id)
    if (!player || !player.gameId) return
    const { gameId } = player
    feeds.subscribePlayer(player.id, gameId, ws)
    const [ players, powers, timelines, games, messages ] = await Promise.all(
      tables.map(tableName => getInitData(tableName, connection, gameId, player.id))
    )
    const message = {
      players, powers, timelines, games, messages // TODO: filter games
    }
    ws.send(JSON.stringify(message))
  })
  app.use('/socket', router)
  app.on('close', () => {
    feeds.cursors.forEach(cursor => {
      cursor.close()
    })
  })
}
