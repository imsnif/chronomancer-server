'use strict'
const express = require('express')
const player = require('../service/player')
const timeline = require('../service/timeline')

module.exports = function timelineRoute (connection) {
  const route = express.Router()
  const {
    getPlayerActions,
    decrementPlayerActions,
    appendItemToPlayer
  } = player(connection)
  const { getTimelineItemType } = timeline(connection)
  route.post('/quest/:timelineName', async (req, res) => {
    try {
      const timelineName = req.params.timelineName
      const userId = req.headers.userid
      const itemType = await getTimelineItemType(timelineName, connection)
      const actionsLeft = await getPlayerActions(userId, connection)
      if (actionsLeft > 1) { // TODO: move to validation layer
        await appendItemToPlayer(userId, {name: itemType, source: timelineName}, connection)
        await decrementPlayerActions(userId, connection)
        res.sendStatus(200)
      } else {
        res.status(403).json({error: 'No actions left!'})
      }
    } catch (e) {
      console.error(e.message)
      console.log(e.stack)
    }
  })
  return route
}
