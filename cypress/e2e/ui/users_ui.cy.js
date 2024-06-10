import { faker } from '@faker-js/faker'

describe('/users_ui', () => {

    const baseAppUrl = `${Cypress.env('baseAppUrl')}`
    
    beforeEach(function () {
        cy.visit(baseAppUrl)  
    });

    it('Creates a new user account via UI', () => {
        const user = {
            name: faker.person.fullName(), 
            //e-mail faker generates faker upper case e-mails. Responses present lower case e-mails. Below function will help.
            email: faker.internet.exampleEmail().toLowerCase(),
            password: faker.internet.password({ length: 8 })
        }
        cy.get('[href="/notes/app/register"]').contains('Create an account').should('be.visible').click()
        cy.get('input[name="email"]').click().type(user.email)
        cy.get('input[name="name"]').click().type(user.name)
        cy.get('input[name="password"]').click().type(user.password)
        cy.get('input[name="confirmPassword"]').click().type(user.password)
        //miss organize code blocks, code hooks an api commands
        cy.intercept('/notes/api/users/register').as('loginForm')
        cy.contains('button', 'Register').click()
        cy.contains('b', 'User account created successfully').should('be.visible')
        cy.get('[href="/notes/app/login"]').contains('Click here to Log In').should('be.visible').click() 
        cy.wait('@loginForm').then(({response}) => {
            expect(response.statusCode).to.eq(201)
            expect(response.body.message).to.eq('User account created successfully')
            cy.writeFile('cypress/fixtures/api.json', {
                "user_id": response.body.data.id,
                "user_name": response.body.data.name,
                "user_email": response.body.data.email,
                "user_password": user.password
            })
        })
        cy.logInUserViaUi()
        cy.deleteUserViaUi()
    })



    it('Log in as an existing user via UI', () => {
        cy.createUserViaUi()
        cy.readFile('cypress/fixtures/ui.json').then(response => {
            const user = {
                user_id: response.user_id,
                user_email: response.user_email,
                user_name: response.user_name,
                user_password: response.user_password
            }        
            cy.visit(baseAppUrl + 'login')
            cy.title().should('eq', 'Notes React Application for Automation Testing Practice')
            cy.get('input[name="email"]').click().type(user.user_email)
            cy.get('input[name="password"]').click().type(user.user_password)
            cy.intercept('/notes/api/users/login').as('loginFormAndToken')
            cy.contains('button', 'Login').click()
            cy.get('input[placeholder="Search notes..."]').should('be.visible')
            cy.wait('@loginFormAndToken').then(({response}) => {
                expect(response.statusCode).to.eq(200)
                expect(response.body.message).to.eq('Login successful')
                cy.writeFile('cypress/fixtures/ui.json', {
                    "user_id": user.user_id,
                    "user_email": user.user_email,
                    "user_name": user.user_name,
                    "user_password": user.user_password,
                    "user_token": response.body.data.token
                })
            })
        })
        cy.deleteUserViaUi()       
    })

    it('Retrieve user profile information via UI', () => {
        cy.createUserViaUi()
        cy.logInUserViaUi()        
        cy.get('[href="/notes/app/profile"]').contains('Profile').should('be.visible').click()
        cy.deleteUserViaUi()       
    })

    it('Update user profile information via UI', () => {
        cy.createUserViaUi()
        cy.logInUserViaUi()        
        cy.get('[href="/notes/app/profile"]').contains('Profile').should('be.visible').click()
        cy.get('input[name="phone"]').click().type(faker.string.numeric({ length: 12 }))
        cy.get('input[name="company"]').click().type(faker.internet.userName())
        cy.contains('button', 'Update profile').click()
        cy.get('[data-testid="alert-message"]').contains('Profile updated successful').should('be.visible')
        cy.deleteUserViaUi()       
    })

    it('Change a user\'s password via UI', () => {
        cy.createUserViaUi()
        cy.logInUserViaUi()        
        cy.readFile('cypress/fixtures/ui.json').then(response => {
            const user = {
                user_password: response.user_password,
                new_password: faker.internet.password({ length: 8 })
            } 
            cy.get('[href="/notes/app/profile"]').contains('Profile').should('be.visible').click()
            cy.get('[data-testid="change-password"]').contains('Change password').should('be.visible').click()
            cy.get('input[data-testid="current-password"]').click().type(user.user_password)
            cy.get('input[data-testid="new-password"]').click().type(user.new_password)
            cy.get('input[data-testid="confirm-password"]').click().type(user.new_password)
            cy.contains('button', 'Update password').click()
            cy.get('[data-testid="alert-message"]').contains('The password was successfully updated').should('be.visible')
        })
        cy.deleteUserViaUi()       
    })

    it('Log out a user via UI', () => {
        cy.createUserViaUi()
        cy.logInUserViaUi() 
        cy.contains('button', 'Logout').click()
        cy.get('[href="/notes/app/login"]').contains('Login').should('be.visible')
        cy.logInUserViaUi() 
        cy.deleteUserViaUi()       
    })

    it('Delete user account via UI', () => {
        cy.createUserViaUi()
        cy.logInUserViaUi()
        cy.visit(baseAppUrl + 'profile')
        cy.contains('button', 'Delete Account').click()
        cy.get('[data-testid="note-delete-confirm"]').click()
        cy.get('[data-testid="alert-message"]').contains('Your account has been deleted. You should create a new account to continue.').should('be.visible')
    })
})


// create user should carry: 
// email
// password
// name
// and check:
// email
// name
// status code
// message
// and write:
// email
// password
// name
// user_id

// login user should carry:
// email
// password
// and read:
// email
// password
// name
// user_id
// and check:
// email
// name
// user_id
// status code
// message
// and write:
// email
// password
// name
// user_id
// token

// delete user should carry:
// token
// and read:
// token
// and check:
// status code
// message

// create a note should Carry:
// title
// description
// category
// user_token
// and read:
// user_id
// token
// and check:
// title
// description
// category
// user_id
// status code
// message
// and write:
// title
// description
// category
// user_id
// note_id
// token

// delete note should carry:
// token
// note_id
// and read:
// token
// note_id
// and check:
// status code
// message