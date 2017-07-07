'use strict'
const express = require('express')
const player = require('../service/player')
const timeline = require('../service/timeline')
const {
  userExists,
  hasEnoughActions,
  validateAndSanitizeUserId,
  timelineExists,
  userInTimeline,
  userNotInTimeline,
  userHasItem,
  timelineIsUnlocked,
  timelineIsLocked
} = require('../middleware/custom-validation')

module.exports = function timelineRoute (connection) {
  const route = express.Router()
  const {
    decrementPlayerActions,
    appendItemToPlayer
  } = player(connection)
  const {
    getTimelineItemType,
    lockTimeline,
    unlockTimeline,
    addPlayerToTimeline
  } = timeline(connection)
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
    userHasItem('lock', connection),
    timelineIsUnlocked(connection),
    async (req, res, next) => {
      try {
        const timelineName = req.params.timelineName
        const userId = req.headers.userid
        await lockTimeline(timelineName)
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
    userHasItem('unlock', connection),
    timelineIsLocked(connection),
    async (req, res, next) => {
      try {
        const timelineName = req.params.timelineName
        const userId = req.headers.userid
        await unlockTimeline(timelineName)
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
  return route
}
