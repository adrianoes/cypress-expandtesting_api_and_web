import { faker } from '@faker-js/faker'

describe('/notes_api', () => {
    it('Creates a new note', () => {
        cy.createUser()
        cy.logInUser() 
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
                url: '/notes',
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
                cy.writeFile('cypress/fixtures/api.json', {
                    "note_id": response.body.data.id,
                    "user_token": user_token
                })                
            })            
        })     
        cy.deleteNote()   
        cy.deleteUser()        
    })

    it('Get all notes', () => {
        cy.createUser()
        cy.logInUser() 
        cy.createNote() 
        cy.createSecondNote() 
        cy.readFile('cypress/fixtures/api.json').then(response => {
            const note_id = response.note_id;
            const note_title = response.note_title;
            const note_description = response.note_description;
            const note_category = response.note_category;
            const user_id = response.user_id;
            const second_note_id = response.second_note_id;
            const second_note_title = response.second_note_title;
            const second_note_description = response.second_note_description;
            const second_note_category = response.second_note_category;
            const user_token = response.user_token;
            cy.api({
                method: 'GET',
                url: '/notes',
                form: true,
                headers: { 'X-Auth-Token': user_token },
            }).then(response => {
                expect(response.status).to.eq(200); 
                expect(response.body.message).to.eq("Notes successfully retrieved")
                expect(response.body.data[1].id).to.eq(note_id)
                expect(response.body.data[1].title).to.eq(note_title)
                expect(response.body.data[1].description).to.eq(note_description)
                expect(response.body.data[1].category).to.eq(note_category)
                expect(response.body.data[1].user_id).to.eq(user_id)
                expect(response.body.data[0].id).to.eq(second_note_id)
                expect(response.body.data[0].title).to.eq(second_note_title)
                expect(response.body.data[0].description).to.eq(second_note_description)
                expect(response.body.data[0].category).to.eq(second_note_category)
                expect(response.body.data[0].user_id).to.eq(user_id)
            })
        })  
        cy.deleteSecondNote()
        cy.deleteNote()   
        cy.deleteUser()         
    })

    // it('Retrieve user profile information', () => {
    //     cy.createUser()
    //     cy.logInUser() 
        
    //     cy.deleteUser()      
    // })

    // it('Update the user profile information', () => {
    //     cy.createUser()
    //     cy.logInUser() 
        
    //     cy.deleteUser()       
    // })

    // it('Send password reset link to user\'s email', () => {
    //     cy.createUser()
    //     cy.logInUser() 
        
    //     cy.deleteUser()        
    // })

    // it('Change a user\'s password', () => {
    //     cy.createUser()
    //     cy.logInUser() 
        
    //     cy.deleteUser()        
    // })

    // it('Log out a user', () => {
    //     cy.createUser()
    //     cy.logInUser() 
        
    //     cy.deleteUser()     
    // })

    // it('Delete user account', () => {
    //     cy.createUser()
    //     cy.logInUser() 
        
    //     cy.deleteUser()         
    // })
})