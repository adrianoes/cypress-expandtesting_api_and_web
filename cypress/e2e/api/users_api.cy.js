import { faker } from '@faker-js/faker'

describe('/users_api', () => {

    const baseApiUrl = Cypress.env('baseApiUrl')


    
    it('Creates a new user account via API', { tags: ['API', 'BASIC', 'FULL'] }, () => {
        const randomNumber = faker.finance.creditCardNumber()
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
            cy.writeFile(`cypress/fixtures/testdata-${randomNumber}.json`, {
                "user_email": user.user_email,
                "user_id": response.body.data.id,
                "user_name": user.user_name,                
                "user_password": user.user_password
            })
        })
        cy.logInUserViaApi(randomNumber) 
        cy.deleteUserViaApi(randomNumber) 
        cy.deleteJsonFile(randomNumber)        
    })

    it('Creates a new user account via API - Bad request', { tags: ['API', 'FULL', 'NEGATIVE'] }, () => {
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
                email: '@'+user.user_email,
                password: user.user_password
            },
            failOnStatusCode: false,
        }).then(response => {
            expect(response.body.message).to.eq("A valid email address is required")
            expect(response.status).to.eq(400)                
            cy.log(JSON.stringify(response.body.message))
        })      
    })

    it('Log in as an existing user via API', { tags: ['API', 'BASIC', 'FULL'] }, () => {
        const randomNumber = faker.finance.creditCardNumber()
        cy.createUserViaApi(randomNumber)
        cy.readFile(`cypress/fixtures/testdata-${randomNumber}.json`).then(response => {
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
                cy.writeFile(`cypress/fixtures/testdata-${randomNumber}.json`, {
                    "user_email": user.user_email,
                    "user_id": user.user_id,
                    "user_name": user.user_name,
                    "user_password": user.user_password,
                    "user_token": response.body.data.token,
                })
            })
        }) 
        cy.deleteUserViaApi(randomNumber) 
        cy.deleteJsonFile(randomNumber)        
    })

    it('Log in as an existing user via API - Bad request', { tags: ['API', 'FULL', 'NEGATIVE'] }, () => {
        const randomNumber = faker.finance.creditCardNumber()
        cy.createUserViaApi(randomNumber)
        cy.readFile(`cypress/fixtures/testdata-${randomNumber}.json`).then(response => {
            const user = {
                user_email: response.user_email,
                user_password: response.user_password,
            }
            cy.api({
                method: 'POST',
                url: baseApiUrl + '/users/login',
                body: {
                    email: '@'+user.user_email,
                    password: user.user_password
                },
                failOnStatusCode: false,
            }).then(response => {
                expect(response.body.message).to.eq("A valid email address is required")
                expect(response.status).to.eq(400)
                cy.log(JSON.stringify(response.body.message))
            })
        }) 
        //Login right so user can be deleted.
        cy.logInUserViaApi(randomNumber) 
        cy.deleteUserViaApi(randomNumber) 
        cy.deleteJsonFile(randomNumber)        
    })

    it('Log in as an existing user via API - Unauthorized Request', { tags: ['API', 'FULL', 'NEGATIVE'] }, () => {
        const randomNumber = faker.finance.creditCardNumber()
        cy.createUserViaApi(randomNumber)
        cy.readFile(`cypress/fixtures/testdata-${randomNumber}.json`).then(response => {
            const user = {
                user_email: response.user_email,
                user_password: response.user_password,
            }
            cy.api({
                method: 'POST',
                url: baseApiUrl + '/users/login',
                body: {
                    email: user.user_email,
                    password: '@'+user.user_password
                },
                failOnStatusCode: false,
            }).then(response => {
                expect(response.body.message).to.eq("Incorrect email address or password")
                expect(response.status).to.eq(401)
                cy.log(JSON.stringify(response.body.message))
            })
        }) 
        //Login right so user can be deleted.
        cy.logInUserViaApi(randomNumber) 
        cy.deleteUserViaApi(randomNumber) 
        cy.deleteJsonFile(randomNumber)         
    })

    it('Retrieve user profile information via API', { tags: ['API', 'BASIC', 'FULL'] }, () => {
        const randomNumber = faker.finance.creditCardNumber()
        cy.createUserViaApi(randomNumber)
        cy.logInUserViaApi(randomNumber)
        cy.readFile(`cypress/fixtures/testdata-${randomNumber}.json`).then(response => {
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
        cy.deleteUserViaApi(randomNumber) 
        cy.deleteJsonFile(randomNumber)       
    })

    it('Retrieve user profile information via API - Bad Request', { tags: ['API', 'FULL', 'NEGATIVE'] }, () => {
        const randomNumber = faker.finance.creditCardNumber()
        cy.createUserViaApi(randomNumber)
        cy.logInUserViaApi(randomNumber)
        cy.readFile(`cypress/fixtures/testdata-${randomNumber}.json`).then(response => {
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
                headers: { 
                    'X-Auth-Token': user.user_token,
                    'x-content-format': 'badRequest'
                },
                failOnStatusCode: false,
            }).then(response => {
                expect(response.body.message).to.eq("Invalid X-Content-Format header, Only application/json is supported.")
                expect(response.status).to.eq(400) 
                cy.log(JSON.stringify(response.body.message))               
            })
        })   
        cy.deleteUserViaApi(randomNumber) 
        cy.deleteJsonFile(randomNumber)       
    })

    it('Retrieve user profile information via API - Unauthorized Request', { tags: ['API', 'FULL', 'NEGATIVE'] }, () => {
        const randomNumber = faker.finance.creditCardNumber()
        cy.createUserViaApi(randomNumber)
        cy.logInUserViaApi(randomNumber)
        cy.readFile(`cypress/fixtures/testdata-${randomNumber}.json`).then(response => {
            const user = {
                user_token: response.user_token
            }
            cy.api({
                method: 'GET',
                url: baseApiUrl + '/users/profile',
                form: true,
                headers: { 'X-Auth-Token': '@'+user.user_token },
                failOnStatusCode: false,
            }).then(response => {
                expect(response.body.message).to.eq("Access token is not valid or has expired, you will need to login")
                expect(response.status).to.eq(401) 
                cy.log(JSON.stringify(response.body.message))               
            })
        })   
        cy.deleteUserViaApi(randomNumber) 
        cy.deleteJsonFile(randomNumber)       
    })

    it('Update the user profile information via API', { tags: ['API', 'BASIC', 'FULL'] }, () => {
        const randomNumber = faker.finance.creditCardNumber()
        cy.createUserViaApi(randomNumber)
        cy.logInUserViaApi(randomNumber)
        cy.readFile(`cypress/fixtures/testdata-${randomNumber}.json`).then(response => { 
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
        cy.deleteUserViaApi(randomNumber) 
        cy.deleteJsonFile(randomNumber)         
    })

    it('Update the user profile information via API - Bad Request', { tags: ['API', 'FULL', 'NEGATIVE'] }, () => {
        const randomNumber = faker.finance.creditCardNumber()
        cy.createUserViaApi(randomNumber)
        cy.logInUserViaApi(randomNumber)
        cy.readFile(`cypress/fixtures/testdata-${randomNumber}.json`).then(response => { 
            const user = {
                user_name: response.user_name,
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
                    name: 6+'@'+'#',
                    phone: updated_user.updated_user_phone,
                    company: updated_user.updated_user_company
                },
                failOnStatusCode: false,
            }).then(response => {
                expect(response.body.message).to.eq('User name must be between 4 and 30 characters')
                expect(response.status).to.eq(400) 
                cy.log(JSON.stringify(response.body.message))  
            })
        })
        cy.deleteUserViaApi(randomNumber) 
        cy.deleteJsonFile(randomNumber)      
    })

    it('Update the user profile information via API - Unauthorized Request', { tags: ['API', 'FULL', 'NEGATIVE'] }, () => {
        const randomNumber = faker.finance.creditCardNumber()
        cy.createUserViaApi(randomNumber)
        cy.logInUserViaApi(randomNumber)
        cy.readFile(`cypress/fixtures/testdata-${randomNumber}.json`).then(response => { 
            const user = {
                user_name: response.user_name,
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
                headers: { 'X-Auth-Token': '@'+user.user_token },
                body: {
                    name: updated_user.updated_user_name,
                    phone: updated_user.updated_user_phone,
                    company: updated_user.updated_user_company
                },
                failOnStatusCode: false,
            }).then(response => {
                expect(response.body.message).to.eq("Access token is not valid or has expired, you will need to login")
                expect(response.status).to.eq(401) 
                cy.log(JSON.stringify(response.body.message))  
            })
        })
        cy.deleteUserViaApi(randomNumber) 
        cy.deleteJsonFile(randomNumber)        
    })

    it('Change a user\'s password via API', { tags: ['API', 'BASIC', 'FULL'] }, () => {
        const randomNumber = faker.finance.creditCardNumber()
        cy.createUserViaApi(randomNumber)
        cy.logInUserViaApi(randomNumber)
        cy.readFile(`cypress/fixtures/testdata-${randomNumber}.json`).then(response => {
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
        cy.deleteUserViaApi(randomNumber) 
        cy.deleteJsonFile(randomNumber)        
    })

    it('Change a user\'s password via API - Bad Request', { tags: ['API', 'FULL', 'NEGATIVE'] }, () => {
        const randomNumber = faker.finance.creditCardNumber()
        cy.createUserViaApi(randomNumber)
        cy.logInUserViaApi(randomNumber)
        cy.readFile(`cypress/fixtures/testdata-${randomNumber}.json`).then(response => {
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
                    newPassword: '123'
                },
                failOnStatusCode: false,
            }).then(response => {
                expect(user.user_password).to.not.eq(updated_password)  
                expect(response.body.message).to.eq('New password must be between 6 and 30 characters')
                expect(response.status).to.eq(400)
                cy.log(JSON.stringify(response.body.message))
            })
        }) 
        cy.deleteUserViaApi(randomNumber) 
        cy.deleteJsonFile(randomNumber)        
    })

    it('Change a user\'s password via API - Unauthorized Request', { tags: ['API', 'FULL', 'NEGATIVE'] }, () => {
        const randomNumber = faker.finance.creditCardNumber()
        cy.createUserViaApi(randomNumber)
        cy.logInUserViaApi(randomNumber)
        cy.readFile(`cypress/fixtures/testdata-${randomNumber}.json`).then(response => {
            const user = {
                user_password: response.user_password,
                user_token: response.user_token
            }  
            const updated_password = faker.internet.password({ length: 8 })
            cy.api({
                method: 'POST',
                url: baseApiUrl + '/users/change-password',
                form: true,
                headers: { 'X-Auth-Token': '@'+user.user_token },
                body: {
                    currentPassword: user.user_password,
                    newPassword: updated_password
                },
                failOnStatusCode: false,
            }).then(response => {
                expect(user.user_password).to.not.eq(updated_password)  
                expect(response.body.message).to.eq('Access token is not valid or has expired, you will need to login')
                expect(response.status).to.eq(401)
                cy.log(JSON.stringify(response.body.message))
            })
        }) 
        cy.deleteUserViaApi(randomNumber) 
        cy.deleteJsonFile(randomNumber)         
    })

    it('Log out a user via API', { tags: ['API', 'BASIC', 'FULL'] }, () => {
        const randomNumber = faker.finance.creditCardNumber()
        cy.createUserViaApi(randomNumber)
        cy.logInUserViaApi(randomNumber)
        cy.readFile(`cypress/fixtures/testdata-${randomNumber}.json`).then(response => {
            const user_token = response.user_token;
            cy.api({
                method: 'DELETE',
                url: baseApiUrl + '/users/logout',
                //sets to application/x-www-form-urlencoded
                form: true, 
                headers: { 'X-Auth-Token': user_token },
            }).then(response => {
                expect(response.body.message).to.eq("User has been successfully logged out")
                expect(response.status).to.eq(200); 
                cy.log(JSON.stringify(response.body.message))
            })
        })  
        //When login out, token becomes invalid, so there is the need to log in again to delete the user
        cy.logInUserViaApi(randomNumber)
        cy.deleteUserViaApi(randomNumber) 
        cy.deleteJsonFile(randomNumber)       
    })

    it('Log out a user via API - Bad Request', { tags: ['API', 'FULL', 'NEGATIVE'] }, () => {
        const randomNumber = faker.finance.creditCardNumber()
        cy.createUserViaApi(randomNumber)
        cy.logInUserViaApi(randomNumber)
        cy.readFile(`cypress/fixtures/testdata-${randomNumber}.json`).then(response => {
            const user_token = response.user_token;
            cy.api({
                method: 'DELETE',
                url: baseApiUrl + '/users/logout',
                //sets to application/x-www-form-urlencoded
                form: true, 
                headers: { 
                    'X-Auth-Token': user_token,
                    'x-content-format': 'badRequest'
                },
                failOnStatusCode: false,
            }).then(response => {
                expect(response.body.message).to.eq("Invalid X-Content-Format header, Only application/json is supported.")
                expect(response.status).to.eq(400); 
                cy.log(JSON.stringify(response.body.message))
            })
        })  
        //When login out, token becomes invalid, so there is the need to log in again to delete the user
        //Login out was not executed so we can directly delete the user without the need to login again.
        // cy.logInUserViaApi()
        cy.deleteUserViaApi(randomNumber) 
        cy.deleteJsonFile(randomNumber)      
    })

    it('Log out a user via API - Unauthorized Request', { tags: ['API', 'FULL', 'NEGATIVE'] }, () => {
        const randomNumber = faker.finance.creditCardNumber()
        cy.createUserViaApi(randomNumber)
        cy.logInUserViaApi(randomNumber)
        cy.readFile(`cypress/fixtures/testdata-${randomNumber}.json`).then(response => {
            const user_token = response.user_token;
            cy.api({
                method: 'DELETE',
                url: baseApiUrl + '/users/logout',
                //sets to application/x-www-form-urlencoded
                form: true, 
                headers: { 'X-Auth-Token': '@'+user_token },
                failOnStatusCode: false,
            }).then(response => {
                expect(response.body.message).to.eq("Access token is not valid or has expired, you will need to login")
                expect(response.status).to.eq(401); 
                cy.log(JSON.stringify(response.body.message))
            })
        })  
        //When login out, token becomes invalid, so there is the need to log in again to delete the user
        //Login out was not executed so we can directly delete the user without the need to login again.
        // cy.logInUserViaApi()
        cy.deleteUserViaApi(randomNumber) 
        cy.deleteJsonFile(randomNumber)      
    })

    it('Delete user account via API', { tags: ['API', 'BASIC', 'FULL'] }, () => {
        const randomNumber = faker.finance.creditCardNumber()
        cy.createUserViaApi(randomNumber)
        cy.logInUserViaApi(randomNumber)
        cy.readFile(`cypress/fixtures/testdata-${randomNumber}.json`).then(response => {
            const user_token = response.user_token;
            cy.api({
                method: 'DELETE',
                url: baseApiUrl + '/users/delete-account',
                form: true, 
                headers: { 'X-Auth-Token': user_token },
            }).then(response => {
                expect(response.body.message).to.eq("Account successfully deleted")
                expect(response.status).to.eq(200)   
                cy.log(JSON.stringify(response.body.message))             
            })
        }) 
        cy.deleteJsonFile(randomNumber)        
    })

    it('Delete user account via API - Bad Request', { tags: ['API', 'FULL', 'NEGATIVE'] }, () => {
        const randomNumber = faker.finance.creditCardNumber()
        cy.createUserViaApi(randomNumber)
        cy.logInUserViaApi(randomNumber)
        cy.readFile(`cypress/fixtures/testdata-${randomNumber}.json`).then(response => {
            const user_token = response.user_token;
            cy.api({
                method: 'DELETE',
                url: baseApiUrl + '/users/delete-account',
                form: true, 
                headers: { 
                    'X-Auth-Token': user_token,
                    'x-content-format': 'badRequest'
                },
                failOnStatusCode: false,
            }).then(response => {
                expect(response.body.message).to.eq("Invalid X-Content-Format header, Only application/json is supported.")
                expect(response.status).to.eq(400); 
                cy.log(JSON.stringify(response.body.message))
            })
        }) 
        //call deleteUserViaApi() to delete the user after verify the unauthorized condition above
        cy.deleteUserViaApi(randomNumber) 
        cy.deleteJsonFile(randomNumber)        
    })

    it('Delete user account via API - Unauthorized Request', { tags: ['API', 'FULL', 'NEGATIVE'] }, () => {
        const randomNumber = faker.finance.creditCardNumber()
        cy.createUserViaApi(randomNumber)
        cy.logInUserViaApi(randomNumber)
        cy.readFile(`cypress/fixtures/testdata-${randomNumber}.json`).then(response => {
            const user_token = response.user_token;
            cy.api({
                method: 'DELETE',
                url: baseApiUrl + '/users/delete-account',
                form: true, 
                headers: { 'X-Auth-Token': '@'+user_token },
                failOnStatusCode: false,
            }).then(response => {
                expect(response.body.message).to.eq("Access token is not valid or has expired, you will need to login")
                expect(response.status).to.eq(401); 
                cy.log(JSON.stringify(response.body.message))             
            })
        }) 
        //call deleteUserViaApi() to delete the user after verify the unauthorized condition above
        cy.deleteUserViaApi(randomNumber) 
        cy.deleteJsonFile(randomNumber)        
    })
})


