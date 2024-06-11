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

    it('Get all notes via UI', () => {
        //make a new one to delete it by id, maybe using note url
        cy.createUserViaUi()
        cy.logInUserViaUi()
        cy.readFile('cypress/fixtures/ui.json').then(response => {
            const user = {   
                user_id: response.user_id,             
                user_email: response.user_email,
                user_name: response.user_name,
                user_password: response.user_password
            }
            Cypress._.times(4, (k) => {
                cy.visit(baseAppUrl)
                cy.contains('button', '+ Add Note').click()
                cy.get('input[name="title"]').click().type(arrayTitle[k])
                cy.get('textarea[name="description"]').click().type(arrayDescription[k])
                cy.get('[name="category"]').should('be.visible').select(arrayCategory[k])  
                cy.contains('button', 'Create').click()
            })
            cy.get(':nth-child(5) > [data-testid="note-card"] > .card-footer > [data-testid="toggle-note-switch"]').check()
            //DECOBRIR COMO USAR UM IF PRA ULTIMA NOTA PRA PODER COLOCAR ESSE GET DENTRO DO LOOP E FAZER O MESMO COM API
            const arrayIndex = [2, 3, 4, 5]
            const arrayCompleted = ['not.be.checked', 'not.be.checked', 'not.be.checked', 'be.checked'] 
            const arrayColor = ['rgb(50, 140, 160)', 'rgb(92, 107, 192)', 'rgb(255, 145, 0)', 'rgba(40, 46, 41, 0.6)'] 
            Cypress._.times(4, (k) => {
                cy.get(':nth-child('+arrayIndex[k]+') > [data-testid="note-card"] > [data-testid="note-card-title"]').should('have.text', arrayTitle[3-k]).should('be.visible')
                cy.get(':nth-child('+arrayIndex[k]+') > [data-testid="note-card"] > .card-body > [data-testid="note-card-updated-at"]').invoke('text').as('note_updated')
                cy.get('@note_updated').then((note_updated) => {
                    cy.get(':nth-child('+arrayIndex[k]+') > [data-testid="note-card"] > .card-body').should('have.text', arrayDescription[3-k]+note_updated).should('be.visible')
                })
                cy.get(':nth-child('+arrayIndex[k]+') > [data-testid="note-card"] > .card-footer > [data-testid="toggle-note-switch"]').should(arrayCompleted[k])
                cy.get(':nth-child('+arrayIndex[k]+') > [data-testid="note-card"] > [data-testid="note-card-title"]').should('have.css', 'background-color', arrayColor[k])
            })
    
            //only note information that needs to be written is the note id so we can use it for api commands to speed up test, 
            //and even so we can delete the user instead to speed even more, lets see...
    
            cy.writeFile('cypress/fixtures/ui.json', {
                "user_id": user.user_id,
                "user_email": user.user_email,
                "user_name": user.user_name,
                "user_password": user.user_password,
                "note_title_1": arrayTitle[0],
                "note_description_1": arrayDescription[0],
                "note_category_1": arrayCategory[0],
                "note_completed_1": arrayCompleted[3],
                "note_title_2": arrayTitle[1],
                "note_description_2": arrayDescription[1],
                "note_category_2": arrayCategory[1],
                "note_completed_2": arrayCompleted[2],  
                "note_title_3": arrayTitle[2],
                "note_description_3": arrayDescription[2],
                "note_category_3": arrayCategory[2],
                "note_completed_3": arrayCompleted[1],  
                "note_title_4": arrayTitle[3],
                "note_description_4": arrayDescription[3],
                "note_category_4": arrayCategory[3],
                "note_completed_4": arrayCompleted[0]                 
            })         
        })


        // for functions must be created to make im simple
// verification code should be here
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