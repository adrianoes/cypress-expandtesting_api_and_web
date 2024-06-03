describe('/health_ui', () => {

    const baseAppUrl = `${Cypress.env('baseAppUrl')}`

    it('Check the healt of the app website', () => {
        cy.visit(baseAppUrl)                
    })
})