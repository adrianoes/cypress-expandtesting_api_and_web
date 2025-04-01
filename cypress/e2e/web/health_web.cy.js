describe('/health_web', () => {

    const baseAppUrl = Cypress.env('baseAppUrl')

    it('Check the healt of the app website via WEB', { tags: ['WEB', 'BASIC', 'FULL'] }, () => {
        cy.visit(baseAppUrl)   
        cy.title().should('eq', 'Notes React Application for Automation Testing Practice')
        cy.get('.fw-bold').should('have.text', 'Welcome to Notes App').should('be.visible')
    })
})
