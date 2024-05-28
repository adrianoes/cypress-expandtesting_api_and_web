import { faker } from '@faker-js/faker'

describe('/users_api', () => {
    it('Creates a new user account', () => {
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
        cy.logInUser() 
        cy.deleteUser()        
    })
})


// arrumar a documentação. colocar opções em negrito ao invés de colorir e arrumar os botês que precisam ser clicados na documentação. 
// descobrir se tem jeito de colocar o codeblock na frente do texto pra não ficar gigante




























const project = {
    name: `project-${faker.datatype.uuid()}`,
    description: faker.random.words(5)
  }