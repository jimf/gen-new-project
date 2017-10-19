var test = require('tape')
var gen = require('../src/gen')

function run (answers) {
  var tasks = gen({
    packageName: 'default'
  })
  return {
    promptedTestingLib: tasks.tasks[0].questions[4].when(answers),
    context: tasks.tasks[1].updater(answers)
  }
}

test('gen env:Node.js test:tape', function (t) {
  var result = run({
    packageName: 'dummy-package',
    packageDesc: 'Dummy description',
    environment: 'Node.js'
  })
  t.equal(result.promptedTestingLib, false, 'skips testing lib prompt')
  t.deepEqual(result.context, {
    packageName: 'dummy-package',
    packageDesc: 'Dummy description',
    environment: 'Node.js',
    testingLib: 'tape',
    devDependencies: ['standard', 'coveralls', 'tape', 'nyc'],
    copyYear: (new Date()).getFullYear(),
    npmScripts: `{
    "coveralls": "coveralls < coverage/lcov.info",
    "lint": "standard",
    "pretest": "npm run lint",
    "test": "nyc tape test/*.js"
  }`,
    nyc: `
  "nyc": {
    "reporter": [
      "lcov",
      "text"
    ]
  },`
  }, 'generates expected context')
  t.end()
})

test('gen env:Browser test:tape', function (t) {
  var result = run({
    packageName: 'dummy-package',
    packageDesc: 'Dummy description',
    environment: 'Browser',
    testingLib: 'tape'
  })
  t.equal(result.promptedTestingLib, true, 'prompts for testing lib')
  t.deepEqual(result.context, {
    packageName: 'dummy-package',
    packageDesc: 'Dummy description',
    environment: 'Browser',
    testingLib: 'tape',
    devDependencies: ['standard', 'coveralls', 'tape', 'nyc', 'budo'],
    copyYear: (new Date()).getFullYear(),
    npmScripts: `{
    "coveralls": "coveralls < coverage/lcov.info",
    "lint": "standard",
    "pretest": "npm run lint",
    "test": "nyc tape test/*.js",
    "start": "budo src/main.js --live --open --host=localhost"
  }`,
    nyc: `
  "nyc": {
    "reporter": [
      "lcov",
      "text"
    ]
  },`
  }, 'generates expected context')
  t.end()
})

test('gen env:Browser test:jest', function (t) {
  var result = run({
    packageName: 'dummy-package',
    packageDesc: 'Dummy description',
    environment: 'Browser',
    testingLib: 'jest'
  })
  t.equal(result.promptedTestingLib, true, 'prompts for testing lib')
  t.deepEqual(result.context, {
    packageName: 'dummy-package',
    packageDesc: 'Dummy description',
    environment: 'Browser',
    testingLib: 'jest',
    devDependencies: ['standard', 'coveralls', 'jest', 'budo'],
    copyYear: (new Date()).getFullYear(),
    npmScripts: `{
    "coveralls": "cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js",
    "lint": "standard",
    "pretest": "npm run lint",
    "test": "jest --coverage",
    "tdd": "npm test -- --watch",
    "start": "budo src/main.js --live --open --host=localhost"
  }`,
    nyc: null
  }, 'generates expected context')
  t.end()
})
