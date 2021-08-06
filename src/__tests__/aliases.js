const path = require('path')
const { join: pathJoin, sep: pathSep } = path
const testRoot = path.resolve('some-path')
const mockAliases = {
  foo: 'bar',
  baz: 'bizboo'
}

const resolvedPaths = {
  bar: pathJoin(testRoot,'bar').replace(/\\/g,'\\\\'),
  bizboo: pathJoin(testRoot,'bizboo').replace(/\\/g,'\\\\'),
}

const expectedNode = {
  foo: expect.stringMatching(new RegExp(`${resolvedPaths.bar}$`)),
  baz: expect.stringMatching(new RegExp(`${resolvedPaths.bizboo}$`))
}

const expectedJest = { 
  'foo/(.*)': expect.stringMatching(new RegExp(`${resolvedPaths.bar + pathSep.replace(/\\/g,'\\\\')}\\$1$`)),
  'baz/(.*)': expect.stringMatching(new RegExp(`${resolvedPaths.bizboo + pathSep.replace(/\\/g,'\\\\')}\\$1$`)),
}

jest.mock('@keg-hub/jsutils/src/node', () => ({
  tryRequireSync: jest.fn(() => ({ _aliases: mockAliases })),
}))

jest.mock('module-alias')

const { reset, registerAliases, getJestAliases, addAlias, addAliases, getAliases } = require('..')
const moduleAlias = require('module-alias')

describe('Register', () => {
  it('should register with the state', () => {
    const aliases = registerAliases({ root: testRoot })

    expect(moduleAlias.addAliases).toHaveBeenCalledWith(
      expect.objectContaining(expectedNode)
    )

    expect(aliases.node).toMatchObject(expectedNode)
    expect(aliases.jest).toMatchObject(expectedJest)
  })
})

describe('getJestAliases', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    reset()
    registerAliases({ root: testRoot })
  })

  it('should should return an object of jest-formatted aliases', () => {
    const aliases = getJestAliases() 
    expect(aliases).toEqual(
      expect.objectContaining(expectedJest)
    )
  })

  it('should accept a handler', () => {
    const aliases = getJestAliases((map, key, path) => ({
      ...map,
      [key]: path + '123'
    })) 

    expect(aliases).toEqual(
      expect.objectContaining({ 
        foo: expect.stringMatching(new RegExp(`${resolvedPaths.bar}123$`)),
        baz: expect.stringMatching(new RegExp(`${resolvedPaths.bizboo}123$`))
      })
    )
  })
})

describe('Adding aliases', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    reset()
    registerAliases({ root: testRoot })
  })

  it('should update the alias state individually', () => {
    addAlias('bam', 'kapow')
    expect(getAliases()).toEqual(
      expect.objectContaining({
        bam: 'kapow'
      })
    )
  })

  it('should update the state with an object', () => {
    const newAliases = { bam: 'kapow', bim: 'kipow' }
    addAliases(newAliases)
    expect(getAliases()).toEqual(
      expect.objectContaining(newAliases)
    )
  })

  it('should appear in the jest results', () => {
    const newAliases = { bam: 'kapow', bim: 'kipow' }
    addAliases(newAliases)

    const aliases = getJestAliases() 

    expect(aliases).toEqual(
      expect.objectContaining({
        ...expectedJest,
        'bam/(.*)': pathJoin('kapow','$1')
      })
    )
  })
})