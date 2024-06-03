const { defineConfig } = require("cypress");
module.exports = defineConfig({
  chromeWebSecurity: false,
})
module.exports = defineConfig({
  video: true,
  screenshotOnRunFailure: true,
  e2e: {
    viewportWidth: 1920,
    viewportHeight: 1080,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    }    
  },
  env: {
    baseApiUrl:"https://practice.expandtesting.com/notes/api",
    baseAppUrl: 'https://practice.expandtesting.com/notes/app/'
  }
});