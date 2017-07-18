'use strict'

const test = require('tape')
const fixtures = require('./fixtures')
const jobsFactory = require('../jobs')
const {
  createPower,
  getPower,
  getGame
} = require('./test-utils')

test('Win power resolution => success', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 8'
    const playerId = '9'
    const now = new Date()
    await createPower({
      playerId,
      gameId: 1,
      timelineName,
      name: 'Winning',
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
    const game = await getGame(1, conn)
    const power = await getPower(playerId, timelineName, conn)
    t.equals(game.winnerId, playerId, 'Winning power resolved into game victory')
    t.notOk(power, 'power was deleted')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Win power resolution => failure (negative score)', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 8'
    const playerId = '9'
    const now = new Date()
    await createPower({
      playerId,
      gameId: 1,
      timelineName,
      name: 'Winning',
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
    const game = await getGame(1, conn)
    const power = await getPower(playerId, timelineName, conn)
    t.equals(game.winnerId, undefined, 'Player was not declared as winner')
    t.notOk(power, 'power was deleted')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Win power resolution => failure (items no longer exists)', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 8'
    const playerId = '7'
    const now = new Date()
    await createPower({
      playerId,
      gameId: 1,
      timelineName,
      name: 'Winning',
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
    const game = await getGame(1, conn)
    const power = await getPower(playerId, timelineName, conn)
    t.equals(game.winnerId, undefined, 'Player was not declared as winner')
    t.notOk(power, 'power was deleted')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Win power resolution => failure (one item no longer exists)', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 8'
    const playerId = '8'
    const now = new Date()
    await createPower({
      playerId,
      gameId: 1,
      timelineName,
      name: 'Winning',
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
    const game = await getGame(1, conn)
    const power = await getPower(playerId, timelineName, conn)
    t.equals(game.winnerId, undefined, 'Player was not declared as winner')
    t.notOk(power, 'power was deleted')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Win power resolution => failure (player no longer in timeline)', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 1'
    const playerId = '9'
    const now = new Date()
    await createPower({
      playerId,
      gameId: 1,
      timelineName,
      name: 'Winning',
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
    const game = await getGame(1, conn)
    const power = await getPower(playerId, timelineName, conn)
    t.equals(game.winnerId, undefined, 'Player was not declared as winner')
    t.notOk(power, 'power was deleted')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})
