'use strict'

const test = require('tape')
const request = require('supertest')
const fixtures = require('./fixtures')
const { getPlayerActions, getPower, winGame } = require('./test-utils')

test('POST /bidding/assist/:timelineName/:targetPlayerId => adds player to allies', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 6'
    const targetPlayerId = '1'
    const userId = '3'
    await request(app)
      .post(`/bidding/assist/${timelineName}/${targetPlayerId}`)
      .set('userId', userId)
      .expect(200)
    const power = await getPower(targetPlayerId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.deepEquals(power.allies, [{id: '3', score: 1}], 'player added to allies')
    t.equals(actions, 9, 'actions decremented by 1')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /bidding/assist/:timelineName/:targetPlayerId => adds score to existing ally', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 6'
    const targetPlayerId = '2'
    const userId = '3'
    await request(app)
      .post(`/bidding/assist/${timelineName}/${targetPlayerId}`)
      .set('userId', userId)
      .expect(200)
    const power = await getPower(targetPlayerId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.deepEquals(power.allies, [{id: '3', score: 2}], 'player added to allies')
    t.equals(actions, 9, 'actions decremented by 1')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /bidding/assist/:timelineName/:targetPlayerId => with no actions left', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 6'
    const targetPlayerId = '1'
    const userId = '5'
    await request(app)
      .post(`/bidding/assist/${timelineName}/${targetPlayerId}`)
      .set('userId', userId)
      .expect(403)
    const power = await getPower(targetPlayerId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.deepEquals(power.allies, [], 'player not added to allies')
    t.equals(actions, 0, 'actions remain at 0')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /bidding/assist/:timelineName/:targetPlayerId => with no assist item', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 6'
    const targetPlayerId = '3'
    const userId = '1'
    await request(app)
      .post(`/bidding/assist/${timelineName}/${targetPlayerId}`)
      .set('userId', userId)
      .expect(403)
    const power = await getPower(targetPlayerId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.deepEquals(power.allies, [], 'player not added to allies')
    t.equals(actions, 10, 'actions not decremented')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /bidding/assist/:timelineName/:targetPlayerId => bad parameters - no userId', async t => {
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 6'
    const targetPlayerId = '1'
    await request(app)
      .post(`/bidding/assist/${timelineName}/${targetPlayerId}`)
      .expect(400)
    t.pass('request failed without a user id')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /bidding/assist/:timelineName/:targetPlayerId => bad parameters - no timelineName', async t => {
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const userId = '3'
    await request(app)
      .post('/bidding/assist')
      .set('userId', userId)
      .expect(404)
    t.pass('request failed without a timeline name')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /bidding/assist/:timelineName/:targetPlayerId => bad parameters - no targetPlayerId', async t => {
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const userId = '3'
    const timelineName = 'Timeline 6'
    await request(app)
      .post(`/bidding/assist/${timelineName}`)
      .set('userId', userId)
      .expect(404)
    t.pass('request failed without a timeline name')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /bidding/assist/:timelineName/:targetPlayerId => bad parameters - non-existent user', async t => {
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const userId = '99999'
    const timelineName = 'Timeline 6'
    const targetPlayerId = '1'
    await request(app)
      .post(`/bidding/assist/${timelineName}/${targetPlayerId}`)
      .set('userId', userId)
      .expect(403)
    t.pass('request failed with a non-existent user')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /bidding/assist/:timelineName/:targetPlayerId => bad parameters - game is over', async t => {
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const userId = '1'
    const timelineName = 'Timeline 6'
    const targetPlayerId = '1'
    await winGame(userId, 1, conn)
    await request(app)
      .post(`/bidding/assist/${timelineName}/${targetPlayerId}`)
      .set('userId', userId)
      .expect(403)
    t.pass('request failed when game is over')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /bidding/assist/:timelineName/:targetPlayerId => bad parameters - non-existent timeline', async t => {
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const userId = '3'
    const timelineName = 'foo'
    const targetPlayerId = '1'
    await request(app)
      .post(`/bidding/assist/${timelineName}/${targetPlayerId}`)
      .set('userId', userId)
      .expect(403)
    t.pass('request failed with a non-existent timeline')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /bidding/assist/:timelineName/:targetPlayerId => bad parameters - non-existent targetPlayerId', async t => {
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 6'
    const targetPlayerId = '42'
    const userId = '3'
    await request(app)
      .post(`/bidding/assist/${timelineName}/${targetPlayerId}`)
      .set('userId', userId)
      .expect(403)
    t.pass('request failed with a non-existent targetPlayerId')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /bidding/assist/:timelineName/:targetPlayerId => user not in timeline', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 6'
    const targetPlayerId = '1'
    const userId = '4'
    await request(app)
      .post(`/bidding/assist/${timelineName}/${targetPlayerId}`)
      .set('userId', userId)
      .expect(403)
    const power = await getPower(targetPlayerId, timelineName, conn)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 10, 'actions not decremented')
    t.deepEquals(power.allies, [], 'power allies unchanged')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /bidding/assist/:timelineName/:targetPlayerId => no active power on targetPlayer', async t => {
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 6'
    const targetPlayerId = '5'
    const userId = '3'
    await request(app)
      .post(`/bidding/assist/${timelineName}/${targetPlayerId}`)
      .set('userId', userId)
      .expect(403)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 10, 'actions remain at 0')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('POST /bidding/assist/:timelineName/:targetPlayerId => targetPlayer not in timeline', async t => {
  t.plan(1)
  try {
    const conn = await fixtures()
    const app = require('../app')(conn)
    const timelineName = 'Timeline 6'
    const targetPlayerId = '4'
    const userId = '3'
    await request(app)
      .post(`/bidding/assist/${timelineName}/${targetPlayerId}`)
      .set('userId', userId)
      .expect(403)
    const actions = await getPlayerActions(userId, conn)
    t.equals(actions, 10, 'actions remain at 0')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})
