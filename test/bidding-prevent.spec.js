'use strict'

const test = require('tape')
const request = require('supertest')
const fixtures = require('./fixtures')
const { getPlayerActions, getPower, stubPassport } = require('./test-utils')

test('POST /bidding/prevent/:timelineName/:targetPlayerId => adds player to enemies', async t => {
  t.plan(2)
  try {
    const userId = '3'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 6'
    const targetPlayerId = '1'
    await request(app)
      .post(`/bidding/prevent/${timelineName}/${targetPlayerId}`)
      .expect(200)
    const power = await getPower(targetPlayerId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.deepEquals(power.enemies, [{id: '3', score: 1}], 'player added to enemies')
    t.equals(actions, 9, 'actions decremented by 1')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /bidding/prevent/:timelineName/:targetPlayerId => adds score to existing ally', async t => {
  t.plan(2)
  try {
    const userId = '3'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 6'
    const targetPlayerId = '2'
    await request(app)
      .post(`/bidding/prevent/${timelineName}/${targetPlayerId}`)
      .expect(200)
    const power = await getPower(targetPlayerId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.deepEquals(power.enemies, [{id: '3', score: 2}], 'player added to enemies')
    t.equals(actions, 9, 'actions decremented by 1')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /bidding/prevent/:timelineName/:targetPlayerId => with no actions left', async t => {
  t.plan(2)
  try {
    const userId = '5'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 6'
    const targetPlayerId = '1'
    await request(app)
      .post(`/bidding/prevent/${timelineName}/${targetPlayerId}`)
      .expect(403)
    const power = await getPower(targetPlayerId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.deepEquals(power.enemies, [], 'player not added to enemies')
    t.equals(actions, 0, 'actions remain at 0')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /bidding/prevent/:timelineName/:targetPlayerId => with no prevent item', async t => {
  t.plan(2)
  try {
    const userId = '1'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 6'
    const targetPlayerId = '3'
    await request(app)
      .post(`/bidding/prevent/${timelineName}/${targetPlayerId}`)
      .expect(403)
    const power = await getPower(targetPlayerId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.deepEquals(power.enemies, [], 'player not added to enemies')
    t.equals(actions, 10, 'actions not decremented')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /bidding/prevent/:timelineName/:targetPlayerId => bad parameters - no userId', async t => {
  t.plan(1)
  try {
    stubPassport('foo', 'bar', null)
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 6'
    const targetPlayerId = '1'
    await request(app)
      .post(`/bidding/prevent/${timelineName}/${targetPlayerId}`)
      .expect(403)
    t.pass('request failed without a user id')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /bidding/prevent/:timelineName/:targetPlayerId => bad parameters - no timelineName', async t => {
  t.plan(1)
  try {
    const userId = '3'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    await request(app)
      .post('/bidding/prevent')
      .expect(404)
    t.pass('request failed without a timeline name')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /bidding/prevent/:timelineName/:targetPlayerId => bad parameters - no targetPlayerId', async t => {
  t.plan(1)
  try {
    const userId = '3'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 6'
    await request(app)
      .post(`/bidding/prevent/${timelineName}`)
      .expect(404)
    t.pass('request failed without a timeline name')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /bidding/prevent/:timelineName/:targetPlayerId => bad parameters - non-existent user', async t => {
  t.plan(1)
  try {
    const userId = '99999'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 6'
    const targetPlayerId = '1'
    await request(app)
      .post(`/bidding/prevent/${timelineName}/${targetPlayerId}`)
      .expect(403)
    t.pass('request failed with a non-existent user')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /bidding/prevent/:timelineName/:targetPlayerId => bad parameters - non-existent timeline', async t => {
  t.plan(1)
  try {
    const userId = '3'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'foo'
    const targetPlayerId = '1'
    await request(app)
      .post(`/bidding/prevent/${timelineName}/${targetPlayerId}`)
      .expect(403)
    t.pass('request failed with a non-existent timeline')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /bidding/prevent/:timelineName/:targetPlayerId => bad parameters - non-existent targetPlayerId', async t => {
  t.plan(1)
  try {
    const userId = '3'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 6'
    const targetPlayerId = '42'
    await request(app)
      .post(`/bidding/prevent/${timelineName}/${targetPlayerId}`)
      .expect(403)
    t.pass('request failed with a non-existent targetPlayerId')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /bidding/prevent/:timelineName/:targetPlayerId => user not in timeline', async t => {
  t.plan(2)
  try {
    const userId = '4'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 6'
    const targetPlayerId = '1'
    await request(app)
      .post(`/bidding/prevent/${timelineName}/${targetPlayerId}`)
      .expect(403)
    const power = await getPower(targetPlayerId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 10, 'actions not decremented')
    t.deepEquals(power.enemies, [], 'power enemies unchanged')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /bidding/prevent/:timelineName/:targetPlayerId => no active power on targetPlayer', async t => {
  t.plan(1)
  try {
    const userId = '3'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 6'
    const targetPlayerId = '5'
    await request(app)
      .post(`/bidding/prevent/${timelineName}/${targetPlayerId}`)
      .expect(403)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 10, 'actions remain at 0')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /bidding/prevent/:timelineName/:targetPlayerId => targetPlayer not in timeline', async t => {
  t.plan(1)
  try {
    const userId = '3'
    stubPassport('foo', 'bar', userId)
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 6'
    const targetPlayerId = '4'
    await request(app)
      .post(`/bidding/prevent/${timelineName}/${targetPlayerId}`)
      .expect(403)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 10, 'actions remain at 0')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})
