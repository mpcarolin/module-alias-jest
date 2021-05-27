const { getPackageAliases } = require('./getPackageAliases')
const { isFunc } = require('@keg-hub/jsutils')
const moduleAlias = require('module-alias')
const appRoot = require('app-root-path').path
const path = require('path')

const state = { 
  aliases: {}
}

/**
 * Creates full paths for each alias, which are assumed relative to location
 * @param {Object} aliases 
 * @param {String} location 
 * @returns 
 */
const resolveAbsolutes = (aliases, location) => {
  return Object.entries(aliases).reduce(
    (final, [aliasKey, aliasPath]) => {
      final[aliasKey] = path.resolve(location, aliasPath)
      return final
    },
    {}
  )
}

/**
 * Registers aliases from the package.json located at the app root, or the `location` path if defined.
 * Expects either _aliases or _moduleAliases to be the package key.
 * @param {Object} options
 * @param {string?} options.root - app root path to search for a package.json file. If omitted, registerAliases uses the appRootPath.
 * @param {boolean} resolve - If true, registerAliases will resolve full file paths for the alias values, relative to options.root, (defaults to true)
 */
const registerAliases = ({ root=appRoot, resolve=true }={}) => {
  const pkgAliases = getPackageAliases(root)

  state.aliases = resolve
    ? resolveAbsolutes(pkgAliases, root)
    : pkgAliases

  moduleAlias.addAliases(state.aliases)

  return {
    node: getAliases(),
    jest: getJestAliases()
  }
}

/**
 * Adds the alias programmatically
 * @param {string} key 
 * @param {string} path 
 */
const addAlias = (key, path) => {
  state.aliases[key] = path
  moduleAlias.addAlias(key, path)
}

/**
 * Adds the aliases programmatically
 * @param {Object} aliases 
 */
const addAliases = (aliases) => {
  state.aliases = {
    ...state.aliases,
    ...aliases
  }

  moduleAlias.addAliases(aliases)
}

/**
 * Jest is not compatible with module-alias b/c it uses its own require function,
 * and it requires some slight changes to the format of each key and value.
 * `jestAliases` can be set as value of any jest config's `moduleNameMapper` property
 * @param {Function} aliasHandler - optional handler for creating jest aliases. Form:
 *  (jestAliasMap, aliasKey, aliasValue) -> nextAliasMapValue
 * @return {Object} - map of jest aliases to use in moduleNameMapper property
 */
const getJestAliases = aliasHandler => Object.entries(state.aliases).reduce(
  (aliasMap, [ key, path ]) => {
    if (isFunc(aliasHandler))
      return aliasHandler(aliasMap, key, path)

    const formattedKey = key + '(.*)'
    aliasMap[formattedKey] = path + '$1'
    return aliasMap
  },
  {}
)

/**
 * @returns {Object} aliases copy
 */
const getAliases = () => ({ ...state.aliases })

/**
 * Reset alias state
 */
const reset = () => {
  state.aliases = {}
  moduleAlias.reset()
}

module.exports = {
  ...moduleAlias,
  addAlias,
  addAliases,
  getJestAliases,
  getAliases,
  registerAliases,
  reset,
}
