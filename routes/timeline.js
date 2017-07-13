'use strict'
const express = require('express')
const player = require('../service/player')
const timeline = require('../service/timeline')
const power = require('../service/power')
const {
  userExists,
  hasEnoughActions,
  validateAndSanitizeUserId,
  timelineExists,
  userInTimeline,
  userNotInTimeline,
  userHasItem,
  timelineIsUnlocked,
  timelineIsLocked,
  userHasNoPowerInTimeline,
  targetPlayerInTimeline,
  targetPlayerHasItem
} = require('../middleware/custom-validation')

module.exports = function timelineRoute (connection) {
  const route = express.Router()
  const {
    decrementPlayerActions,
    appendItemToPlayer
  } = player(connection)
  const {
    getTimelineItemType,
    addPlayerToTimeline
  } = timeline(connection)
  const {
    createPower
  } = power(connection)
  route.use(validateAndSanitizeUserId)
  route.use(userExists(connection))
  route.use(hasEnoughActions(connection))
  route.post(
    '/quest/:timelineName',
    timelineExists(connection),
    userInTimeline(connection),
    async (req, res, next) => {
      try {
        const timelineName = req.params.timelineName
        const userId = req.headers.userid
        const itemType = await getTimelineItemType(timelineName)
        await appendItemToPlayer(
          userId,
          {name: itemType, source: timelineName}, connection
        )
        await decrementPlayerActions(userId)
        res.sendStatus(200)
      } catch (e) {
        next(e)
      }
    }
  )
  route.post(
    '/lock/:timelineName',
    timelineExists(connection),
    userInTimeline(connection),
    userHasNoPowerInTimeline(connection),
    userHasItem('lock', connection),
    timelineIsUnlocked(connection),
    async (req, res, next) => {
      try {
        const timelineName = req.params.timelineName
        const userId = req.headers.userid
        await createPower({
          playerId: userId,
          name: 'Locking',
          timelineName
        })
        await decrementPlayerActions(userId)
        res.sendStatus(200)
      } catch (e) {
        next(e)
      }
    }
  )
  route.post(
    '/unlock/:timelineName',
    timelineExists(connection),
    userInTimeline(connection),
    userHasNoPowerInTimeline(connection),
    userHasItem('unlock', connection),
    timelineIsLocked(connection),
    async (req, res, next) => {
      try {
        const timelineName = req.params.timelineName
        const userId = req.headers.userid
        await createPower({
          playerId: userId,
          name: 'Unlocking',
          timelineName
        })
        await decrementPlayerActions(userId)
        res.sendStatus(200)
      } catch (e) {
        next(e)
      }
    }
  )
  route.post(
    '/join/:timelineName',
    timelineExists(connection),
    userNotInTimeline(connection),
    timelineIsUnlocked(connection),
    async (req, res, next) => {
      try {
        const timelineName = req.params.timelineName
        const userId = req.headers.userid
        await addPlayerToTimeline(timelineName, userId)
        await decrementPlayerActions(userId)
        res.sendStatus(200)
      } catch (e) {
        next(e)
      }
    }
  )
  route.post(
    '/reset/:timelineName',
    timelineExists(connection),
    userInTimeline(connection),
    userHasNoPowerInTimeline(connection),
    userHasItem('reset', connection),
    async (req, res, next) => {
      try {
        const timelineName = req.params.timelineName
        const userId = req.headers.userid
        await createPower({
          playerId: userId,
          name: 'Resetting',
          timelineName
        })
        await decrementPlayerActions(userId)
        res.sendStatus(200)
      } catch (e) {
        next(e)
      }
    }
  )
  route.post(
    '/steal/:itemName/:targetPlayerId/:timelineName',
    timelineExists(connection),
    userInTimeline(connection),
    userHasNoPowerInTimeline(connection),
    userHasItem('steal', connection),
    targetPlayerInTimeline(connection),
    targetPlayerHasItem(connection),
    async (req, res, next) => {
      try {
        const timelineName = req.params.timelineName
        const targetPlayerId = Number(req.params.targetPlayerId)
        const userId = req.headers.userid
        await createPower({
          playerId: userId,
          name: 'Stealing',
          target: {
            type: 'player',
            id: targetPlayerId
          },
          timelineName
        })
        await decrementPlayerActions(userId)
        res.sendStatus(200)
      } catch (e) {
        next(e)
      }
    }
  )
  return route
}
