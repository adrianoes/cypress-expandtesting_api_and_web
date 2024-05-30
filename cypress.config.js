const { defineConfig } = require("cypress");

module.exports = defineConfig({
  chromeWebSecurity: false,
})

module.exports = defineConfig({
  video: true,
  e2e: {
    viewportWidth: 1920,
    viewportHeight: 1080,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl:"https://practice.expandtesting.com/notes/api",
  },
});