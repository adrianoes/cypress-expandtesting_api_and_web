import { faker } from '@faker-js/faker'

const baseAppUrl = `${Cypress.env('baseAppUrl')}`

Cypress.Commands.add('logInUserViaUi', () => {
    cy.readFile('cypress/fixtures/ui.json').then(response => {
        const user = {
            user_id: response.user_id,
            user_email: response.user_email,
            user_name: response.user_name,
            user_password: response.user_password
        }        
        cy.visit(baseAppUrl + 'login')
        cy.title().should('eq', 'Notes React Application for Automation Testing Practice')
        cy.get('input[name="email"]').click().type(user.user_email)
        cy.get('input[name="password"]').click().type(user.user_password)
        cy.intercept('/notes/api/users/login').as('loginFormAndToken')
        cy.contains('button', 'Login').click()
        cy.get('input[placeholder="Search notes..."]').should('be.visible')
        cy.wait('@loginFormAndToken').then(({response}) => {
            expect(response.statusCode).to.eq(200)
            expect(response.body.message).to.eq('Login successful')
            cy.writeFile('cypress/fixtures/ui.json', {
                "user_id": user.user_id,
                "user_email": user.user_email,
                "user_name": user.user_name,
                "user_password": user.user_password,
                "user_token": response.body.data.token
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
    //miss organize code blocks, code hooks an api commands
    cy.intercept('/notes/api/users/register').as('loginForm')
    cy.contains('button', 'Register').click()
    cy.contains('b', 'User account created successfully').should('be.visible')
    cy.get('[href="/notes/app/login"]').contains('Click here to Log In').should('be.visible').click() 
    cy.wait('@loginForm').then(({response}) => {
        expect(response.statusCode).to.eq(201)
        expect(response.body.message).to.eq('User account created successfully')
        cy.writeFile('cypress/fixtures/ui.json', {
            "user_email": user.email,
            "user_name": user.name,
            "user_password": user.password,
            "user_id": response.body.data.id// grab id user from nw response to use in api requests to speed some parts of ui tests
        })
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
       
        
        const arrayTitle = [faker.word.words(3), faker.word.words(3), faker.word.words(3), faker.word.words(3)]// 2 3 4 5
        const arrayDescription = [faker.word.words(5), faker.word.words(5), faker.word.words(5), faker.word.words(5)] 
        const arrayCategory = [faker.helpers.arrayElement(['Home', 'Work', 'Personal']), 'Home', 'Work', 'Personal', ]           
            
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
})

Cypress.Commands.add('deleteNotesViaUi', () =>{
    Cypress._.times(4, (k) => {
        const arrayIndex = [5, 4, 3, 2]//reverse order so we will have all frames in the screen until end of test
        cy.get(':nth-child('+arrayIndex[k]+') > [data-testid="note-card"] > .card-footer > div > [data-testid="note-delete"]').click()        
        cy.get('[data-testid="note-delete-confirm"]').contains('Delete').click()
    })   
})



//check what needs to be read/written in order to improve speed in api custom commands for ui tests
