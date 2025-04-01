import { faker } from '@faker-js/faker'

describe('/notes_web', () => {

    const baseAppUrl = Cypress.env('baseAppUrl')
    
    beforeEach(function () {
        cy.visit(baseAppUrl)  
    }); 

    it('Create a new note via WEB', { tags: ['WEB', 'BASIC', 'FULL'] }, () => {
        const randomNumber = faker.finance.creditCardNumber() 
        cy.createUserViaWeb(randomNumber)
        cy.logInUserViaWeb(randomNumber)
        //no need to read this for now but I'll let it here so later I can use it for using API requests in WEB tests. Same for writing.
        cy.readFile(`cypress/fixtures/testdata-${randomNumber}.json`).then(response => {
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
            cy.get('[data-testid="note-card-description"]').contains(note.description).should('be.visible')
            cy.get('[data-testid="toggle-note-switch"]').should('be.checked')
            cy.get('[data-testid="note-view"]').contains('View').should('be.visible').click()
            cy.get('[data-testid="note-card-title"]').contains(note.title).should('be.visible')
            cy.get('[data-testid="note-card-description"]').contains(note.description).should('be.visible')
            cy.get('[data-testid="toggle-note-switch"]').should('be.checked')
            // Wait until we're on an note page.
            cy.location('pathname').should('match', /^\/notes\/.*$/);
            // Extract the note ID from the URL and alias it.
            cy.location('pathname').then(path => {
                // path = "/notes/api/notes/xxxxxxxxxxxxxxxxxxxxxxxxxx".
                const note_id = path.split('/')[4];
                cy.wrap(note_id).as('note_id');
                cy.log(note_id)
                cy.writeFile(`cypress/fixtures/testdata-${randomNumber}.json`, {
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
        cy.deleteNoteViaWeb(randomNumber)
        cy.deleteUserViaWeb(randomNumber)
        cy.deleteJsonFile(randomNumber)                   

    })

    it('Create a new note via WEB - Invalid title', { tags: ['WEB', 'FULL', 'NEGATIVE'] }, () => {
        const randomNumber = faker.finance.creditCardNumber() 
        cy.createUserViaWeb(randomNumber)
        cy.logInUserViaWeb(randomNumber)
        //no need to read this for now but I'll let it here so later I can use it for using API requests in WEB tests. Same for writing.
        cy.readFile(`cypress/fixtures/testdata-${randomNumber}.json`).then(response => {
            const note = {            
                description: faker.word.words(5),
                category: faker.helpers.arrayElement(['Home', 'Work', 'Personal']),
                completed: faker.number.int({ min: 1, max: 2 })
            }
            cy.visit(baseAppUrl)
            cy.contains('button', '+ Add Note').click()
            cy.get('[name="category"]').should('be.visible').select(note.category)        
            cy.get('[data-testid="note-completed"]').click(note.completed) 
            cy.get('input[name="title"]').click().type('e')
            cy.get('textarea[name="description"]').click().type(note.description)
            cy.contains('button', 'Create').click()
            cy.get(':nth-child(3) > .invalid-feedback').contains('Title should be between 4 and 100 characters').should('be.visible')
        })   
        cy.deleteUserViaWeb(randomNumber)
        cy.deleteJsonFile(randomNumber) 
    })

    it('Create a new note via WEB - Invalid description', { tags: ['WEB', 'FULL', 'NEGATIVE'] }, () => {
        const randomNumber = faker.finance.creditCardNumber() 
        cy.createUserViaWeb(randomNumber)
        cy.logInUserViaWeb(randomNumber)
        //no need to read this for now but I'll let it here so later I can use it for using API requests in WEB tests. Same for writing.
        cy.readFile(`cypress/fixtures/testdata-${randomNumber}.json`).then(response => {
            const note = {            
                title: faker.word.words(3),
                category: faker.helpers.arrayElement(['Home', 'Work', 'Personal']),
                completed: faker.number.int({ min: 1, max: 2 })
            }
            cy.visit(baseAppUrl)
            cy.contains('button', '+ Add Note').click()
            cy.get('[name="category"]').should('be.visible').select(note.category)        
            cy.get('[data-testid="note-completed"]').click(note.completed) 
            cy.get('input[name="title"]').click().type(note.title)
            cy.get('textarea[name="description"]').click().type('e')
            cy.contains('button', 'Create').click()
            cy.get(':nth-child(4) > .invalid-feedback').contains('Description should be between 4 and 1000 characters').should('be.visible')
        })   
        cy.deleteUserViaWeb(randomNumber)
        cy.deleteJsonFile(randomNumber) 
    })

    it('Get all notes via WEB', { tags: ['WEB', 'BASIC', 'FULL'] }, () => {
        const randomNumber = faker.finance.creditCardNumber() 
        cy.createUserViaWeb(randomNumber)
        cy.logInUserViaWeb(randomNumber)
        cy.readFile(`cypress/fixtures/testdata-${randomNumber}.json`).then(response => {
            const user = {   
                user_id: response.user_id,             
                user_email: response.user_email,
                user_name: response.user_name,
                user_password: response.user_password
            }
            const arrayTitle = [faker.word.words(3), faker.word.words(3), faker.word.words(3), faker.word.words(3)]
            const arrayDescription = [faker.word.words(5), faker.word.words(5), faker.word.words(5), faker.word.words(5)] 
            const arrayCategory = [faker.helpers.arrayElement(['Home', 'Work', 'Personal']), 'Home', 'Work', 'Personal'] 
            Cypress._.times(4, (k) => {
                cy.visit(baseAppUrl)
                cy.contains('button', '+ Add Note').click()
                cy.get('input[name="title"]').click().type(arrayTitle[k])
                cy.get('textarea[name="description"]').click().type(arrayDescription[k])
                cy.get('[name="category"]').should('be.visible').select(arrayCategory[k])  
                cy.contains('button', 'Create').click()
            })
            cy.get(':nth-child(5) > [data-testid="note-card"] > .card-footer > [data-testid="toggle-note-switch"]').check()
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
            cy.writeFile(`cypress/fixtures/testdata-${randomNumber}.json`, {
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
        cy.visit(baseAppUrl)
        cy.contains('button', 'All').click()
        cy.get('[data-testid="progress-info"]').contains('You have 1/4 notes completed in the all categories').should('be.visible') 
        //reverse order so we will have all frames in the screen until end of test.       
        Cypress._.times(4, (k) => {
            const arrayIndex = [5, 4, 3, 2]
            cy.get(':nth-child('+arrayIndex[k]+') > [data-testid="note-card"] > .card-footer > div > [data-testid="note-delete"]').click()        
            cy.get('[data-testid="note-delete-confirm"]').contains('Delete').click()
        })  
        cy.deleteUserViaWeb(randomNumber)
        cy.deleteJsonFile(randomNumber)
    })

    it('Update an existing note via WEB', { tags: ['WEB', 'BASIC', 'FULL'] }, () => {
        const randomNumber = faker.finance.creditCardNumber() 
        cy.createUserViaWeb(randomNumber)
        cy.logInUserViaWeb(randomNumber)
        cy.createNoteViaWeb(randomNumber)
        cy.contains('button', 'Edit').click()
        const note = {            
            title: faker.word.words(3),
            description: faker.word.words(5),
            category: faker.helpers.arrayElement(['Home', 'Work', 'Personal']),
            completed: faker.number.int({ min: 1, max: 2 })
        }
        cy.get('[name="category"]').should('be.visible').select(note.category)      
        cy.get('[data-testid="note-completed"]').click(note.completed) 
        cy.get('input[name="title"]').click().type(note.title)
        cy.get('textarea[name="description"]').click().type(note.description)
        cy.contains('button', 'Save').click()
        cy.get('[data-testid="note-card-title"]').contains(note.title).should('be.visible')
        cy.get('[data-testid="note-card-description"]').contains(note.description).should('be.visible')
        cy.deleteNoteViaWeb(randomNumber)
        cy.deleteUserViaWeb(randomNumber)
        cy.deleteJsonFile(randomNumber)
    })

    it('Update an existing note via WEB - Invalid title', { tags: ['WEB', 'FULL', 'NEGATIVE'] }, () => {
        const randomNumber = faker.finance.creditCardNumber() 
        cy.createUserViaWeb(randomNumber)
        cy.logInUserViaWeb(randomNumber)
        cy.createNoteViaWeb(randomNumber)
        cy.contains('button', 'Edit').click()
        const note = {            
            category: faker.helpers.arrayElement(['Home', 'Work', 'Personal']),
            completed: faker.number.int({ min: 1, max: 2 })
        }
        cy.get('[name="category"]').should('be.visible').select(note.category)      
        cy.get('[data-testid="note-completed"]').click(note.completed) 
        //clear the field and type 'e' so title will be short and by so, invalid.
        cy.get('input[name="title"]').clear().type('e')
        cy.contains('button', 'Save').click()
        cy.get(':nth-child(3) > .invalid-feedback').contains('Title should be between 4 and 100 characters').should('be.visible')
        cy.deleteUserViaWeb(randomNumber)
        cy.deleteJsonFile(randomNumber)
    })

    it('Update an existing note via WEB - Invalid description', { tags: ['WEB', 'FULL', 'NEGATIVE'] }, () => {
        const randomNumber = faker.finance.creditCardNumber() 
        cy.createUserViaWeb(randomNumber)
        cy.logInUserViaWeb(randomNumber)
        cy.createNoteViaWeb(randomNumber)
        cy.contains('button', 'Edit').click()
        const note = {            
            category: faker.helpers.arrayElement(['Home', 'Work', 'Personal']),
            completed: faker.number.int({ min: 1, max: 2 })
        }
        cy.get('[name="category"]').should('be.visible').select(note.category)      
        cy.get('[data-testid="note-completed"]').click(note.completed)
        cy.get('textarea[name="description"]').clear().type('e')
        cy.contains('button', 'Save').click()
        cy.get(':nth-child(4) > .invalid-feedback').contains('Description should be between 4 and 1000 characters').should('be.visible')
        cy.deleteUserViaWeb(randomNumber)
        cy.deleteJsonFile(randomNumber)
    })    

    it('Update the completed status of a note via WEB', { tags: ['WEB', 'BASIC', 'FULL'] }, () => {
        const randomNumber = faker.finance.creditCardNumber() 
        cy.createUserViaWeb(randomNumber)
        cy.logInUserViaWeb(randomNumber)
        cy.createNoteViaWeb(randomNumber)
        cy.contains('button', 'Edit').click()      
        cy.get('[data-testid="note-completed"]').click() 
        cy.contains('button', 'Save').click()
        cy.get('[data-testid="toggle-note-switch"]').should('not.be.checked')
        cy.deleteNoteViaWeb(randomNumber)
        cy.deleteUserViaWeb(randomNumber)
        cy.deleteJsonFile(randomNumber)
    })
    
    it('Delete a note via WEB', { tags: ['WEB', 'BASIC', 'FULL'] }, () => {
        const randomNumber = faker.finance.creditCardNumber() 
        cy.createUserViaWeb(randomNumber)
        cy.logInUserViaWeb(randomNumber)
        cy.createNoteViaWeb(randomNumber)
        cy.contains('button', 'Delete').click()
        cy.readFile(`cypress/fixtures/testdata-${randomNumber}.json`).then(response => {
            const note = {
                note_title: response.note_title
            }          
            cy.get('[class="modal-content"]').contains(note.note_title).click()
            cy.get('[data-testid="note-delete-confirm"]').contains('Delete').click()
        })
        cy.deleteUserViaWeb(randomNumber)
        cy.deleteJsonFile(randomNumber)
    })
})

