'use strict'
const express = require('express')
const passport = require('passport')
const player = require('../service/player')
const message = require('../service/message')

module.exports = function playerRoute (connection) {
  const route = express.Router()
  const {
    createOrUpdatePlayer
  } = player(connection)
  const {
    markMessagesAsRead
  } = message(connection)
  route.use(passport.authenticate('facebook-token', {session: false}))
  route.post(
    '/update',
    async (req, res, next) => {
      try {
        const userId = String(req.user.id)
        const userPic = req.user.photos[0].value.replace('large', 'square') // TODO: fix this
        const userName = req.user.displayName
        await createOrUpdatePlayer(userId, userPic, userName)
        res.sendStatus(200)
      } catch (e) {
        next(e)
      }
    }
  )
  route.post(
    '/read/:timestamp',
    async (req, res, next) => {
      try {
        const userId = String(req.user.id)
        const { timestamp } = req.params
        await markMessagesAsRead(userId, timestamp)
        res.sendStatus(200)
      } catch (e) {
        next(e)
      }
    }
  )
  return route
}
