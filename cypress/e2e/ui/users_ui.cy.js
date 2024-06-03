import { faker } from '@faker-js/faker'

describe('/users_ui', () => {

    const baseAppUrl = `${Cypress.env('baseAppUrl')}`
    
    beforeEach(function () {
        cy.visit(baseAppUrl)  
    });

    it('Creates a new user account', () => {
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

        cy.title().should('eq', 'Notes React Application for Automation Testing Practice')
        cy.get('input[name="email"]').click().type(user.email)
        cy.get('input[name="password"]').click().type(user.password)
        cy.contains('button', 'Login').click()
        cy.get('[href="/notes/app/"]').contains('Home - My Notes ').should('be.visible')

        cy.get('[href="/notes/app/profile"]').contains('Profile').should('be.visible').click()
        cy.contains('button', 'Delete Account').click()
        cy.get('[data-testid="note-delete-confirm"]').click()
        cy.get('[data-testid="alert-message"]').contains('Your account has been deleted. You should create a new account to continue.').should('be.visible')

    })





})