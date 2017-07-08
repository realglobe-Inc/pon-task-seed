/**
 * Pon task to generate data seed
 * @module pon-task-seed
 * @version 1.0.7
 */

'use strict'

const define = require('./define')

let lib = define.bind(this)

Object.assign(lib, define, {
  define
})

module.exports = lib
