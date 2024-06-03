describe('/users_ui', () => {

    const baseAppUrl = `${Cypress.env('baseAppUrl')}`
    
    beforeEach(function () {
        cy.visit(baseAppUrl)  
    });

    it('Check the healt of the app website', () => {
        cy.get('[href="/notes/app/register"]').contains('Create an account').should('be.visible').click()
    })
})