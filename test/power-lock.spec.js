'use strict'

const test = require('tape')
const fixtures = require('./fixtures')
const { getTimeline, createPower, getPower } = require('./test-utils')

test('Lock power resolution => success', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const jobs = require('../jobs')(conn)
    const timelineName = 'Timeline 1'
    const playerId = 3
    await createPower({
      playerId,
      gameId: 1,
      timelineName,
      name: 'Locking',
      startTime: Date.now(),
      endTime: Date.now(),
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

test('Lock power resolution => failure (negative score)', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const jobs = require('../jobs')(conn)
    const timelineName = 'Timeline 1'
    const playerId = 3
    await createPower({
      playerId,
      gameId: 1,
      timelineName,
      name: 'Locking',
      startTime: Date.now(),
      endTime: Date.now(),
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
    t.equals(timeline.isLocked, false, 'timeline is unlocked')
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
    const jobs = require('../jobs')(conn)
    const timelineName = 'Timeline 1'
    const playerId = 1
    await createPower({
      playerId,
      gameId: 1,
      timelineName,
      name: 'Locking',
      startTime: Date.now(),
      endTime: Date.now(),
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
    t.equals(timeline.isLocked, false, 'timeline is unlocked')
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
    const jobs = require('../jobs')(conn)
    const timelineName = 'Timeline 4'
    const playerId = 3
    await createPower({
      playerId,
      gameId: 1,
      timelineName,
      name: 'Locking',
      startTime: Date.now(),
      endTime: Date.now(),
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
    t.equals(timeline.isLocked, false, 'timeline is unlocked')
    t.notOk(power, 'power was deleted')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})
