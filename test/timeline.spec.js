'use strict'

const test = require('tape')
const proxyquire = require('proxyquire')
const request = require('supertest')
const sinon = require('sinon')

function getMockedApp (r) {
  return proxyquire('../', {
    rethinkdb: Object.assign(r, {'@global': true})
  })
}

function mockRethink () {
  const append = sinon.stub().returns(42)
  const row = sinon.stub().returns({append})
  const update = sinon.spy()
  const getField = sinon.stub().returns('foo')
  const filter = sinon.stub()
  filter.withArgs({id: 1}).returns({update})
  filter.withArgs({name: 'Timeline 1'}).returns(getField)
  const table = sinon.stub().returns({filter})
  const r = {table, row}
  return { r, append, row, update, filter, table }
}

test('POST /timeline/quest/:timelineName => adds relevant item to player', async t => {
  t.plan(1)
  try {
    const { r, append, row, update, filter, table } = mockRethink()
    const app = getMockedApp(r)
    await request(app)
      .post('/timeline/quest/Timeline 1')
      .set('userId', 1)
      .expect(200)
    t.ok(table.calledWith('players'), 'players table used')
    t.ok(filter.calledWith({id: 1}), 'proper player id updated')
    t.ok(update.calledWith({items: 42}), 'proper field updated')
    t.ok(row.calledWith('items'), 'appended to existing data')
    t.ok(append.calledWith({name: 'Timeline 1', source: 'foo'}), 'proper item added')
  } catch (e) {
    console.error(e.stack)
    t.fail(e.message)
  }
})
