/**
 * Pon task to generate data seed
 * @module pon-task-seed
 * @version 3.0.0
 */

'use strict'

const define = require('./define')

const lib = define.bind(this)

Object.assign(lib, define, {
  define
})

module.exports = lib
