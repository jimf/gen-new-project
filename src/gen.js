var tasklist = require('./tasks/tasklist')
var askQuestions = require('./tasks/ask_questions')
var updateContext = require('./tasks/update_context')
var writeFiles = require('./tasks/write_files')
var npmInstall = require('./tasks/npm_install')

function indent (spaces, str) {
  return str
    .split('\n')
    .map(function (line) {
      return (new Array(spaces)).fill(' ').join('').concat(line)
    })
    .join('\n')
}

module.exports = function (opts) {
  return tasklist([
    askQuestions([
      {
        name: 'packageName',
        message: 'Package name:',
        default: opts.packageName
      },
      {
        name: 'packageDesc',
        message: 'Description:'
      },
      {
        name: 'packageVersion',
        message: 'Version:',
        default: '0.1.0'
      },
      {
        name: 'environment',
        message: 'Environment?',
        type: 'list',
        choices: ['Node.js', 'Browser']
      },
      {
        name: 'testingLib',
        message: 'Testing library?',
        type: 'list',
        choices: ['jest', 'tape'],
        default: 'jest',
        when: function (answers) {
          return answers.environment === 'Browser'
        }
      }
    ]),

    updateContext(function (ctx) {
      const scripts = {
        coveralls: null,
        lint: 'standard',
        pretest: 'npm run lint',
        test: null
      }

      ctx.devDependencies = ['standard', 'coveralls']
      ctx.copyYear = (new Date()).getFullYear()
      ctx.nyc = null

      if (!ctx.testingLib) {
        ctx.testingLib = 'tape'
      }

      if (ctx.testingLib === 'tape') {
        ctx.devDependencies.push('tape')
        ctx.devDependencies.push('nyc')
        scripts.coveralls = 'coveralls < coverage/lcov.info'
        scripts.test = 'nyc tape test/*.js'
        ctx.nyc = '\n  "nyc": ' + indent(2, JSON.stringify({
          reporter: ['lcov', 'text']
        }, true, 2)).trimLeft() + ','
      } else if (ctx.testingLib === 'jest') {
        ctx.devDependencies.push('jest')
        scripts.coveralls = 'cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js'
        scripts.test = 'jest --coverage'
        scripts.tdd = 'npm test -- --watch'
      }

      if (ctx.environment === 'Browser') {
        ctx.devDependencies.push('budo')
        scripts.start = 'budo src/main.js --live --open --host=localhost'
      }

      ctx.npmScripts = indent(2, JSON.stringify(scripts, true, 2)).trimLeft()

      return ctx
    }),

    writeFiles(),
    npmInstall()
  ])
}
