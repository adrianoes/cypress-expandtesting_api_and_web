import { faker } from '@faker-js/faker'

describe('/users_api', () => {

    const baseApiUrl = `${Cypress.env('baseApiUrl')}`

    afterEach(function () {  
        cy.writeFile('cypress/fixtures/api.json', '')
    });
    
    it('Creates a new user account via API', () => {
        const user = {            
            //e-mail faker generates faker upper case e-mails. Responses present lower case e-mails. Below function will help.
            user_email: faker.internet.exampleEmail().toLowerCase(),
            user_name: faker.person.fullName(), 
            user_password: faker.internet.password({ length: 8 })
        }
        cy.api({
            method: 'POST',
            url: baseApiUrl + '/users/register',
            body: {
                name: user.user_name,
                email: user.user_email,
                password: user.user_password
            },
        }).then(response => {
            expect(response.body.data.email).to.eq(user.user_email)
            expect(response.body.data.name).to.eq(user.user_name)
            expect(response.body.message).to.eq("User account created successfully")
            expect(response.status).to.eq(201)                
            cy.log(JSON.stringify(response.body.message))
            cy.writeFile('cypress/fixtures/api.json', {
                "user_email": response.body.data.email,
                "user_id": response.body.data.id,
                "user_name": response.body.data.name,                
                "user_password": user.user_password
            })
        })
        cy.logInUserViaApi() 
        cy.deleteUserViaApi()        
    })

    it('Log in as an existing user via API', () => {
        cy.createUserViaApi()
        cy.readFile('cypress/fixtures/api.json').then(response => {
            const user = {
                user_email: response.user_email,
                user_id: response.user_id,
                user_name: response.user_name,
                user_password: response.user_password,
            }
            cy.api({
                method: 'POST',
                url: baseApiUrl + '/users/login',
                body: {
                    email: user.user_email,
                    password: user.user_password
                },
            }).then(response => {
                expect(response.body.data.email).to.eq(user.user_email)
                expect(response.body.data.id).to.eq(user.user_id)
                expect(response.body.data.name).to.eq(user.user_name)
                expect(response.body.message).to.eq("Login successful")
                expect(response.status).to.eq(200)
                cy.log(JSON.stringify(response.body.name))
                cy.writeFile('cypress/fixtures/api.json', {
                    "user_email": user.user_email,
                    "user_id": user.user_id,
                    "user_name": user.user_name,
                    "user_password": user.user_password,
                    "user_token": response.body.data.token,
                })
            })
        }) 
        cy.deleteUserViaApi()        
    })

    it('Retrieve user profile information via API', () => {
        cy.createUserViaApi()
        cy.logInUserViaApi()
        cy.readFile('cypress/fixtures/api.json').then(response => {
            const user = {
                user_email: response.user_email,
                user_id: response.user_id,
                user_name: response.user_name,
                user_password: response.user_password,
                user_token: response.user_token
            }
            cy.api({
                method: 'GET',
                url: baseApiUrl + '/users/profile',
                form: true,
                headers: { 'X-Auth-Token': user.user_token },
            }).then(response => {
                expect(response.body.data.email).to.eq(user.user_email)
                expect(response.body.data.id).to.eq(user.user_id)
                expect(response.body.data.name).to.eq(user.user_name)
                expect(response.body.message).to.eq("Profile successful")
                expect(response.status).to.eq(200) 
                cy.log(JSON.stringify(response.body.message))               
            })
        })   
        cy.deleteUserViaApi()      
    })

    it('Update the user profile information via API', () => {
        cy.createUserViaApi()
        cy.logInUserViaApi()
        cy.readFile('cypress/fixtures/api.json').then(response => { 
            const user = {
                user_email: response.user_email,
                user_id: response.user_id,
                user_name: response.user_name,
                user_password: response.user_password,
                user_token: response.user_token
            }           
            const updated_user = {  
                updated_user_company: faker.internet.userName(), 
                updated_user_phone: faker.string.numeric({ length: 12 }),         
                updated_user_name: faker.person.fullName()                
            }
            cy.api({
                method: 'PATCH',
                url: baseApiUrl + '/users/profile',
                form: true,
                headers: { 'X-Auth-Token': user.user_token },
                body: {
                    name: updated_user.updated_user_name,
                    phone: updated_user.updated_user_phone,
                    company: updated_user.updated_user_company
                },
            }).then(response => {
                expect(response.body.data.company).to.eq(updated_user.updated_user_company)
                expect(response.body.data.email).to.eq(user.user_email)
                expect(response.body.data.id).to.eq(user.user_id)
                expect(response.body.data.name).to.eq(updated_user.updated_user_name)                
                expect(response.body.data.phone).to.eq(updated_user.updated_user_phone)
                expect(response.body.message).to.eq('Profile updated successful')
                expect(response.status).to.eq(200)                    
                cy.log(JSON.stringify(response.body.message))
            })
        })
        cy.deleteUserViaApi()        
    })

    it('Change a user\'s password via API', () => {
        cy.createUserViaApi()
        cy.logInUserViaApi()
        cy.readFile('cypress/fixtures/api.json').then(response => {
            const user = {
                user_password: response.user_password,
                user_token: response.user_token
            }  
            const updated_password = faker.internet.password({ length: 8 })
            cy.api({
                method: 'POST',
                url: baseApiUrl + '/users/change-password',
                form: true,
                headers: { 'X-Auth-Token': user.user_token },
                body: {
                    currentPassword: user.user_password,
                    newPassword: updated_password
                },
            }).then(response => {
                expect(user.user_password).to.not.eq(updated_password)  
                expect(response.body.message).to.eq('The password was successfully updated')
                expect(response.status).to.eq(200)
                cy.log(JSON.stringify(response.body.message))
            })
        }) 
        cy.deleteUserViaApi()        
    })

    it('Log out a user via API', () => {
        cy.createUserViaApi()
        cy.logInUserViaApi()
        cy.readFile('cypress/fixtures/api.json').then(response => {
            const user_token = response.user_token;
            cy.api({
                method: 'DELETE',
                url: baseApiUrl + '/users/logout',
                form: true, //sets to application/x-www-form-urlencoded
                headers: { 'X-Auth-Token': user_token },
            }).then(response => {
                expect(response.body.message).to.eq("User has been successfully logged out")
                expect(response.status).to.eq(200); 
                cy.log(JSON.stringify(response.body.message))
            })
        })  
        cy.logInUserViaApi()
        cy.deleteUserViaApi()      
    })

    it('Delete user account via API', () => {
        cy.createUserViaApi()
        cy.logInUserViaApi()
        cy.readFile('cypress/fixtures/api.json').then(response => {
            const user_token = response.user_token;
            cy.api({
                method: 'DELETE',
                url: baseApiUrl + '/users/delete-account',
                form: true, //sets to application/x-www-form-urlencoded
                headers: { 'X-Auth-Token': user_token },
            }).then(response => {
                expect(response.body.message).to.eq("Account successfully deleted")
                expect(response.status).to.eq(200)   
                cy.log(JSON.stringify(response.body.message))             
            })
        })        
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

