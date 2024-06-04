import { faker } from '@faker-js/faker'

const baseAppUrl = `${Cypress.env('baseAppUrl')}`

Cypress.Commands.add('logInUserViaUi', () => {
    cy.readFile('cypress/fixtures/ui.json').then(response => {
        const user = {
            user_email: response.user_email,
            user_name: response.user_name,
            user_password: response.user_password
        }        
        cy.visit(baseAppUrl + 'login')
        cy.title().should('eq', 'Notes React Application for Automation Testing Practice')
        cy.get('input[name="email"]').click().type(user.user_email)
        cy.get('input[name="password"]').click().type(user.user_password)
        cy.contains('button', 'Login').click()
        cy.get('input[placeholder="Search notes..."]').should('be.visible')
        cy.writeFile('cypress/fixtures/ui.json', {
            "user_email": user.user_email,
            "user_name": user.user_name,
            "user_password": user.user_password                
        })
    })
})

Cypress.Commands.add('deleteUserViaUi', () =>{
    cy.visit(baseAppUrl + 'profile')
    cy.contains('button', 'Delete Account').click()
    cy.get('[data-testid="note-delete-confirm"]').click()
    cy.get('[data-testid="alert-message"]').contains('Your account has been deleted. You should create a new account to continue.').should('be.visible')
})

Cypress.Commands.add('createUserViaUi', ()=>{
    const user = {
        name: faker.internet.userName(),
        email: faker.internet.exampleEmail(),
        password: faker.internet.password({ length: 8 })
    }
    cy.get('[href="/notes/app/register"]').contains('Create an account').should('be.visible').click()
    cy.get('input[name="email"]').click().type(user.email)
    cy.get('input[name="name"]').click().type(user.name)
    cy.get('input[name="password"]').click().type(user.password)
    cy.get('input[name="confirmPassword"]').click().type(user.password)
    cy.contains('button', 'Register').click()
    cy.contains('b', 'User account created successfully').should('be.visible')
    cy.get('[href="/notes/app/login"]').contains('Click here to Log In').should('be.visible').click()
    cy.writeFile('cypress/fixtures/ui.json', {
        "user_email": user.email,
        "user_name": user.name,
        "user_password": user.password
    })
})