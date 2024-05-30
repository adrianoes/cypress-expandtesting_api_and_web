const { defineConfig } = require('cypress')
const fs = require('fs')

module.exports = defineConfig({
  chromeWebSecurity: false,
  screenshotOnRunFailure: true,
  video: true,
  e2e: {
    viewportWidth: 1920,
    viewportHeight: 1080,
    setupNodeEvents(on, config) {
      on('after:spec', (spec, results) => {
        if (results && results.video) {
          // Do we have failures for any retry attempts?
          const failures = results.tests.some((test) =>
            test.attempts.some((attempt) => attempt.state === 'failed')
          )
          if (!failures) {
            // delete the video if the spec passed and no tests retried
            fs.unlinkSync(results.video)
          }
        }
      })
    },
    baseUrl:"https://practice.expandtesting.com/notes/api",
  },
})