import { faker } from '@faker-js/faker'

describe('/users_api', () => {

    const baseApiUrl = `${Cypress.env('baseApiUrl')}`

    afterEach(function () {  
        cy.writeFile('cypress/fixtures/api.json', '')
    });
    
    it('Creates a new user account', () => {
        const user = {
            name: faker.internet.userName(),
            email: faker.internet.exampleEmail(),
            password: faker.internet.password({ length: 8 })
        }
        cy.api({
            method: 'POST',
            url: baseApiUrl + '/users/register',
            body: {
                name: user.name,
                email: user.email,
                password: user.password
            },
        }).then(response => {
            expect(response.status).to.eq(201)
            expect(response.body.message).to.eq("User account created successfully")
            cy.log(JSON.stringify(response.body.message))
            cy.writeFile('cypress/fixtures/api.json', {
                "user_id": response.body.data.id,
                "user_name": response.body.data.name,
                "user_email": response.body.data.email,
                "user_password": user.password
            })
        })
        cy.logInUser() 
        cy.deleteUser()        
    })

    it('Log in as an existing user', () => {
        cy.createUser()
        cy.readFile('cypress/fixtures/api.json').then(response => {
            const log_user = {
                user_id: response.user_id,
                user_name: response.user_name,
                user_email: response.user_email,
                user_password: response.user_password,
            }
            cy.api({
                method: 'POST',
                url: baseApiUrl + '/users/login',
                body: {
                    email: log_user.user_email,
                    password: log_user.user_password
                },
            }).then(response => {
                expect(response.status).to.eq(200)
                cy.log(JSON.stringify(response.body.name))
                cy.writeFile('cypress/fixtures/api.json', {
                    "user_id": log_user.user_id,
                    "user_name": log_user.user_name,
                    "user_email": log_user.user_email,
                    "user_password": log_user.user_password,
                    "user_token": response.body.data.token,
                })
            })
        }) 
        cy.deleteUser()        
    })

    it('Retrieve user profile information', () => {
        cy.createUser()
        cy.logInUser()
        cy.readFile('cypress/fixtures/api.json').then(response => {
            const user_token = response.user_token;
            cy.api({
                method: 'GET',
                url: baseApiUrl + '/users/profile',
                form: true,
                headers: { 'X-Auth-Token': user_token },
            }).then(response => {
                expect(response.status).to.eq(200); 
                expect(response.body.message).to.eq("Profile successful")
            })
        })   
        cy.deleteUser()      
    })

    it('Update the user profile information', () => {
        cy.createUser()
        cy.logInUser()
        cy.readFile('cypress/fixtures/api.json').then(response => {            
            const user_name = response.user_name;
            const user_token = response.user_token;
            const updated_user = {            
                updated_name: faker.internet.userName(),
                phone: faker.string.numeric({ length: 12 }),
                company: faker.internet.userName()
            }
            cy.api({
                method: 'PATCH',
                url: baseApiUrl + '/users/profile',
                form: true,
                headers: { 'X-Auth-Token': user_token },
                body: {
                    name: updated_user.updated_name,
                    phone: updated_user.phone,
                    company: updated_user.company
                },
            }).then(response => {
                expect(response.status).to.eq(200)
                expect(response.body.data.name).to.not.eq(user_name)
                expect(response.body.message).to.eq('Profile updated successful')
                cy.log(JSON.stringify(response.body.message))
            })
        })
        cy.deleteUser()        
    })

    it('Send password reset link to user\'s email', () => {
        cy.createUser()
        cy.logInUser()
        cy.readFile('cypress/fixtures/api.json').then(response => {
            const user_email = response.user_email
            cy.api({
                method: 'POST',
                url: baseApiUrl + '/users/forgot-password',
                body: {
                    email: user_email
                },
            }).then(response => {
                expect(response.status).to.eq(200)
                expect(response.body.message).to.eq('Password reset link successfully sent to ' + user_email + '. Please verify by clicking on the given link')
                cy.log(JSON.stringify(response.body.message))
            })
        }) 
        cy.deleteUser()        
    })

    it('Change a user\'s password', () => {
        cy.createUser()
        cy.logInUser()
        cy.readFile('cypress/fixtures/api.json').then(response => {
            const password = response.user_password;
            const user_token = response.user_token;
            const updated_password = faker.internet.password({ length: 8 })
            cy.api({
                method: 'POST',
                url: baseApiUrl + '/users/change-password',
                form: true,
                headers: { 'X-Auth-Token': user_token },
                body: {
                    currentPassword: password,
                    newPassword: updated_password
                },
            }).then(response => {
                expect(response.status).to.eq(200)
                expect(response.body.message).to.eq('The password was successfully updated')
                cy.log(JSON.stringify(response.body.message))
            })
        }) 
        cy.deleteUser()        
    })

    it('Log out a user', () => {
        cy.createUser()
        cy.logInUser()
        cy.readFile('cypress/fixtures/api.json').then(response => {
            const user_token = response.user_token;
            cy.api({
                method: 'DELETE',
                url: baseApiUrl + '/users/logout',
                form: true, //sets to application/x-www-form-urlencoded
                headers: { 'X-Auth-Token': user_token },
            }).then(response => {
                expect(response.status).to.eq(200); 
                expect(response.body.message).to.eq("User has been successfully logged out")
            })
        })  
        cy.logInUser()
        cy.deleteUser()      
    })

    it('Delete user account', () => {
        cy.createUser()
        cy.logInUser()
        cy.readFile('cypress/fixtures/api.json').then(response => {
            const user_token = response.user_token;
            cy.api({
                method: 'DELETE',
                url: baseApiUrl + '/users/delete-account',
                form: true, //sets to application/x-www-form-urlencoded
                headers: { 'X-Auth-Token': user_token },
            }).then(response => {
                expect(response.status).to.eq(200); 
                expect(response.body.message).to.eq("Account successfully deleted")
            })
        })        
    })
})