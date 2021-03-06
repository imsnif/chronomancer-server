'use strict'

const _ = require('lodash')

const test = require('tape')
const fixtures = require('./fixtures')
const jobsFactory = require('../jobs')
const {
  getTimeline,
  createPower,
  getPower,
  getPlayerItems,
  getMessages
} = require('./test-utils')

test('Reset power resolution => success', async t => {
  t.plan(5)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 1'
    const playerId = '3'
    const origTimeline = await getTimeline(timelineName, conn)
    const now = new Date()
    await createPower({
      playerId,
      gameId: 1,
      timelineName,
      name: 'Resetting',
      startTime: now.getTime(),
      endTime: now.getTime(),
      target: {
        type: 'timeline',
        name: timelineName
      },
      allies: [],
      enemies: []
    }, conn)
    await jobs()
    const perpetratorItems = await getPlayerItems(playerId, conn)
    const playerItems = await Promise.all(
      origTimeline.players
      .filter(pId => pId !== playerId)
      .map(pId => getPlayerItems(pId, conn))
    )
    const timeline = await getTimeline(timelineName, conn)
    const power = await getPower(playerId, timelineName, conn)
    const messages = await getMessages(conn)
    const createdMessage = messages.find(m => m.timelineName === timelineName)
    t.deepEquals(timeline.players, ['3'], 'all other players removed from timeline')
    t.notOk(power, 'power was deleted')
    t.ok(
      playerItems.reduce((memo, items) => memo.concat(items)).every(i => i.source !== timelineName),
      'All items originating in this timeline removed'
    )
    t.ok(perpetratorItems.map(i => i.source).includes(timelineName), 'Perpetrator did not lose their items')
    t.deepEquals(_.omit(createdMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId,
      timelineName,
      readBy: [],
      text: 'Has reset the timeline'
    }, 'message created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Reset power resolution => failure (negative score)', async t => {
  t.plan(4)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 1'
    const playerId = '3'
    const origTimeline = await getTimeline(timelineName, conn)
    const origPlayerItems = await Promise.all(
      origTimeline.players.map(pId => getPlayerItems(pId, conn))
    )
    const now = new Date()
    await createPower({
      playerId,
      gameId: 1,
      timelineName,
      name: 'Resetting',
      startTime: now.getTime(),
      endTime: now.getTime(),
      target: {
        type: 'timeline',
        name: timelineName
      },
      allies: [],
      enemies: [{id: 1, score: 2}]
    }, conn)
    await jobs()
    const timeline = await getTimeline(timelineName, conn)
    const playerItems = await Promise.all(
      origTimeline.players.map(pId => getPlayerItems(pId, conn))
    )
    const power = await getPower(playerId, timelineName, conn)
    const messages = await getMessages(conn)
    const createdMessage = messages.find(m => m.timelineName === timelineName)
    t.deepEquals(origTimeline.players, timeline.players, 'all players still in timeline')
    t.deepEquals(origPlayerItems, playerItems, 'player items have not changed')
    t.notOk(power, 'power was deleted')
    t.deepEquals(_.omit(createdMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId,
      timelineName,
      readBy: [],
      text: 'Failed while resetting: too much resistance'
    }, 'message created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Reset power resolution => failure (item no longer exists)', async t => {
  t.plan(4)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 1'
    const playerId = '1'
    const origTimeline = await getTimeline(timelineName, conn)
    const origPlayerItems = await Promise.all(
      origTimeline.players.map(pId => getPlayerItems(pId, conn))
    )
    const now = new Date()
    await createPower({
      playerId,
      gameId: 1,
      timelineName,
      name: 'Resetting',
      startTime: now.getTime(),
      endTime: now.getTime(),
      target: {
        type: 'timeline',
        name: timelineName
      },
      allies: [],
      enemies: []
    }, conn)
    await jobs()
    const timeline = await getTimeline(timelineName, conn)
    const playerItems = await Promise.all(
      origTimeline.players.map(pId => getPlayerItems(pId, conn))
    )
    const power = await getPower(playerId, timelineName, conn)
    const messages = await getMessages(conn)
    const createdMessage = messages.find(m => m.timelineName === timelineName)
    t.deepEquals(origTimeline.players, timeline.players, 'all players still in timeline')
    t.deepEquals(origPlayerItems, playerItems, 'player items have not changed')
    t.notOk(power, 'power was deleted')
    t.deepEquals(_.omit(createdMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId,
      timelineName,
      readBy: [],
      text: 'Failed while Resetting: never had reset item!'
    }, 'message created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Reset power resolution => failure (player no longer in timeline)', async t => {
  t.plan(4)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 2'
    const playerId = '4'
    const origTimeline = await getTimeline(timelineName, conn)
    const origPlayerItems = await Promise.all(
      origTimeline.players.map(pId => getPlayerItems(pId, conn))
    )
    const now = new Date()
    await createPower({
      playerId,
      gameId: 1,
      timelineName,
      name: 'Resetting',
      startTime: now.getTime(),
      endTime: now.getTime(),
      target: {
        type: 'timeline',
        name: timelineName
      },
      allies: [],
      enemies: []
    }, conn)
    await jobs()
    const timeline = await getTimeline(timelineName, conn)
    const playerItems = await Promise.all(
      origTimeline.players.map(pId => getPlayerItems(pId, conn))
    )
    const power = await getPower(playerId, timelineName, conn)
    const messages = await getMessages(conn)
    const createdMessage = messages.find(m => m.timelineName === timelineName)
    t.deepEquals(origTimeline.players, timeline.players, 'all players still in timeline')
    t.deepEquals(origPlayerItems, playerItems, 'player items have not changed')
    t.notOk(power, 'power was deleted')
    t.deepEquals(_.omit(createdMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId,
      timelineName,
      readBy: [],
      text: 'Failed while resetting: was never in timeline!'
    }, 'message created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})
