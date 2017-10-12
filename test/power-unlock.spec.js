'use strict'

const _ = require('lodash')

const test = require('tape')
const fixtures = require('./fixtures')
const jobsFactory = require('../jobs')
const {
  getTimeline,
  createPower,
  getPower,
  getMessages
} = require('./test-utils')

test('Unlock power resolution => success', async t => {
  t.plan(3)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 5'
    const playerId = '3'
    const now = new Date()
    await createPower({
      playerId,
      gameId: 1,
      timelineName,
      name: 'Unlocking',
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
    const power = await getPower(playerId, timelineName, conn)
    const messages = await getMessages(conn)
    const createdMessage = messages.find(m => m.timelineName === timelineName)
    t.equals(timeline.isLocked, false, 'timeline is locked')
    t.notOk(power, 'power was deleted')
    t.deepEquals(_.omit(createdMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId,
      timelineName,
      readBy: [],
      text: 'Has unlocked the timeline'
    }, 'message created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Unlock power resolution => failure (negative score)', async t => {
  t.plan(3)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 5'
    const playerId = '3'
    const now = new Date()
    await createPower({
      playerId,
      gameId: 1,
      timelineName,
      name: 'Unlocking',
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
    const power = await getPower(playerId, timelineName, conn)
    const messages = await getMessages(conn)
    const createdMessage = messages.find(m => m.timelineName === timelineName)
    t.equals(timeline.isLocked, true, 'timeline is locked')
    t.notOk(power, 'power was deleted')
    t.deepEquals(_.omit(createdMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId,
      timelineName,
      readBy: [],
      text: 'Failed while unlocking: too much resistance'
    }, 'message created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Unlock power resolution => failure (item no longer exists)', async t => {
  t.plan(3)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 5'
    const playerId = '1'
    const now = new Date()
    await createPower({
      playerId,
      gameId: 1,
      timelineName,
      name: 'Unlocking',
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
    const power = await getPower(playerId, timelineName, conn)
    const messages = await getMessages(conn)
    const createdMessage = messages.find(m => m.timelineName === timelineName)
    t.equals(timeline.isLocked, true, 'timeline is locked')
    t.notOk(power, 'power was deleted')
    t.deepEquals(_.omit(createdMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId,
      timelineName,
      readBy: [],
      text: 'Failed while Unlocking: never had unlock item!'
    }, 'message created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Unlock power resolution => failure (player no longer in timeline)', async t => {
  t.plan(3)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 5'
    const playerId = '4'
    const now = new Date()
    await createPower({
      playerId,
      gameId: 1,
      timelineName,
      name: 'Unlocking',
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
    const power = await getPower(playerId, timelineName, conn)
    const messages = await getMessages(conn)
    const createdMessage = messages.find(m => m.timelineName === timelineName)
    t.equals(timeline.isLocked, true, 'timeline is locked')
    t.notOk(power, 'power was deleted')
    t.deepEquals(_.omit(createdMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId,
      timelineName,
      readBy: [],
      text: 'Failed while unlocking: was never in timeline!'
    }, 'message created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})
