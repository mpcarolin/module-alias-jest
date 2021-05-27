const testRoot = 'some-path'
const mockAliases = {
  foo: 'bar',
  baz: 'bizboo'
}

const expectedNode = {
  foo: expect.stringMatching(/some-path\/bar$/),
  baz: expect.stringMatching(/some-path\/bizboo$/)
}

const expectedJest = { 
  'foo(.*)': expect.stringMatching(/some-path\/bar\$1$/),
  'baz(.*)': expect.stringMatching(/some-path\/bizboo\$1$/)
}

jest.mock('@keg-hub/jsutils/src/node', () => ({
  tryRequireSync: jest.fn(() => ({ _aliases: mockAliases })),
}))

jest.mock('module-alias')

const { reset, registerAliases, getJestAliases, addAlias, addAliases, getAliases } = require('..')
const moduleAlias = require('module-alias')

describe('Register', () => {
  it('should register with the state', () => {
    const aliases = registerAliases(testRoot)

    expect(moduleAlias.addAliases).toHaveBeenCalledWith(
      expect.objectContaining(expectedNode)
    )

    expect(aliases.node).toEqual(expectedNode)
    expect(aliases.jest).toEqual(expectedJest)
  })
})

describe('getJestAliases', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    reset()
    registerAliases(testRoot)
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
        foo: expect.stringMatching(/.+some-path\/bar123$/),
        baz: expect.stringMatching(/.+some-path\/bizboo123$/)
      })
    )
  })
})

describe('Adding aliases', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    reset()
    registerAliases(testRoot)
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
        'bam(.*)': 'kapow$1'
      })
    )
  })
})