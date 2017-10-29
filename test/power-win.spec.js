'use strict'

const _ = require('lodash')

const test = require('tape')
const fixtures = require('./fixtures')
const jobsFactory = require('../jobs')
const {
  createPower,
  getPower,
  getGame,
  getMessages
} = require('./test-utils')

test('Win power resolution => success', async t => {
  t.plan(3)
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
    const messages = await getMessages(conn)
    const createdMessage = messages.find(m => m.timelineName === timelineName)
    t.equals(game.winnerId, playerId, 'Winning power resolved into game victory')
    t.notOk(power, 'power was deleted')
    t.deepEquals(_.omit(createdMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId,
      timelineName,
      readBy: [],
      text: 'Has won the game!'
    }, 'message created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Win power resolution => failure (negative score)', async t => {
  t.plan(3)
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
    const messages = await getMessages(conn)
    const createdMessage = messages.find(m => m.timelineName === timelineName)
    t.equals(game.winnerId, undefined, 'Player was not declared as winner')
    t.notOk(power, 'power was deleted')
    t.deepEquals(_.omit(createdMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId,
      timelineName,
      readBy: [],
      text: 'Failed while winning: too much resistance'
    }, 'message created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Win power resolution => failure (items no longer exists)', async t => {
  t.plan(3)
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
    const messages = await getMessages(conn)
    const createdMessage = messages.find(m => m.timelineName === timelineName)
    t.equals(game.winnerId, undefined, 'Player was not declared as winner')
    t.notOk(power, 'power was deleted')
    t.deepEquals(_.omit(createdMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId,
      timelineName,
      readBy: [],
      text: 'Failed while Winning: never had required items!'
    }, 'message created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Win power resolution => failure (one item no longer exists)', async t => {
  t.plan(3)
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
    const messages = await getMessages(conn)
    const createdMessage = messages.find(m => m.timelineName === timelineName)
    t.equals(game.winnerId, undefined, 'Player was not declared as winner')
    t.notOk(power, 'power was deleted')
    t.deepEquals(_.omit(createdMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId,
      timelineName,
      readBy: [],
      text: 'Failed while Winning: never had required items!'
    }, 'message created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Win power resolution => failure (player no longer in timeline)', async t => {
  t.plan(3)
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
    const messages = await getMessages(conn)
    const createdMessage = messages.find(m => m.timelineName === timelineName)
    t.equals(game.winnerId, undefined, 'Player was not declared as winner')
    t.notOk(power, 'power was deleted')
    t.deepEquals(_.omit(createdMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId,
      timelineName,
      readBy: [],
      text: 'Failed while winning: was never in timeline!'
    }, 'message created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test.only('Win power resolution => failure (player no longer has room)', async t => {
  t.plan(3)
  try {
    const conn = await fixtures()
    const jobs = jobsFactory(conn)
    const timelineName = 'Timeline 9'
    const playerId = '10'
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
    const messages = await getMessages(conn)
    const createdMessage = messages.find(m => m.timelineName === timelineName)
    t.equals(game.winnerId, undefined, 'Player was not declared as winner')
    t.notOk(power, 'power was deleted')
    t.deepEquals(_.omit(createdMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId,
      timelineName,
      readBy: [],
      text: 'Failed while Winning: never had room for item!'
    }, 'message created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})
