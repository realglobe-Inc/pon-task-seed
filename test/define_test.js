/**
 * Test case for define.
 * Runs with mocha.
 */
'use strict'

const define = require('../lib/define.js')
const theDB = require('the-db')
const ponContext = require('pon-context')
const { ok } = require('assert')
const co = require('co')

describe('define', function () {
  this.timeout(3000)

  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('Define', () => co(function * () {
    let db = theDB({})
    let ctx = ponContext()
    let pattern = `${__dirname}/../misc/mocks/:env/*.seed.json`
    let task = define(db, pattern)
    ok(task)

    yield Promise.resolve(task(ctx))
  }))
})

/* global describe, before, after, it */
