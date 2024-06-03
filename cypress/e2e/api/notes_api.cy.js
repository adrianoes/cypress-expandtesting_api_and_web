import { faker } from '@faker-js/faker'

describe('/notes_api', () => {

    const baseApiUrl = `${Cypress.env('baseApiUrl')}`

    beforeEach(function () {
        cy.createUserViaApi()
        cy.logInUserViaApi() 
    });

    afterEach(function () {        
        cy.deleteUserViaApi()
        cy.writeFile('cypress/fixtures/api.json', '')
    });

    it('Creates a new note via API', () => {
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
                cy.writeFile('cypress/fixtures/api.json', {
                    "note_id": response.body.data.id,
                    "user_token": user_token
                })                
            })            
        })     
        cy.deleteNoteViaApi()           
    })

    it('Get all notes via API', () => {
        cy.createNoteViaApi() 
        cy.createSecondNoteViaApi() 
        cy.readFile('cypress/fixtures/api.json').then(response => {
            const note = {
                note_id: response.note_id,
                note_title: response.note_title,
                note_description: response.note_description,
                note_category: response.note_category
            }
            const second_note = {
                second_note_id: response.second_note_id,
                second_note_title: response.second_note_title,
                second_note_description: response.second_note_description,
                second_note_category: response.second_note_category
            }
            const user_id = response.user_id;
            const user_token = response.user_token;
            cy.api({
                method: 'GET',
                url: baseApiUrl + '/notes',
                form: true,
                headers: { 'X-Auth-Token': user_token },
            }).then(response => {
                expect(response.status).to.eq(200); 
                expect(response.body.message).to.eq("Notes successfully retrieved")
                expect(response.body.data[1].id).to.eq(note.note_id)
                expect(response.body.data[1].title).to.eq(note.note_title)
                expect(response.body.data[1].description).to.eq(note.note_description)
                expect(response.body.data[1].category).to.eq(note.note_category)
                expect(response.body.data[1].user_id).to.eq(user_id)
                expect(response.body.data[0].id).to.eq(second_note.second_note_id)
                expect(response.body.data[0].title).to.eq(second_note.second_note_title)
                expect(response.body.data[0].description).to.eq(second_note.second_note_description)
                expect(response.body.data[0].category).to.eq(second_note.second_note_category)
                expect(response.body.data[0].user_id).to.eq(user_id)
            })
        })  
        cy.deleteSecondNoteViaApi()
        cy.deleteNoteViaApi()         
    })

    it('Get note by ID via API', () => {
        cy.createNoteViaApi() 
        cy.readFile('cypress/fixtures/api.json').then(response => {
            const note = {
                note_id: response.note_id,
                note_title: response.note_title,
                note_description: response.note_description,
                note_category: response.note_category
            }
            const user_id = response.user_id;
            const user_token = response.user_token;
            cy.api({
                method: 'GET',
                url: baseApiUrl + '/notes/' + note.note_id,
                form: true,
                headers: { 'X-Auth-Token': user_token },
            }).then(response => {
                expect(response.status).to.eq(200); 
                expect(response.body.message).to.eq("Note successfully retrieved")
                expect(response.body.data.id).to.eq(note.note_id)
                expect(response.body.data.title).to.eq(note.note_title)
                expect(response.body.data.description).to.eq(note.note_description)
                expect(response.body.data.category).to.eq(note.note_category)
                expect(response.body.data.user_id).to.eq(user_id)
            })
        })  
        cy.deleteNoteViaApi()         
    })

    it('Update an existing note via API', () => {
        cy.createNoteViaApi() 
        cy.readFile('cypress/fixtures/api.json').then(response => {
            const note = {
                note_id: response.note_id,
                note_title: response.note_title,
                note_description: response.note_description,
                note_category: response.note_category
            }
            const user_id = response.user_id;
            const user_token = response.user_token;
            const completed = faker.helpers.arrayElement(['true', 'false'])
            cy.api({
                method: 'PUT',
                url: baseApiUrl + '/notes/' + note.note_id,
                form: true,
                headers: { 'X-Auth-Token': user_token },
                body: {
                    title: faker.word.words(3),
                    description: faker.word.words(5),
                    completed: completed,
                    category: note.note_category
                },
            }).then(response => {
                expect(response.status).to.eq(200); 
                expect(response.body.message).to.eq("Note successfully Updated")
                expect(response.body.data.id).to.eq(note.note_id)
                expect(response.body.data.title).to.not.eq(note.note_title)
                expect(response.body.data.description).to.not.eq(note.note_description)
                expect(response.body.data.completed).to.not.eq(completed)
                expect(response.body.data.user_id).to.eq(user_id)
            })
        })  
        cy.deleteNoteViaApi()        
    })

    it('Update the completed status of a note via API', () => {
        cy.createNoteViaApi() 
        cy.readFile('cypress/fixtures/api.json').then(response => {
            const note = {
                note_id: response.note_id,
                note_title: response.note_title,
                note_description: response.note_description,
                note_category: response.note_category
            }
            const user_id = response.user_id;
            const user_token = response.user_token;
            const completed = true;
            cy.api({
                method: 'PATCH',
                url: baseApiUrl + '/notes/' + note.note_id,
                form: true,
                headers: { 'X-Auth-Token': user_token },
                //here, it must have the completed status hardcoded to be sure that it is updated
                body: {
                    completed: false
                },
            }).then(response => {
                expect(response.status).to.eq(200); 
                expect(response.body.message).to.eq("Note successfully Updated")
                expect(response.body.data.id).to.eq(note.note_id)
                expect(response.body.data.title).to.eq(note.note_title)
                expect(response.body.data.description).to.eq(note.note_description)
                expect(response.body.data.category).to.eq(note.note_category)
                expect(response.body.data.completed).to.not.eq(completed)
                expect(response.body.data.user_id).to.eq(user_id)
            })
        })  
        cy.deleteNoteViaApi()         
    })

    it('Delete a note by ID via API', () => {
        cy.createNoteViaApi() 
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
})