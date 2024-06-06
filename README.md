# cypress-expandtesting_UI_and_API

UI and API testing in [expandtesting](https://practice.expandtesting.com/notes/app/) note app. When it comes to the API part, it deals with the x-www-form-urlencoded content type. Although custom commands were used, the assertion code to each test was kept in it so we can work independently in each test. 

# Pre-requirements:

| Requirement                   | Version | Note                                                            |
| :---------------------------- |:--------| :---------------------------------------------------------------|
| Node.js                       | 18.18.0 | -                                                               |
| npm                           | 10.2.4  | -                                                               |
| Yarn                          | 1.22.19 | Optional.                                                       |
| Cypress                       | 13.10.0 | -                                                               |
| Visual Studio Code            | 1.89.1  | Optional. Recommended so you can use Cypress Helper extension.  |
| Cypress Helper                | v1.2.2  | Optional.                                                       |
| cypress-plugin-api            | 2.11.1  | Optional. Recommended so you can observe API traces in browser. |
| @faker-js/faker               | 8.4.1   | Optional. Recommended so you will not be using same test data.  |

# Instalation:

- See [Node.js page](https://nodejs.org/en) and install the aforementioned Node.js version. Keep all the preferenced options as they are.
- To use yarn packet manager, open windows prompt as admin and execute ```corepack enable``` (Optional).
- Execute ```yarn init``` to start a project.
  - Input the project name or keep it as the fodler name.
  - Input the project version or keep it as it is (1.0.0).
  - Input the project description or keep it blank.
  - Input the project repository or keep it blank.
  - Input the project author name or keep it blank.
  - Input the project license or keep it as it is (MIT).
  - Input "true" or "false" to select the privacy of the project in private option or keep it as it is (by default, if answer given to question private is passed in as empty, the private key will not be added to package.json).
- See [Visual Studio Code page](https://code.visualstudio.com/) and install the latest VSC stable version. Keep all the prefereced options as they are until you reach the possibility to check the checkboxes below: 
  - :white_check_mark: Add "Open with code" action to Windows Explorer file context menu. 
  - :white_check_mark: Add "Open with code" action to Windows Explorer directory context menu.
Check then both to add both options in context menu.
- Look for Cypress Helper in the extensions marketplace and install the one from Oleksandr Shevtsov.
- Execute ```npm i cypress-plugin-api -D``` to install cypress api plugin.
- Execute ```npm install @faker-js/faker --save-dev``` to install faker library.
- Execute ```npx cypress open``` to open cypress.
- Hit :point_right:**E2E Testing** configuration option. 
- Keep all the configuration files options checked and hit :point_right:**Continue**.
- Choose a browser (chrome was used here to develop the test cases) and hit :point_right:**Start E2E Testing in Chrome**.
- Hit :point_right:**Scaffold example specs**, so you can be provided with examples that might be useful.
- Hit :point_right:**Okay, I got it!**. Choose a spec and click it to run it to be sure that cypress is running and working fine. You can now develop your tests.

# Tests:

- Execute ```yarn cypress open``` to open cypress app and execute step by step, being able to debug the execution. 
- Execute ```yarn cypress run``` to execute cypress in headless mode.

# Support:

- [yarn init documentation page](https://classic.yarnpkg.com/lang/en/docs/cli/init/)
- [expandtesting API documentation page](https://practice.expandtesting.com/notes/api/api-docs/)
- [expandtesting API demonstration page](https://www.youtube.com/watch?v=bQYvS6EEBZc)
- [Faker](https://fakerjs.dev/guide/)
- [Cypress Table of Contents](https://docs.cypress.io/api/table-of-contents)
- [cypress-io/github-action](https://www.npmjs.com/package/@cypress/github-action#end-to-end-testing)
- [Cypress: store value in a variable](https://stackoverflow.com/questions/69977821/cypress-store-value-in-a-variable)
- [Working With Variables In Cypress Tests](https://www.stevenhicks.me/blog/2020/02/working-with-variables-in-cypress-tests/)
- [How to Test an Application that Changes a CSS Variable](https://www.cypress.io/blog/2020/03/17/how-to-test-an-application-that-changes-css-variable)

# Tips:

- UI and API tests to send password reset link to user's email and API tests to verify a password reset token and reset a user's password must be tested manually as they rely on e-mail verification.