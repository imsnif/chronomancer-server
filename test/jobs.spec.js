'use strict'

const test = require('tape')
const fixtures = require('./fixtures')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const { createPower, getAllPowers } = require('./test-utils')

function getMockedJobs (handle) {
  return proxyquire('../jobs', {
    './handle': () => handle
  })
}

test('Multiple relevant jobs are resolved and deleted', async t => {
  t.plan(4)
  try {
    const conn = await fixtures()
    const handle = {
      foo0: sinon.spy(),
      foo1: sinon.spy(),
      foo2: sinon.spy()
    }
    const jobs = getMockedJobs(handle)(conn)
    const timelineName = 'Timeline 1'
    const playerId = '3'
    const now = new Date()
    const powersBefore = await getAllPowers(conn)
    const power = {
      playerId,
      gameId: 1,
      timelineName,
      startTime: now.getTime(),
      endTime: now.getTime(),
      allies: [],
      enemies: []
    }
    for (let i = 0; i < 3; i++) {
      await createPower(
        Object.assign({}, power, {id: `Foo${i}`, name: `Foo${i}`}),
        conn
      )
    }
    await jobs()
    const powers = await getAllPowers(conn)
    t.equals(powers.length, powersBefore.length, 'all powers deleted')
    t.ok(
      handle.foo0.calledWith(Object.assign({}, power, {id: 'Foo0', name: 'Foo0'})),
      'First handler called properly'
    )
    t.ok(
      handle.foo1.calledWith(Object.assign({}, power, {id: 'Foo1', name: 'Foo1'})),
      'Second handler called properly'
    )
    t.ok(
      handle.foo2.calledWith(Object.assign({}, power, {id: 'Foo2', name: 'Foo2'})),
      'Third handler called properly'
    )
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Unfinished jobs are not resolved or deleted', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const handle = {
      foo0: sinon.spy(),
      foo1: sinon.spy(),
      foo2: sinon.spy()
    }
    const jobs = getMockedJobs(handle)(conn)
    const timelineName = 'Timeline 1'
    const playerId = '3'
    const now = new Date()
    const powersBefore = await getAllPowers(conn)
    const power = {
      playerId,
      gameId: 1,
      timelineName,
      startTime: now.getTime(),
      endTime: now.getTime() + 1000,
      allies: [],
      enemies: []
    }
    for (let i = 0; i < 3; i++) {
      await createPower(
        Object.assign({}, power, {id: `Foo${i}`, name: `Foo${i}`}),
        conn
      )
    }
    await jobs()
    const powers = await getAllPowers(conn)
    t.equals(powers.length, powersBefore.length + 3, 'powers were not deleted')
    t.ok(Object.keys(handle).every(k => handle[k].notCalled), 'No jobs were triggered')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Corrupted jobs are ignored and do not affect other jobs', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const handle = {
      foo: sinon.spy()
    }
    const jobs = getMockedJobs(handle)(conn)
    const timelineName = 'Timeline 1'
    const playerId = '3'
    const now = new Date()
    const powersBefore = await getAllPowers(conn)
    const power = {
      playerId,
      gameId: 1,
      timelineName,
      startTime: now.getTime(),
      endTime: now.getTime(),
      allies: [],
      enemies: []
    }
    const corruptedPower = Object.assign(
      {},
      power,
      {timelineName: 0, id: 'foo1', name: 'foo1'}
    )
    await createPower(
      Object.assign({}, power, {id: 'foo', name: 'foo'}),
      conn
    )
    await createPower(
      corruptedPower,
      conn
    )
    await jobs()
    const powers = await getAllPowers(conn)
    t.deepEquals(powers.length, powersBefore.concat([corruptedPower]).length, 'only corrupted power remains')
    t.ok(
      handle.foo.calledOnce,
      'Remaining power handled normally'
    )
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})

test('Negative score jobs are deleted and not resolved', async t => {
  t.plan(2)
  try {
    const conn = await fixtures()
    const handle = {
      foo: sinon.spy()
    }
    const jobs = getMockedJobs(handle)(conn)
    const timelineName = 'Timeline 1'
    const playerId = '3'
    const now = new Date()
    const powersBefore = await getAllPowers(conn)
    const power = {
      playerId,
      gameId: 1,
      timelineName,
      startTime: now.getTime(),
      endTime: now.getTime(),
      allies: [],
      enemies: [{id: 1, score: 2}]
    }
    await createPower(
      Object.assign({}, power, {id: 'Foo', name: 'Foo'}),
      conn
    )
    await jobs()
    const powers = await getAllPowers(conn)
    t.equals(powers.length, powersBefore.length, 'power deleted')
    t.ok(
      handle.foo.notCalled,
      'Failed power does not resolve'
    )
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})
