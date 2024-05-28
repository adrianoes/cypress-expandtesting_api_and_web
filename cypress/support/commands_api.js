// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('logInUser', () => {
    cy.readFile('cypress/fixtures/api.json').then(response => {
        const user_id = response.user_id
        const user_name = response.user_name
        const user_email = response.user_email
        const user_password = response.user_password
        cy.api({
            method: 'POST',
            url: '/users/login',
            body: {
                email: user_email,
                password: user_password
              },
        }).then(response => {
            expect(response.status).to.eq(200)
            cy.log(JSON.stringify(response.body.name))
            cy.writeFile('cypress/fixtures/api.json', {
                "user_id": user_id,
                "user_name": user_name,
                "user_email": user_email,
                "user_password": user_password,
                "user_token": response.body.data.token,
            })
        })
    })
})

Cypress.Commands.add('deleteUser', () => {
    cy.readFile('cypress/fixtures/api.json').then(response => {
        const user_token = response.user_token;
        cy.api({
            method: 'DELETE',
            url: '/users/delete-account',
            form: true, //sets to application/x-www-form-urlencoded
            headers: { 'X-Auth-Token': user_token },
        }).then(response => {
            expect(response.status).to.eq(200); 
            expect(response.body.message).to.eq("Account successfully deleted")
        })
    })
})

