'use strict'
const express = require('express')
const {
  userExists,
  hasEnoughActions,
  validateAndSanitizeUserId,
  timelineExists,
  targetPlayerExists,
  userHasItem,
  userInTimeline,
  powerExists
} = require('../middleware/custom-validation')

module.exports = function biddingRoute (connection) {
  const route = express.Router()
  const { addAlly, addEnemy } = require('../service/power')(connection)
  const { decrementPlayerActions } = require('../service/player')(connection)
  route.use(validateAndSanitizeUserId)
  route.use(userExists(connection))
  route.use(hasEnoughActions(connection))
  route.post(
    '/assist/:timelineName/:targetPlayerId',
    timelineExists(connection),
    targetPlayerExists(connection),
    powerExists(connection),
    userInTimeline(connection),
    userHasItem('assist', connection),
    async (req, res, next) => {
      try {
        const { timelineName } = req.params
        const targetPlayerId = req.params.targetPlayerId
        const userId = req.headers.userid
        await addAlly(userId, timelineName, targetPlayerId)
        await decrementPlayerActions(userId)
        res.sendStatus(200)
      } catch (e) {
        next(e)
      }
    }
  )
  route.post(
    '/prevent/:timelineName/:targetPlayerId',
    timelineExists(connection),
    targetPlayerExists(connection),
    powerExists(connection),
    userInTimeline(connection),
    userHasItem('prevent', connection),
    async (req, res, next) => {
      try {
        const { timelineName } = req.params
        const targetPlayerId = req.params.targetPlayerId
        const userId = req.headers.userid
        await addEnemy(userId, timelineName, targetPlayerId)
        await decrementPlayerActions(userId)
        res.sendStatus(200)
      } catch (e) {
        next(e)
      }
    }
  )
  return route
}
