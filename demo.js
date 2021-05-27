const aliases = require('module-alias-jest/register')

if (!aliases || !aliases.node || !aliases.jest)
  console.error('Aliases not registered', aliases)
else
  console.log('Successfully registered aliases', aliases)