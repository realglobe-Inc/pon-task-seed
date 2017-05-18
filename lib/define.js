/**
 * Define task
 * @function define
 * @param {function|ClayLump} db - DB instance or it's creator
 * @param {string} pattern - Filename pattern
 * @param {Object} [options={}] - Optional settings
 * @param {string} [options.env=process.env.NODE_ENV || 'development'] - Env to resolve
 * @param {function} [options.resolver] - Resolver for resource name
 * @returns {function} Defined task
 */
'use strict'

const co = require('co')
const asleep = require('asleep')
const aglob = require('aglob')
const path = require('path')

/** @lends define */
function define (db, pattern, options = {}) {
  let {
    env = process.env.NODE_ENV || 'development',
    resolver = (filename) => path.basename(filename).split('.')[ 0 ],
    seedKey = '$$seed'
  } = options

  function task (ctx) {
    const { logger } = ctx
    return co(function * () {
      const instance = typeof db === 'function' ? db() : db
      const { driver } = instance
      let filenames = yield aglob(pattern.replace(/:env/, env))
      for (let filename of filenames) {
        let resourceName = resolver(filename)
        const resource = instance.resource(resourceName)
        let attributesArray = require(path.resolve(filename))
        for (let attributes of attributesArray) {
          let key = attributes[ seedKey ]
          let skip = key && (yield resource.exists({ [seedKey]: key }))
          if (skip) {
            continue
          }
          let entity = yield resource.create(attributes, { allowReserved: true })
          logger.trace(`${resourceName} data created: ${entity[ seedKey ] || entity.id}`)
          yield asleep(1)
        }
      }
      if (driver && driver.flush) {
        yield driver.flush()
      }
    })
  }

  return Object.assign(task,
    // Define sub tasks here
    {}
  )
}

module.exports = define


