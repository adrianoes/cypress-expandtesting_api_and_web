import { faker } from '@faker-js/faker'

const baseAppUrl = Cypress.env('baseAppUrl')

Cypress.Commands.add('logInUserViaUiWhenReadFromApi', () => {
    cy.readFile('cypress/fixtures/api.json').then(response => {
        const user = {
            user_email: response.user_email,
            user_id: response.user_id,
            user_name: response.user_name,
            user_password: response.user_password
        }        
        cy.visit(baseAppUrl + '/login')
        cy.title().should('eq', 'Notes React Application for Automation Testing Practice')
        cy.get('input[name="email"]').click().type(user.user_email)
        cy.get('input[name="password"]').click().type(user.user_password)
        //API validation can be done using intercept(). I'm not sure if it is needed here.
        cy.intercept('/notes/api/users/login').as('loginFormAndToken')
        cy.contains('button', 'Login').click()
        cy.get('input[placeholder="Search notes..."]').should('be.visible')
        cy.wait('@loginFormAndToken').then(({response}) => {
            cy.visit(baseAppUrl + '/profile')
            cy.get('[data-testid="user-email"]').should('have.value', user.user_email).should('be.visible')
            cy.get('[data-testid="user-id"]').should('have.value', user.user_id).should('be.visible')
            cy.get('[data-testid="user-name"]').should('have.value', user.user_name).should('be.visible')
            expect(response.body.message).to.eq('Login successful')
            expect(response.statusCode).to.eq(200)
            cy.writeFile('cypress/fixtures/api.json', {
                "user_id": user.user_id,
                "user_email": user.user_email,
                "user_name": user.user_name,
                "user_password": user.user_password,
                "user_token": response.body.data.token
            })
        })
    })
})