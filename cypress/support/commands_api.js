import { faker } from '@faker-js/faker'

Cypress.Commands.add('logInUser', () => {
    cy.readFile('cypress/fixtures/api.json').then(response => {
        const user_id = response.user_id
        const user_name = response.user_name
        const user_email = response.user_email
        const user_password = response.user_password
        cy.api({
            method: 'POST',
            url: '/users/login',
            body: {
                email: user_email,
                password: user_password
              },
        }).then(response => {
            expect(response.status).to.eq(200)
            cy.log(JSON.stringify(response.body.name))
            cy.writeFile('cypress/fixtures/api.json', {
                "user_id": user_id,
                "user_name": user_name,
                "user_email": user_email,
                "user_password": user_password,
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
            url: '/users/delete-account',
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
        url: '/users/register',
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




