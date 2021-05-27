const path = require('path')
const { get, mapFind } = require('@keg-hub/jsutils')
const { tryRequireSync } = require('@keg-hub/jsutils/src/node')

/**
 * Accepted keys in the package.json file
 * for defining aliases
 */
const supportedKeys = [
  '_moduleAliases',
  '_aliases'
]

/**
 * @param {string} location - root of a package 
 * @returns {Object} - the root app's moduleAliases defined in the package.json object, or an empty object if there aren't any
 */
const getPackageAliases = location => {
  const pkgPath = path.resolve(
    location,
    'package.json'
  )

  const pkg = tryRequireSync(pkgPath)

  return mapFind(supportedKeys, key => get(pkg, key)) || {}
}

module.exports = {
  getPackageAliases
}