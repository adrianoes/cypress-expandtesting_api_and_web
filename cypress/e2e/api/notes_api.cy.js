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
                    "note_description": response.body.data.decription,
                    "note_id": response.body.data.id,
                    "note_title": response.body.data.title,
                    "user_token": user.user_token
                })                
            })            
        })       
        //This command will be kept for studying purpose only since there is already a cy.deleteUserViaApi() to delete user right away.
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
                cy.log(JSON.stringify(response.body.message))
            })
        })  
        cy.deleteSecondNoteViaApi()
        cy.deleteNoteViaApi()         
    })

    it('Get note by ID via API', () => {
        cy.createNoteViaApi() 
        cy.readFile('cypress/fixtures/api.json').then(response => {
            const user = {
                user_id: response.user_id,
                user_token: response.user_token
            } 
            const note = {
                note_category: response.note_category,
                note_description: response.note_description,
                note_id: response.note_id,
                note_title: response.note_title
            }
            cy.api({
                method: 'GET',
                url: baseApiUrl + '/notes/' + note.note_id,
                form: true,
                headers: { 'X-Auth-Token': user.user_token },
            }).then(response => {
                expect(response.body.data.category).to.eq(note.note_category)
                expect(response.body.data.description).to.eq(note.note_description)
                expect(response.body.data.id).to.eq(note.note_id)
                expect(response.body.data.title).to.eq(note.note_title)
                expect(response.body.data.user_id).to.eq(user.user_id)  
                expect(response.body.message).to.eq('Note successfully retrieved')
                expect(response.status).to.eq(200)  
                cy.log(JSON.stringify(response.body.message))
            })
        })         
    })

    it('Update an existing note via API', () => {
        cy.createNoteViaApi() 
        cy.readFile('cypress/fixtures/api.json').then(response => {
            const user = {
                user_id: response.user_id,
                user_token: response.user_token
            } 
            const note = {
                note_category: response.note_category,
                note_completed: faker.helpers.arrayElement([true, false]),
                note_description: response.note_description,
                note_id: response.note_id,
                note_title: response.note_title
            }
            cy.log(note.note_title)
            const updated_note = {
                note_description: faker.word.words(5),
                note_title: faker.word.words(3)
            }
            cy.api({
                method: 'PUT',
                url: baseApiUrl + '/notes/' + note.note_id,
                form: true,
                headers: { 'X-Auth-Token': user.user_token },
                body: {
                    category: note.note_category,
                    completed: note.note_completed,
                    description: updated_note.note_description,
                    title: updated_note.note_title                    
                },
            }).then(response => {
                expect(response.body.data.category).to.eq(note.note_category)
                expect(response.body.data.completed).to.eq(note.note_completed)
                expect(response.body.data.description).to.eq(updated_note.note_description)
                expect(response.body.data.description).to.not.eq(note.note_description)
                expect(response.body.data.id).to.eq(note.note_id)  
                expect(response.body.data.title).to.eq(updated_note.note_title)
                expect(response.body.data.title).to.not.eq(note.note_title)
                expect(response.body.data.user_id).to.eq(user.user_id)  
                expect(response.body.message).to.eq("Note successfully Updated")
                expect(response.status).to.eq(200)
                cy.log(JSON.stringify(response.body.message))
            })
        })         
    })

    it('Update the completed status of a note via API', () => {
        cy.createNoteViaApi() 
        cy.readFile('cypress/fixtures/api.json').then(response => {
            const user = {
                user_id: response.user_id,
                user_token: response.user_token
            } 
            const note = {
                note_category: response.note_category,
                note_description: response.note_description,
                note_id: response.note_id,
                note_title: response.note_title
            }
            const updated_note_completed = false
            cy.api({
                method: 'PATCH',
                url: baseApiUrl + '/notes/' + note.note_id,
                form: true,
                headers: { 'X-Auth-Token': user.user_token },
                //here, it must have the completed status hardcoded to be sure that it is updated
                body: {
                    completed: false
                },
            }).then(response => {
                expect(response.body.data.category).to.eq(note.note_category)
                expect(response.body.data.completed).to.eq(updated_note_completed)
                expect(response.body.data.description).to.eq(note.note_description)
                expect(response.body.data.id).to.eq(note.note_id)  
                expect(response.body.data.title).to.eq(note.note_title)
                expect(response.body.data.user_id).to.eq(user.user_id)  
                expect(response.body.message).to.eq("Note successfully Updated")
                expect(response.status).to.eq(200)
                cy.log(JSON.stringify(response.body.message))
            })
        })          
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
                expect(response.body.message).to.eq("Note successfully deleted")
                expect(response.status).to.eq(200); 
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