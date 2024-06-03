describe('/health_api', () => {

    const baseApiUrl = `${Cypress.env('baseApiUrl')}`

    it('Check the healt of the API Notes services', () => {
        cy.api({
            method: 'GET',
            url: baseApiUrl + '/health-check',
        }).then(response => {
            expect(response.status).to.eq(200)  
            expect(response.body.message).to.eq("Notes API is Running")
            cy.log(JSON.stringify(response.body.message))
        })                
    })
})