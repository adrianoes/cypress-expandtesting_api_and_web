import { faker } from '@faker-js/faker'

const baseApiUrl = `${Cypress.env('baseApiUrl')}`

Cypress.Commands.add('logInUser', () => {
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
})

Cypress.Commands.add('deleteUser', () => {
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

Cypress.Commands.add('createUser', () => {
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
})

Cypress.Commands.add('deleteNote', () => {
    cy.readFile('cypress/fixtures/api.json').then(response => {
        const note_id = response.note_id;
        const user_token = response.user_token;
        cy.api({
            method: 'DELETE',
            url: baseApiUrl + '/notes/' + note_id,
            form: true, //sets to application/x-www-form-urlencoded
            headers: { 'X-Auth-Token': user_token },
        }).then(response => {
            expect(response.status).to.eq(200); 
            expect(response.body.message).to.eq("Note successfully deleted")
        })
    })
})

Cypress.Commands.add('createNote', () => {
    cy.readFile('cypress/fixtures/api.json').then(response => {  
        const user_token = response.user_token;
        const user_id = response.user_id;
        const note = {            
            title: faker.word.words(3),
            description: faker.word.words(5),
            category: faker.helpers.arrayElement(['Home', 'Work', 'Personal'])
        }
        cy.api({
            method: 'POST',
            url: baseApiUrl + '/notes',
            form: true,
            headers: { 'X-Auth-Token': user_token },
            body: {
                title: note.title,
                description: note.description,
                category: note.category
            },
        }).then(response => {
            expect(response.status).to.eq(200)
            expect(response.body.message).to.eq('Note successfully created')
            expect(response.body.data.title).to.eq(note.title)
            expect(response.body.data.description).to.eq(note.description)
            expect(response.body.data.category).to.eq(note.category)
            expect(response.body.data.user_id).to.eq(user_id)                
            cy.log(JSON.stringify(response.body.message))
            //some parameters are not needed to be writen for the creteNote command but for comparison in the test to get all notes, so we will write them anyway.
            cy.writeFile('cypress/fixtures/api.json', {
                "note_id": response.body.data.id, 
                "note_title": response.body.data.title,
                "note_description": response.body.data.description,
                "note_category": response.body.data.category,
                "user_id": response.body.data.user_id,
                "user_token": user_token
            })                
        })            
    }) 
})

Cypress.Commands.add('createSecondNote', () => {
    cy.readFile('cypress/fixtures/api.json').then(response => {  
        const user_token = response.user_token;
        const user_id = response.user_id;
        const note = {
            note_id: response.note_id,
            note_title: response.note_title,
            note_description: response.note_description,
            note_category: response.note_category,
        }
        const second_note = {            
            second_title: faker.word.words(4),
            second_description: faker.word.words(5),
            second_category: faker.helpers.arrayElement(['Home', 'Work', 'Personal'])
        }
        cy.api({
            method: 'POST',
            url: baseApiUrl + '/notes',
            form: true,
            headers: { 'X-Auth-Token': user_token },
            body: {
                title: second_note.second_title,
                description: second_note.second_description,
                category: second_note.second_category
            },
        }).then(response => {
            expect(response.status).to.eq(200)
            expect(response.body.message).to.eq('Note successfully created')
            expect(response.body.data.title).to.eq(second_note.second_title)
            expect(response.body.data.description).to.eq(second_note.second_description)
            expect(response.body.data.category).to.eq(second_note.second_category)
            expect(response.body.data.user_id).to.eq(user_id)                
            cy.log(JSON.stringify(response.body.message))
            cy.writeFile('cypress/fixtures/api.json', {
                "second_note_id": response.body.data.id,
                "second_note_title": response.body.data.title,
                "second_note_description": response.body.data.description,
                "second_note_category": response.body.data.category,
                "user_id": user_id,
                "note_id": note.note_id,
                "note_title": note.note_title,
                "note_description": note.note_description,
                "note_category": note.note_category,
                "user_token": user_token
            })                
        })            
    }) 
})

Cypress.Commands.add('deleteSecondNote', () => {
    cy.readFile('cypress/fixtures/api.json').then(response => {
        const second_note_id = response.second_note_id;
        const user_token = response.user_token;
        cy.api({
            method: 'DELETE',
            url: baseApiUrl + '/notes/' + second_note_id,
            form: true, //sets to application/x-www-form-urlencoded
            headers: { 'X-Auth-Token': user_token },
        }).then(response => {
            expect(response.status).to.eq(200); 
            expect(response.body.message).to.eq("Note successfully deleted")
        })
    })
})




