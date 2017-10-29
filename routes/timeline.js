'use strict'
const express = require('express')
const passport = require('passport')
const player = require('../service/player')
const timeline = require('../service/timeline')
const power = require('../service/power')
const message = require('../service/message')
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
  properItemsInArgs,
  hasRoomForItem,
  isNotOverIterationCap
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
  const {
    createMessage
  } = message(connection)
  route.use(passport.authenticate('facebook-token', {session: false}))
  route.use(userExists(connection))
  route.use(gameNotOver(connection))
  route.use(hasEnoughActions(connection))
  route.post(
    '/quest/:timelineName',
    timelineExists(connection),
    userInTimeline(connection),
    hasRoomForItem(connection),
    async (req, res, next) => {
      try {
        const timelineName = req.params.timelineName
        const playerId = String(req.user.id)
        const itemType = await getTimelineItemType(timelineName)
        await appendItemToPlayer(
          playerId,
          {name: itemType, source: timelineName}, connection
        )
        await createMessage({
          text: `is questing for ${itemType}`,
          timelineName,
          playerId
        })
        await decrementPlayerActions(playerId)
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
        const playerId = String(req.user.id)
        await createPower({
          playerId,
          name: 'Locking',
          timelineName
        })
        await createMessage({
          text: 'is locking the timeline',
          timelineName,
          playerId
        })
        await decrementPlayerActions(playerId)
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
        const playerId = String(req.user.id)
        await createPower({
          playerId,
          name: 'Unlocking',
          timelineName
        })
        await createMessage({
          text: 'is unlocking the timeline',
          timelineName,
          playerId
        })
        await decrementPlayerActions(playerId)
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
    isNotOverIterationCap(connection),
    async (req, res, next) => {
      try {
        const timelineName = req.params.timelineName
        const playerId = String(req.user.id)
        await addPlayerToTimeline(timelineName, playerId)
        await createMessage({
          text: 'has travelled to this timeline',
          timelineName,
          playerId
        })
        await decrementPlayerActions(playerId)
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
        const playerId = String(req.user.id)
        await createPower({
          playerId,
          name: 'Resetting',
          timelineName
        })
        await createMessage({
          text: 'is resetting the timeline',
          timelineName,
          playerId
        })
        await decrementPlayerActions(playerId)
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
    hasRoomForItem(connection),
    async (req, res, next) => {
      try {
        const { timelineName, itemName } = req.params
        const targetPlayerId = req.params.targetPlayerId
        const playerId = String(req.user.id)
        await createPower({
          playerId,
          name: 'Stealing',
          target: {
            type: 'player',
            id: targetPlayerId
          },
          itemName,
          timelineName
        })
        await createMessage({
          text: 'is stealing an item',
          timelineName,
          playerId
        })
        await decrementPlayerActions(playerId)
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
    hasRoomForItem(connection),
    async (req, res, next) => {
      try {
        const { timelineName, item1, item2 } = req.params
        const playerId = String(req.user.id)
        const targetItem = item1 === 'assist' && item2 === 'prevent' ? 'lock'
          : item1 === 'steal' && item2 === 'reset' ? 'unlock'
          : item1 === 'lock' && item2 === 'unlock' ? 'win' : 'N/A'
        await createPower({
          playerId,
          name: targetItem === 'win' ? 'Winning' : 'Combining',
          target: {
            type: 'timeline',
            name: timelineName,
            itemName: targetItem
          },
          timelineName
        })
        await createMessage({
          text: 'is combining items',
          timelineName,
          playerId
        })
        await decrementPlayerActions(playerId)
        res.sendStatus(200)
      } catch (e) {
        next(e)
      }
    }
  )
  return route
}
