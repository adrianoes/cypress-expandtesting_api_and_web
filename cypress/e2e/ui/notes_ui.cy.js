import { faker } from '@faker-js/faker'

describe('/notes_ui', () => {

    const baseAppUrl = `${Cypress.env('baseAppUrl')}`
    
    beforeEach(function () {
        cy.visit(baseAppUrl)  
    });

    it('Create a new note via UI', () => {
        cy.createUserViaUi()
        cy.logInUserViaUi()
        //no need to read this for now but I'll let it here so later I can use it for using API requests in UI tests. Same for writing
        cy.readFile('cypress/fixtures/ui.json').then(response => {
            const user = {   
                user_id: response.user_id,             
                user_email: response.user_email,
                user_name: response.user_name,
                user_password: response.user_password
            }
            const note = {            
                title: faker.word.words(3),
                description: faker.word.words(5),
                category: faker.helpers.arrayElement(['Home', 'Work', 'Personal']),
                completed: faker.number.int({ min: 1, max: 2 })
            }
            cy.visit(baseAppUrl)
            cy.contains('button', '+ Add Note').click()
            cy.get('[name="category"]').should('be.visible').select(note.category)        
            cy.get('[data-testid="note-completed"]').click(note.completed) 
            cy.get('input[name="title"]').click().type(note.title)
            cy.get('textarea[name="description"]').click().type(note.description)
            cy.contains('button', 'Create').click()
            cy.get('[data-testid="note-card-title"]').contains(note.title).should('be.visible')
            cy.get('[data-testid="note-view"]').contains('View').should('be.visible').click()
            cy.get('[data-testid="note-card-title"]').contains(note.title).should('be.visible')

              // Wait until we're on an note page
            cy.location('pathname').should('match', /^\/notes\/.*$/);
              // Extract the user ID from the URL and alias it
            cy.location('pathname').then(path => {
                // path = "/notes/api/notes/xxxxxxxxxxxxxxxxxxxxxxxxxx"
                const note_id = path.split('/')[4];
                cy.wrap(note_id).as('note_id');
                cy.log(note_id)
                cy.writeFile('cypress/fixtures/ui.json', {
                    "user_id": user.user_id,
                    "user_email": user.user_email,
                    "user_name": user.user_name,
                    "user_password": user.user_password,
                    "note_id": note_id,
                    "note_title": note.title,
                    "note_description": note.description,
                    "note_category": note.category,
                    "note_completed": note.completed               
                })  
            })     
        })
        cy.deleteNoteViaUi()
        //try to catch the note id form the url to use api request to delete note
        //verify the accordance of this test to the create note command
        //adapt api requests
        //define selector constants
        //create for functions with their arrays
        //grab user id in network messages
        cy.deleteUserViaUi()
    })

    it.only('Get all notes via UI', () => {
        //make a new one to delete it by id, maybe using note url
        cy.createUserViaUi()
        cy.logInUserViaUi()
        cy.createNotesViaUi()


        // for functions must be created to make im simple

        cy.visit(baseAppUrl)
        cy.contains('button', 'All').click()
        cy.get('[data-testid="progress-info"]').contains('You have 1/4 notes completed in the all categories').should('be.visible')// need to make this message dinamical, not hardcoded
        
        cy.deleteNotesViaUi()
        cy.deleteUserViaUi()
    })

    it('Update an existing note via UI', () => {
        //make a new one to delete it by id, maybe using note url
        cy.createUserViaUi()
        cy.logInUserViaUi()
        cy.createNoteViaUi()
        cy.contains('button', 'Edit').click()
        const note = {            
            title: faker.word.words(3),
            description: faker.word.words(5),
            category: faker.helpers.arrayElement(['Home', 'Work', 'Personal']),
            completed: faker.number.int({ min: 1, max: 2 })//find a way to validate completed status
        }
        cy.get('[name="category"]').should('be.visible').select(note.category)  //verify if faker is working here       
        cy.get('[data-testid="note-completed"]').click(note.completed) 
        cy.get('input[name="title"]').click().type(note.title)
        cy.get('textarea[name="description"]').click().type(note.description)
        cy.contains('button', 'Save').click()
        cy.get('[data-testid="note-card-title"]').contains(note.title).should('be.visible')
        cy.get('[data-testid="note-card"]').contains(note.title).should('be.visible')
        cy.get('[data-testid="note-card"]').contains(note.description).should('be.visible')
        // cy.get('[data-testid="note-card"]').contains(note.category).should('be.visible') //I think this is validated by the note header color. must check later
        cy.deleteNoteViaUi()
        cy.deleteUserViaUi()
    })

    it('Update the completed status of a note via UI', () => {
        //make a new one to delete it by id, maybe using note url
        cy.createUserViaUi()
        cy.logInUserViaUi()
        cy.createNoteViaUi()
        cy.contains('button', 'Edit').click() //verify if faker is working here       
        cy.get('[data-testid="note-completed"]').click() 
        cy.contains('button', 'Save').click()
        cy.deleteNoteViaUi()
        cy.deleteUserViaUi()
    })
    it('Delete a note via UI', () => {
        //make a new one to delete it by id, maybe using note url
        cy.createUserViaUi()
        cy.logInUserViaUi()
        cy.createNoteViaUi()
        cy.contains('button', 'Delete').click()
        cy.readFile('cypress/fixtures/ui.json').then(response => {
            const note = {
                note_title: response.note_title
            }          
            cy.get('[class="modal-content"]').contains(note.note_title).click()
            cy.get('[data-testid="note-delete-confirm"]').contains('Delete').click()
        })
        //try to catch the note id form the url to use api request to delete note
        cy.deleteUserViaUi()
    })
})

