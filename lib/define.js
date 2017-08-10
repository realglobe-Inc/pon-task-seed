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

const asleep = require('asleep')
const aglob = require('aglob')
const path = require('path')

const defaultResolver = (filename) => path.basename(filename).replace(/^[0-9.]+/, '').split('.')[ 0 ]

/** @lends define */
function define (db, pattern, options = {}) {
  const {
    resolver = defaultResolver,
    seedKey = 'id'
  } = options

  async function task (ctx) {
    const { logger } = ctx
    const newInstance = typeof db === 'function'
    const instance = newInstance ? db() : db
    const { driver } = instance
    const env = process.env.NODE_ENV || 'development'
    const filenames = await aglob(pattern.replace(/:env/, env))
    for (const filename of filenames) {
      const resourceName = resolver(filename)
      const resource = instance.resource(resourceName)
      const attributesArray = require(path.resolve(filename))
      for (const attributes of attributesArray) {
        if (!attributes.hasOwnProperty(seedKey)) {
          logger.warn(`SeedKey "${seedKey}" is missing for entry: ${JSON.stringify(attributes)}`)
        }
        const key = attributes[ seedKey ]
        const skip = key && (await resource.exists({ [seedKey]: key }))
        if (skip) {
          continue
        }
        const entity = await resource.create(attributes, { allowReserved: true })
        logger.trace(`${resourceName} data created: ${entity[ seedKey ] || entity.id}`)
        await asleep(1)
      }
    }
    if (driver && driver.flush) {
      await driver.flush()
    }

    if (newInstance) {
      await instance.close()
    }
  }

  return Object.assign(task,
    // Define sub tasks here
    {}
  )
}

module.exports = define
