'use strict'
const r = require('rethinkdb')
const changeFeeds = require('./changefeeds')
const passport = require('passport')
const express = require('express')

const { tables } = require('../config')

function getInitData (tableName, connection, gameId) {
  const filter = tableName === 'games' ? {id: gameId} : {gameId}
  return new Promise((resolve, reject) => {
    r.db('chronomancer').table(tableName).filter(filter)
    .run(connection, (err, cursor) => {
      if (err) return reject(err)
      cursor.toArray((err, result) => {
        if (err) return reject(err)
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
    const [ players, powers, timelines, games ] = await Promise.all(
      tables.map(tableName => getInitData(tableName, connection, gameId))
    )
    const message = {
      players, powers, timelines, games // TODO: filter games
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
