'use strict'

const test = require('tape')
const fixtures = require('./fixtures')
const jobsFactory = require('../jobs')
const { getTimeline, createPower, getPower } = require('./test-utils')

test('Unlock power resolution => success', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 5'
    const playerId = 3
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
    t.equals(timeline.isLocked, false, 'timeline is locked')
    t.notOk(power, 'power was deleted')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Lock power resolution => failure (negative score)', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 5'
    const playerId = 3
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
    t.equals(timeline.isLocked, true, 'timeline is locked')
    t.notOk(power, 'power was deleted')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Lock power resolution => failure (item no longer exists)', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 5'
    const playerId = 1
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
    t.equals(timeline.isLocked, true, 'timeline is locked')
    t.notOk(power, 'power was deleted')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Lock power resolution => failure (player no longer in timeline)', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 5'
    const playerId = 4
    const now = new Date()
    await createPower({
      playerId,
      gameId: 1,
      timelineName,
      name: 'Locking',
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
    t.equals(timeline.isLocked, true, 'timeline is locked')
    t.notOk(power, 'power was deleted')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})
