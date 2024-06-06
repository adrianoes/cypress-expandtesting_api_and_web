import { faker } from '@faker-js/faker'

const baseAppUrl = `${Cypress.env('baseAppUrl')}`

Cypress.Commands.add('logInUserViaUi', () => {
    cy.readFile('cypress/fixtures/ui.json').then(response => {
        const user = {
            user_email: response.user_email,
            user_name: response.user_name,
            user_password: response.user_password
        }        
        cy.visit(baseAppUrl + 'login')
        cy.title().should('eq', 'Notes React Application for Automation Testing Practice')
        cy.get('input[name="email"]').click().type(user.user_email)
        cy.get('input[name="password"]').click().type(user.user_password)
        cy.contains('button', 'Login').click()
        cy.get('input[placeholder="Search notes..."]').should('be.visible')
        cy.visit(baseAppUrl + 'profile')
        //invoke 'text' to invoke text or 'val' to invoke value
        cy.get('input[name="userId"]').invoke('val').as('user_id')
        cy.get('@user_id').then((user_id) => {
          cy.writeFile('cypress/fixtures/ui.json', {
            "user_id": user_id,
            "user_email": user.user_email,
            "user_name": user.user_name,
            "user_password": user.user_password               
            })
        })
    })
})

Cypress.Commands.add('deleteUserViaUi', () =>{
    cy.visit(baseAppUrl + 'profile')
    cy.contains('button', 'Delete Account').click()
    cy.get('[data-testid="note-delete-confirm"]').click()
    cy.get('[data-testid="alert-message"]').contains('Your account has been deleted. You should create a new account to continue.').should('be.visible')
})

Cypress.Commands.add('createUserViaUi', ()=>{
    const user = {
        name: faker.internet.userName(),
        email: faker.internet.exampleEmail(),
        password: faker.internet.password({ length: 8 })
    }
    cy.get('[href="/notes/app/register"]').contains('Create an account').should('be.visible').click()
    cy.get('input[name="email"]').click().type(user.email)
    cy.get('input[name="name"]').click().type(user.name)
    cy.get('input[name="password"]').click().type(user.password)
    cy.get('input[name="confirmPassword"]').click().type(user.password)
    cy.contains('button', 'Register').click()
    //need to grab user_id from the response of the post request in network messages in chrome web browser and write it in ui.json file.
    cy.contains('b', 'User account created successfully').should('be.visible')
    cy.get('[href="/notes/app/login"]').contains('Click here to Log In').should('be.visible').click()
    cy.writeFile('cypress/fixtures/ui.json', {
        "user_email": user.email,
        "user_name": user.name,
        "user_password": user.password
    })
})

Cypress.Commands.add('deleteNoteViaUi', () =>{
    cy.contains('button', 'Delete').click()
    cy.readFile('cypress/fixtures/ui.json').then(response => {
        const note = {
            note_title: response.note_title
        }          
        cy.get('[class="modal-content"]').contains(note.note_title).click()
        cy.get('[data-testid="note-delete-confirm"]').contains('Delete').click()
    })
})

Cypress.Commands.add('createNoteViaUi', ()=>{
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
        cy.get('[name="category"]').should('be.visible').select(note.category)  //verify if faker is working here       
        cy.get('[data-testid="note-completed"]').click(note.completed) 
        cy.get('input[name="title"]').click().type(note.title)
        cy.get('textarea[name="description"]').click().type(note.description)
        cy.contains('button', 'Create').click()
        cy.get('[data-testid="note-card-title"]').contains(note.title).should('be.visible')
        cy.get('[data-testid="note-view"]').contains('View').should('be.visible').click()
        cy.get('[data-testid="note-card-title"]').contains(note.title).should('be.visible')
        cy.writeFile('cypress/fixtures/ui.json', {
            "user_id": user.user_id,
            "user_email": user.user_email,
            "user_name": user.user_name,
            "user_password": user.user_password,
            "note_title": note.title,
            "note_description": note.description,
            "note_category": note.category,
            "note_completed": note.completed               
        })         
    })
})

Cypress.Commands.add('createNotesViaUi', ()=>{
    cy.readFile('cypress/fixtures/ui.json').then(response => {
        const user = {   
            user_id: response.user_id,             
            user_email: response.user_email,
            user_name: response.user_name,
            user_password: response.user_password
        }
        const note = {            
            title_1: faker.word.words(3),
            description_1: faker.word.words(5),
            category_1: 'Home', 
            title_2: faker.word.words(3),
            description_2: faker.word.words(5),
            category_2: 'Work',
            title_3: faker.word.words(3),
            description_3: faker.word.words(5),
            category_3: 'Personal',
            title_4: faker.word.words(3),
            description_4: faker.word.words(5),
            category_4: faker.helpers.arrayElement(['Home', 'Work', 'Personal'])
        }
        cy.visit(baseAppUrl)
        cy.contains('button', '+ Add Note').click()
        cy.get('[name="category"]').should('be.visible').select(note.category_1)  //verify if faker is working here       
        cy.get('input[name="title"]').click().type(note.title_1)
        cy.get('textarea[name="description"]').click().type(note.description_1)
        cy.contains('button', 'Create').click()
        cy.visit(baseAppUrl)
        cy.contains('button', '+ Add Note').click()
        cy.get('[name="category"]').should('be.visible').select(note.category_2)  //verify if faker is working here       
        cy.get('input[name="title"]').click().type(note.title_2)
        cy.get('textarea[name="description"]').click().type(note.description_2)
        cy.contains('button', 'Create').click()
        cy.visit(baseAppUrl)
        cy.contains('button', '+ Add Note').click()
        cy.get('[name="category"]').should('be.visible').select(note.category_3)  //verify if faker is working here       
        cy.get('input[name="title"]').click().type(note.title_3)
        cy.get('textarea[name="description"]').click().type(note.description_3)
        cy.contains('button', 'Create').click()
        cy.visit(baseAppUrl)
        cy.contains('button', '+ Add Note').click()
        cy.get('[name="category"]').should('be.visible').select(note.category_4)  //verify if faker is working here       
        cy.get('[data-testid="note-completed"]').check() 
        cy.get('input[name="title"]').click().type(note.title_4)
        cy.get('textarea[name="description"]').click().type(note.description_4)
        cy.contains('button', 'Create').click()
 
        // create array to use in for()
        cy.get(':nth-child(4) > [data-testid="note-card"] > [data-testid="note-card-title"]').contains(note.title_1).should('be.visible')
        cy.get(':nth-child(4) > [data-testid="note-card"] > .card-body').contains(note.description_1).should('be.visible')
        cy.get(':nth-child(4) > [data-testid="note-card"] > .card-footer > [data-testid="toggle-note-switch"]').should('not.be.checked')
        cy.get(':nth-child(4) > [data-testid="note-card"] > [data-testid="note-card-title"]').should('have.css', 'background-color', 'rgb(255, 145, 0)')

        cy.get(':nth-child(3) > [data-testid="note-card"] > [data-testid="note-card-title"]').contains(note.title_2).should('be.visible')
        cy.get(':nth-child(3) > [data-testid="note-card"] > .card-body').contains(note.description_2).should('be.visible')
        cy.get(':nth-child(3) > [data-testid="note-card"] > .card-footer > [data-testid="toggle-note-switch"]').should('not.be.checked')
        cy.get(':nth-child(3) > [data-testid="note-card"] > [data-testid="note-card-title"]').should('have.css', 'background-color', 'rgb(92, 107, 192)')

        cy.get(':nth-child(2) > [data-testid="note-card"] > [data-testid="note-card-title"]').contains(note.title_3).should('be.visible')
        cy.get(':nth-child(2) > [data-testid="note-card"] > .card-body').contains(note.description_3).should('be.visible')
        cy.get(':nth-child(2) > [data-testid="note-card"] > .card-footer > [data-testid="toggle-note-switch"]').should('not.be.checked')
        cy.get(':nth-child(2) > [data-testid="note-card"] > [data-testid="note-card-title"]').should('have.css', 'background-color', 'rgb(50, 140, 160)')

        cy.get(':nth-child(5) > [data-testid="note-card"] > [data-testid="note-card-title"]').contains(note.title_4).should('be.visible')        
        cy.get(':nth-child(5) > [data-testid="note-card"] > .card-body').contains(note.description_4).should('be.visible')       
        cy.get(':nth-child(5) > [data-testid="note-card"] > .card-footer > [data-testid="toggle-note-switch"]').should('be.checked')
        cy.get(':nth-child(5) > [data-testid="note-card"] > [data-testid="note-card-title"]').should('have.css', 'background-color', 'rgba(40, 46, 41, 0.6)')

        //need to use a for() here, using the index of the selectors as array members like array and index be like: array 0123 index 4325

        cy.writeFile('cypress/fixtures/ui.json', {
            "user_id": user.user_id,
            "user_email": user.user_email,
            "user_name": user.user_name,
            "user_password": user.user_password,
            "note_title_1": note.title_1,
            "note_description_1": note.description_1,
            "note_category_1": note.category_1,
            "note_completed_1": note.completed_1,
            "note_title_2": note.title_2,
            "note_description_2": note.description_2,
            "note_category_2": note.category_2,
            "note_completed_2": note.completed_2,  
            "note_title_3": note.title_3,
            "note_description_3": note.description_3,
            "note_category_3": note.category_3,
            "note_completed_3": note.completed_3,  
            "note_title_4": note.title_4,
            "note_description_4": note.description_4,
            "note_category_4": note.category_4,
            "note_completed_4": note.completed_4                 
        })         
    })
})

Cypress.Commands.add('deleteNotesViaUi', () =>{
    cy.get(':nth-child(5) > [data-testid="note-card"] > .card-footer > div > [data-testid="note-delete"]').click()        
    cy.get('[data-testid="note-delete-confirm"]').contains('Delete').click()
    cy.get(':nth-child(4) > [data-testid="note-card"] > .card-footer > div > [data-testid="note-delete"]').click() 
    cy.get('[data-testid="note-delete-confirm"]').contains('Delete').click()
    cy.get(':nth-child(3) > [data-testid="note-card"] > .card-footer > div > [data-testid="note-delete"]').click()  
    cy.get('[data-testid="note-delete-confirm"]').contains('Delete').click()
    cy.get(':nth-child(2) > [data-testid="note-card"] > .card-footer > div > [data-testid="note-delete"]').click()
    cy.get('[data-testid="note-delete-confirm"]').contains('Delete').click()   
   })



