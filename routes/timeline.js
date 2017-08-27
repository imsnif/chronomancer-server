'use strict'
const express = require('express')
const passport = require('passport')
const player = require('../service/player')
const timeline = require('../service/timeline')
const power = require('../service/power')
const {
  gameNotOver,
  userExists,
  hasEnoughActions,
  timelineExists,
  userInTimeline,
  userNotInTimeline,
  userHasItem,
  timelineIsUnlocked,
  timelineIsLocked,
  userHasNoPowerInTimeline,
  targetPlayerInTimeline,
  targetPlayerHasItem,
  targetPlayerIsNotUser,
  userHasItemsInArgs,
  properItemsInArgs
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
  route.use(passport.authenticate('facebook-token', {session: false}))
  route.use(userExists(connection))
  route.use(gameNotOver(connection))
  route.use(hasEnoughActions(connection))
  route.post(
    '/quest/:timelineName',
    timelineExists(connection),
    userInTimeline(connection),
    async (req, res, next) => {
      try {
        const timelineName = req.params.timelineName
        const userId = String(req.user.id)
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
        const userId = String(req.user.id)
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
        const userId = String(req.user.id)
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
        const userId = String(req.user.id)
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
        const userId = String(req.user.id)
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
    targetPlayerIsNotUser(connection),
    userHasNoPowerInTimeline(connection),
    userHasItem('steal', connection),
    targetPlayerInTimeline(connection),
    targetPlayerHasItem(connection),
    async (req, res, next) => {
      try {
        const { timelineName, itemName } = req.params
        const targetPlayerId = req.params.targetPlayerId
        const userId = String(req.user.id)
        await createPower({
          playerId: userId,
          name: 'Stealing',
          target: {
            type: 'player',
            id: targetPlayerId
          },
          itemName,
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
    '/combine/:item1/:item2/:timelineName',
    timelineExists(connection),
    userInTimeline(connection),
    userHasItemsInArgs(connection),
    properItemsInArgs(),
    userHasNoPowerInTimeline(connection),
    async (req, res, next) => {
      try {
        const { timelineName, item1, item2 } = req.params
        const userId = String(req.user.id)
        const targetItem = item1 === 'assist' && item2 === 'prevent' ? 'lock'
          : item1 === 'steal' && item2 === 'reset' ? 'unlock'
          : item1 === 'lock' && item2 === 'unlock' ? 'win' : 'N/A'
        await createPower({
          playerId: userId,
          name: targetItem === 'win' ? 'Winning' : 'Combining',
          target: {
            type: 'timeline',
            name: timelineName,
            itemName: targetItem
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
