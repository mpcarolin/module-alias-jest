# Description
`module-alias-jest` enables you to setup your module aliases in one place (e.g. your package.json), then use them in both jest tests and elsewhere.

It wraps [module-alias](https://github.com/ilearnio/module-alias), so it also has all of the same requirements and caveats as that package.

## Install
```bash
# npm
npm install module-alias-jest

# yarn
yarn add module-alias-jest
```

## Usage

```js
// package.json
{
  _aliases: { // ._moduleAliases will also work
    '@root': '.',
    '@utils': './src/utils'
  }
}

// jest.config.js
const aliases = require('module-alias-jest/register')

module.exports = {
  ...,
  moduleNameMapper: aliases.jest
}

// some.test.js
const utils = require('@utils')
describe('utils', () => {...})

// app-entrypoint.js
require('module-alias-jest/register')
const utils = require('@utils')
utils.doSomething()
```

## Notes
* By default, `module-alias-jest/register` will resolve full paths for your values defined in package.json, relative to the root app path
  * You can disable this by passing the value options.resolve = false, or by programmatically setting aliases using `addAlias` and `addAliases`

## API

### registerAliases
*  Registers the aliases defined in your app root's package.json with `module-alias`, 
* `root` param: project root path to find a package.json
* `resolve` param: if true, resolve absolute paths for your alias values relative to options.root
* Returns: an aliases object that includes the jest moduleNameMapper object
```js
const { registerAliases } = require('module-alias-jest')

const { node, jest } = registerAliases({
  root: <project root path> // defaults to the consuming project's root path
  resolve: true/false // defaults to true
})
```

### getAliases
* returns the current state of aliases tracked by `module-alias-jest`
```js
const { getAliases } = require('module-alias-jest')

console.log(getAliases())
```

### getJestAliases
* the same function `registerAliases` uses to return the jest aliases
* you shouldn't need to call this explicitly (see Usage section), unless you want to customize the way the jest aliases are formatted
* `aliasHandler` param: a reducing function that formats aliases for the jest aliases map
```js
const { getJestAliases } = require('module-alias-jest')

// this would re-implement the default behavior (equivalent to `getJestAliases()`)
const jestAliases = getJestAliases((aliasMap, aliasKey, aliasPath) => {
  aliasMap[aliasKey + '(.*)'] = aliasPath + '$1'
  return aliasMap
})
```

### module-alias
* `module-alias-jest` wraps and exports these `module-alias` functions:
  * addAlias
  * addAliases
  * reset

