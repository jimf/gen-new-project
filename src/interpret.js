var path = require('path')
var chalk = require('chalk')
var copy = require('recursive-copy')
var inquirer = require('inquirer')
var mustache = require('mustache')
var shell = require('shelljs')
var through = require('through2')

module.exports = function (tasks) {
  function interpret (task, ctx) {
    switch (task.type) {
      case 'tasklist':
        return task.tasks.reduce(function (acc, t) {
          return acc.then(function (result) {
            return interpret(t, result)
          })
        }, ctx).then(function () {
          console.log(chalk.green('\n  Done ✓\n'))
        })

      case 'ask-questions':
        return inquirer.prompt(task.questions)

      case 'update-context':
        return task.updater(ctx)

      case 'write-files':
        // TODO: move dest out to option given to gen
        return copy(path.resolve(__dirname, 'templates'), process.cwd(), {
          dot: true,
          filter: function (path) {
            // TODO: this decision should be made in gen
            return ctx.environment === 'Browser' ||
              !path.endsWith('index.html')
          },
          transform: function () {
            return through(function (chunk, enc, done) {
              done(null, mustache.render(chunk.toString('utf8'), ctx))
            })
          }
        }).on(copy.events.COPY_FILE_COMPLETE, function (copyOp) {
          console.log('  ' + chalk.green('create ') + copyOp.dest)
        }).then(function () {
          return ctx
        })

      case 'npm-install':
        return new Promise(function (resolve, reject) {
          console.log('\n  Running ' + chalk.yellow('npm install') + '...')
          var cmd = 'npm install -D ' + ctx.devDependencies.join(' ')
          shell.exec(cmd, { silent: true }, function (code) {
            if (code === 0) {
              resolve(ctx)
            } else {
              reject(code)
            }
          })
        })
    }
  }

  return interpret(tasks, Promise.resolve())
}
