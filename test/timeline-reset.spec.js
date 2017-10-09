'use strict'

const _ = require('lodash')

const test = require('tape')
const request = require('supertest')
const fixtures = require('./fixtures')
const {
  getPlayerActions,
  getPower,
  validatePowerTimes,
  createPower,
  getAllUserPowers,
  stubPassport,
  getMessages
} = require('./test-utils')

test('POST /timeline/reset/:timelineName => resets timeline with existing players', async t => {
  t.plan(2)
  try {
    const userId = '3'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 1'
    await request(app)
      .post(`/timeline/reset/${timelineName}`)
      .expect(200)
    const power = await getPower(userId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    const expectedPower = {
      playerId: userId,
      gameId: 1,
      timelineName,
      name: 'Resetting',
      startTime: true,
      endTime: true,
      target: {
        type: 'timeline',
        name: timelineName
      },
      allies: [],
      enemies: []
    }
    t.deepEquals(validatePowerTimes(power), expectedPower, 'power created properly')
    t.equals(actions, 9, 'one action was decremented')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/reset/:timelineName => creates relevant message', async t => {
  t.plan(1)
  try {
    const userId = '3'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 1'
    await request(app)
      .post(`/timeline/reset/${timelineName}`)
      .expect(200)
    const messages = await getMessages(conn)
    const relevantMessage = messages.find(m => m.playerId === userId)
    t.deepEquals(_.omit(relevantMessage, ['id', 'startTime']), {
      gameId: 1,
      playerId: userId,
      readBy: [],
      text: 'is resetting the timeline',
      timelineName
    }, 'message created as expected')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/reset/:timelineName => with no actions left', async t => {
  t.plan(2)
  try {
    const userId = '5'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 5'
    await request(app)
      .post(`/timeline/reset/${timelineName}`)
      .expect(403)
    const power = await getPower(userId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 0, 'actions remain at 0')
    t.notOk(power, 'power not created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/reset/:timelineName => with no reset item', async t => {
  t.plan(2)
  try {
    const userId = '1'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 5'
    await request(app)
      .post(`/timeline/reset/${timelineName}`)
      .expect(403)
    const power = await getPower(userId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 10, 'actions not decremented')
    t.notOk(power, 'power not created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/reset/:timelineName => bad parameters - no userId', async t => {
  t.plan(1)
  try {
    stubPassport('foo', 'bar', null)
    const conn = await fixtures()
    const app = require('../app')(conn)
    await request(app)
      .post('/timeline/reset/Timeline 5')
      .expect(403)
    t.pass('request failed without a user id')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/reset/:timelineName => bad parameters - no timelineName', async t => {
  t.plan(1)
  try {
    const userId = '3'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    await request(app)
      .post('/timeline/reset')
      .expect(404)
    t.pass('request failed without a timeline name')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/reset/:timelineName => bad parameters - non-existent user', async t => {
  t.plan(1)
  try {
    const userId = '99999'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    await request(app)
      .post('/timeline/reset/Timeline 1')
      .expect(403)
    t.pass('request failed with a non-existent user')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/reset/:timelineName => bad parameters - non-existent timeline', async t => {
  t.plan(1)
  try {
    const userId = '3'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    await request(app)
      .post('/timeline/reset/foo')
      .expect(403)
    t.pass('request failed with a non-existent user')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/reset/:timelineName => user not in timeline', async t => {
  t.plan(2)
  try {
    const userId = '3'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 4'
    await request(app)
      .post(`/timeline/reset/${timelineName}`)
      .expect(403)
    const power = await getPower(userId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 10, 'actions not decremented')
    t.notOk(power, 'power not created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /timeline/reset/:timelineName => user busy (has power) in timeline', async t => {
  t.plan(2)
  try {
    const userId = '3'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 5'
    const now = new Date()
    await createPower({
      playerId: userId,
      gameId: 1,
      timelineName,
      name: 'Locking',
      startTime: now.getTime(),
      endTime: now.getTime() + 10000,
      target: {
        type: 'timeline',
        name: timelineName
      },
      allies: [],
      enemies: []
    }, conn)
    await request(app)
      .post(`/timeline/reset/${timelineName}`)
      .expect(403)
    const power = await getAllUserPowers(userId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 10, 'actions not decremented')
    t.equals(power.length, 1, 'power not created')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})
