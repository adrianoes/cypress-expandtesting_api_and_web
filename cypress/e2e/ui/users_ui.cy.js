import { faker } from '@faker-js/faker'

describe('/users_ui', () => {

    const baseAppUrl = Cypress.env('baseAppUrl')
    
    beforeEach(function () {
        cy.visit(baseAppUrl)
    });

    it('Creates a new user account via UI', { tags: ['UI', 'BASIC', 'FULL'] },  () => {
        const randomNumber = faker.finance.creditCardNumber() 
        const user = {
            name: faker.person.fullName(), 
            //e-mail faker generates faker upper case e-mails. Responses present lower case e-mails. Below function will help.
            email: faker.internet.exampleEmail().toLowerCase(),
            password: faker.internet.password({ length: 8 })
        }
        cy.get('[href="/notes/app/register"]').contains('Create an account').should('be.visible').click()
        cy.title().should('eq', 'Notes React Application for Automation Testing Practice')
        cy.get('.badge').should('have.text', 'Tip').should('be.visible')
        cy.get('input[name="email"]').click().type(user.email)
        cy.get('input[name="name"]').click().type(user.name)
        cy.get('input[name="password"]').click().type(user.password)
        cy.get('input[name="confirmPassword"]').click().type(user.password)
        cy.intercept('/notes/api/users/register').as('loginForm')
        cy.contains('button', 'Register').click()
        cy.title().should('eq', 'Notes React Application for Automation Testing Practice')
        cy.contains('b', 'User account created successfully').should('be.visible')
        cy.get('[href="/notes/app/login"]').contains('Click here to Log In').should('be.visible').click()
        cy.title().should('eq', 'Notes React Application for Automation Testing Practice')
        cy.get('h1').should('have.text', 'Login').should('be.visible')
        cy.wait('@loginForm').then(({response}) => {
            expect(response.body.message).to.eq('User account created successfully')
            expect(response.statusCode).to.eq(201)
            cy.writeFile(`cypress/fixtures/testdata-${randomNumber}.json`, {
                "user_email": user.email,
                "user_name": user.name,
                "user_password": user.password,
                "user_id": response.body.data.id
            })
        })
        cy.logInUserViaUi(randomNumber)
        cy.deleteUserViaUi()
        cy.deleteJsonFile(randomNumber)
    })

    it('Creates a new user account via UI - Invalid e-mail', { tags: ['UI', 'FULL', 'NEGATIVE'] },  () => {
        const user = {
            name: faker.person.fullName(), 
            //e-mail faker generates faker upper case e-mails. Responses present lower case e-mails. Below function will help.
            email: faker.internet.exampleEmail().toLowerCase(),
            password: faker.internet.password({ length: 8 })
        }
        cy.get('[href="/notes/app/register"]').contains('Create an account').should('be.visible').click()
        cy.title().should('eq', 'Notes React Application for Automation Testing Practice')
        cy.get('.badge').should('have.text', 'Tip').should('be.visible')
        cy.get('input[name="email"]').click().type('@'+user.email)
        cy.get('input[name="name"]').click().type(user.name)
        cy.get('input[name="password"]').click().type(user.password)
        cy.get('input[name="confirmPassword"]').click().type(user.password)
        cy.intercept('/notes/api/users/register').as('loginForm')
        cy.contains('button', 'Register').click()
        cy.get('[data-testid="alert-message"]').contains('A valid email address is required').should('be.visible')
    })

    it('Creates a new user account via UI - Wrong password', { tags: ['UI', 'FULL', 'NEGATIVE'] },  () => {
        const user = {
            name: faker.person.fullName(), 
            //e-mail faker generates faker upper case e-mails. Responses present lower case e-mails. Below function will help.
            email: faker.internet.exampleEmail().toLowerCase(),
            password: faker.internet.password({ length: 8 })
        }
        cy.get('[href="/notes/app/register"]').contains('Create an account').should('be.visible').click()
        cy.title().should('eq', 'Notes React Application for Automation Testing Practice')
        cy.get('.badge').should('have.text', 'Tip').should('be.visible')
        cy.get('input[name="email"]').click().type(user.email)
        cy.get('input[name="name"]').click().type(user.name)
        cy.get('input[name="password"]').click().type(user.password)
        cy.get('input[name="confirmPassword"]').click().type('e'+user.password)
        cy.intercept('/notes/api/users/register').as('loginForm')
        cy.contains('button', 'Register').click()
        cy.get('.mb-3 > .invalid-feedback').contains('Passwords don\'t match!').should('be.visible')
    })

    it('Log in as an existing user via UI', { tags: ['UI', 'BASIC', 'FULL'] },  () => {
        const randomNumber = faker.finance.creditCardNumber()
        cy.createUserViaUi(randomNumber)
        cy.readFile(`cypress/fixtures/testdata-${randomNumber}.json`).then(response => {
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
                cy.writeFile(`cypress/fixtures/testdata-${randomNumber}.json`, {
                    "user_id": user.user_id,
                    "user_email": user.user_email,
                    "user_name": user.user_name,
                    "user_password": user.user_password,
                    "user_token": response.body.data.token
                })
            })
        })
        cy.deleteUserViaUi()       
        cy.deleteJsonFile(randomNumber)
    })

    it('Log in as an existing user via UI - Wrong password', { tags: ['UI', 'FULL', 'NEGATIVE'] },  () => {
        const randomNumber = faker.finance.creditCardNumber()
        cy.createUserViaUi(randomNumber)
        cy.readFile(`cypress/fixtures/testdata-${randomNumber}.json`).then(response => {
            const user = {
                user_email: response.user_email,
                user_id: response.user_id,
                user_name: response.user_name,
                user_password: response.user_password
            }          
            cy.visit(baseAppUrl + '/login')
            cy.title().should('eq', 'Notes React Application for Automation Testing Practice')
            cy.get('input[name="email"]').click().type(user.user_email)
            cy.get('input[name="password"]').click().type('e'+user.user_password)
            cy.contains('button', 'Login').click()    
            cy.get('[data-testid="alert-message"]').contains('Incorrect email address or password').should('be.visible')       
        })
        //correct login to login, get the token and delete the user to clean the environment.
        cy.logInUserViaUi(randomNumber)   
        cy.deleteUserViaUi()       
        cy.deleteJsonFile(randomNumber)
    })

    it('Log in as an existing user via UI - Invalid e-mail', { tags: ['UI', 'FULL', 'NEGATIVE'] },  () => {
        const randomNumber = faker.finance.creditCardNumber()        
        cy.createUserViaUi(randomNumber)
        cy.readFile(`cypress/fixtures/testdata-${randomNumber}.json`).then(response => {
            const user = {
                user_email: response.user_email,
                user_id: response.user_id,
                user_name: response.user_name,
                user_password: response.user_password
            }        
            cy.visit(baseAppUrl + '/login')
            cy.title().should('eq', 'Notes React Application for Automation Testing Practice')
            cy.get('input[name="email"]').click().type('e'+user.user_email)
            cy.get('input[name="password"]').click().type(user.user_password)
            cy.contains('button', 'Login').click()    
            cy.get('[data-testid="alert-message"]').contains('Incorrect email address or password').should('be.visible')       
        })
        //correct login to login, get the token and delete the user to clean the environment.
        cy.logInUserViaUi(randomNumber)   
        cy.deleteUserViaUi()       
        cy.deleteJsonFile(randomNumber)      
    })

    it('Retrieve user profile information via UI', { tags: ['UI', 'BASIC', 'FULL'] },  () => {
        const randomNumber = faker.finance.creditCardNumber()
        cy.createUserViaUi(randomNumber)
        cy.logInUserViaUi(randomNumber)      
        cy.get('[href="/notes/app/profile"]').contains('Profile').should('be.visible').click()
        cy.deleteUserViaUi()       
        cy.deleteJsonFile(randomNumber)      
    })

    it('Update user profile information via UI', { tags: ['UI', 'BASIC', 'FULL'] },  () => {
        const randomNumber = faker.finance.creditCardNumber()
        cy.createUserViaUi(randomNumber)
        cy.logInUserViaUi(randomNumber)        
        cy.get('[href="/notes/app/profile"]').contains('Profile').should('be.visible').click()
        cy.get('input[name="phone"]').click().type(faker.string.numeric({ length: 12 }))
        cy.get('input[name="company"]').click().type(faker.internet.userName())
        cy.contains('button', 'Update profile').click()
        cy.get('[data-testid="alert-message"]').contains('Profile updated successful').should('be.visible')
        cy.deleteUserViaUi()       
        cy.deleteJsonFile(randomNumber)    
    })

    it('Update user profile information via UI - Invalid company name', { tags: ['UI', 'FULL', 'NEGATIVE'] },  () => {
        const randomNumber = faker.finance.creditCardNumber()
        cy.createUserViaUi(randomNumber)
        cy.logInUserViaUi(randomNumber)        
        cy.get('[href="/notes/app/profile"]').contains('Profile').should('be.visible').click()
        cy.get('input[name="phone"]').click().type(faker.string.numeric({ length: 12 }))
        cy.get('input[name="company"]').click().type('e')
        cy.contains('button', 'Update profile').click()
        cy.get('.mb-4 > .invalid-feedback').contains('company name should be between 4 and 30 characters').should('be.visible')
        cy.deleteUserViaUi()       
        cy.deleteJsonFile(randomNumber)       
    })

    it('Update user profile information via UI - Invalid phone number', { tags: ['UI', 'FULL', 'NEGATIVE'] },  () => {
        const randomNumber = faker.finance.creditCardNumber()
        cy.createUserViaUi(randomNumber)
        cy.logInUserViaUi(randomNumber)        
        cy.get('[href="/notes/app/profile"]').contains('Profile').should('be.visible').click()
        cy.get('input[name="phone"]').click().type(faker.string.numeric({ length: 2 }))
        cy.get('input[name="company"]').click().type(faker.internet.userName())
        cy.contains('button', 'Update profile').click()
        cy.get(':nth-child(2) > .mb-2 > .invalid-feedback').contains('Phone number should be between 8 and 20 digits').should('be.visible')
        cy.deleteUserViaUi()       
        cy.deleteJsonFile(randomNumber)       
    })

    it('Change a user\'s password via UI', { tags: ['UI', 'BASIC', 'FULL'] },  () => {
        const randomNumber = faker.finance.creditCardNumber()
        cy.createUserViaUi(randomNumber)
        cy.logInUserViaUi(randomNumber)        
        cy.readFile(`cypress/fixtures/testdata-${randomNumber}.json`).then(response => {
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
        cy.deleteJsonFile(randomNumber)      
    })

    it('Change a user\'s password via UI - Type same password', { tags: ['UI', 'FULL', 'NEGATIVE'] },  () => {
        const randomNumber = faker.finance.creditCardNumber()
        cy.createUserViaUi(randomNumber)
        cy.logInUserViaUi(randomNumber)        
        cy.readFile(`cypress/fixtures/testdata-${randomNumber}.json`).then(response => {
            const user = {
                user_password: response.user_password
            } 
            cy.get('[href="/notes/app/profile"]').contains('Profile').should('be.visible').click()
            cy.get('[data-testid="change-password"]').contains('Change password').should('be.visible').click()
            cy.get('input[data-testid="current-password"]').click().type(user.user_password)
            cy.get('input[data-testid="new-password"]').click().type(user.user_password)
            cy.get('input[data-testid="confirm-password"]').click().type(user.user_password)
            cy.contains('button', 'Update password').click()
            cy.get('[data-testid="alert-message"]').contains('The new password should be different from the current password').should('be.visible')
        })
        cy.deleteUserViaUi()       
        cy.deleteJsonFile(randomNumber)     
    })

    it('Log out a user via UI', { tags: ['UI', 'BASIC', 'FULL'] },  () => {
        const randomNumber = faker.finance.creditCardNumber()
        cy.createUserViaUi(randomNumber)
        cy.logInUserViaUi(randomNumber) 
        cy.contains('button', 'Logout').click()
        cy.get('[href="/notes/app/login"]').contains('Login').should('be.visible')
        cy.logInUserViaUi(randomNumber) 
        cy.deleteUserViaUi()       
        cy.deleteJsonFile(randomNumber)       
    })

    it('Delete user account via UI', { tags: ['UI', 'BASIC', 'FULL'] },  () => {
        const randomNumber = faker.finance.creditCardNumber()
        cy.createUserViaUi(randomNumber)
        cy.logInUserViaUi(randomNumber)
        cy.visit(baseAppUrl + '/profile')
        cy.contains('button', 'Delete Account').click()
        cy.get('[data-testid="note-delete-confirm"]').click()
        cy.get('[data-testid="alert-message"]').contains('Your account has been deleted. You should create a new account to continue.').should('be.visible')     
        cy.deleteJsonFile(randomNumber)
    })
})



