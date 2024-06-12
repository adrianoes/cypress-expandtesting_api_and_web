import { faker } from '@faker-js/faker'

const baseApiUrl = Cypress.env('baseApiUrl')

Cypress.Commands.add('logInUserViaApi', () => {
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
})

Cypress.Commands.add('deleteUserViaApi', () => {
    cy.readFile('cypress/fixtures/api.json').then(response => {
        const user_token = response.user_token;
        cy.api({
            method: 'DELETE',
            url: baseApiUrl + '/users/delete-account',
            form: true, 
            headers: { 'X-Auth-Token': user_token },
        }).then(response => {
            expect(response.body.message).to.eq("Account successfully deleted")
            expect(response.status).to.eq(200)            
        })
    })
})

Cypress.Commands.add('createUserViaApi', () => {
    const user = {            
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
})

Cypress.Commands.add('deleteNoteViaApi', () => {
    cy.readFile('cypress/fixtures/api.json').then(response => {
        const note_id = response.note_id;
        const user_token = response.user_token;
        cy.api({
            method: 'DELETE',
            url: baseApiUrl + '/notes/' + note_id,
            form: true, 
            headers: { 'X-Auth-Token': user_token },
        }).then(response => {
            expect(response.status).to.eq(200); 
            expect(response.body.message).to.eq("Note successfully deleted")
        })
    })
})

Cypress.Commands.add('createNoteViaApi', () => {
    cy.readFile('cypress/fixtures/api.json').then(response => { 
        const user = {
            user_id: response.user_id,
            user_token: response.user_token
        } 
        const note = {            
            note_title: faker.word.words(3),
            note_description: faker.word.words(5),
            note_category: faker.helpers.arrayElement(['Home', 'Work', 'Personal'])
        }
        cy.api({
            method: 'POST',
            url: baseApiUrl + '/notes',
            form: true,
            headers: { 'X-Auth-Token': user.user_token },
            body: {
                category: note.note_category,
                description: note.note_description,
                title: note.note_title                   
            },
        }).then(response => {
            expect(response.body.data.category).to.eq(note.note_category)
            expect(response.body.data.description).to.eq(note.note_description)
            expect(response.body.data.title).to.eq(note.note_title)
            expect(response.body.data.user_id).to.eq(user.user_id)  
            expect(response.body.message).to.eq('Note successfully created')
            expect(response.status).to.eq(200)                
            cy.log(JSON.stringify(response.body.message))
            cy.writeFile('cypress/fixtures/api.json', {
                "note_category": response.body.data.category,
                "note_description": response.body.data.description,
                "note_id": response.body.data.id,
                "note_title": response.body.data.title,
                "user_id": user.user_id,
                "user_token": user.user_token
            })                
        })            
    })        
})






