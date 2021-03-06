import { Chance } from 'chance'
import { testScreen } from '../support'

const c = new Chance()

testScreen('Escalation Policies', testEP)

function testEP(screen: ScreenFormat) {
  describe('List Page', () => {
    let ep: EP
    beforeEach(() => {
      cy.createEP()
        .then(e => {
          ep = e
        })
        .visit('/escalation-policies')
    })

    it('should handle searching', () => {
      // by name
      cy.pageSearch(ep.name)
      cy.get('body')
        .should('contain', ep.name)
        .should('contain', ep.description)
    })

    it('should link to details page', () => {
      cy.pageSearch(ep.name)
      cy.get('#app')
        .contains(ep.name)
        .click()
      cy.url().should(
        'eq',
        Cypress.config().baseUrl + `/escalation-policies/${ep.id}`,
      )
    })

    describe('Creation', () => {
      it('should allow canceling', () => {
        cy.pageFab()
        cy.dialogTitle('Create Escalation Policy')
        cy.dialogFinish('Cancel')
      })

      it(`should create an EP when submitted`, () => {
        const name = 'SM EP ' + c.word({ length: 8 })
        const description = c.word({ length: 10 })
        const repeat = c.integer({ min: 0, max: 5 }).toString()
        cy.pageFab()

        cy.dialogTitle('Create Escalation Policy')
        cy.dialogForm({ name, description, repeat })
        cy.dialogFinish('Submit')

        // should be on details page
        cy.get('body')
          .should('contain', name)
          .should('contain', description)
      })
    })
  })

  describe('Details Page', () => {
    let ep: EP
    beforeEach(() =>
      cy.createEP().then(e => {
        ep = e
        return cy.visit(`/escalation-policies/${ep.id}`)
      }),
    )

    it('should display correct information', () => {
      cy.get('body')
        .should('contain', ep.name)
        .should('contain', ep.description)
    })

    it('should delete a policy', () => {
      cy.pageAction('Delete Escalation Policy')
      cy.dialogFinish('Confirm')

      cy.url().should('eq', Cypress.config().baseUrl + '/escalation-policies')
      cy.pageSearch(ep.name)
      cy.get('body').should('contain', 'No results')
    })

    it('should edit a policy', () => {
      const name = 'SM EP ' + c.word({ length: 7 })
      const description = c.word({ length: 9 })
      const repeat = c.integer({ min: 0, max: 5 }).toString()

      cy.pageAction('Edit Escalation Policy')
      cy.dialogTitle('Edit Escalation Policy')
      cy.dialogForm({ name, description, repeat })
      cy.dialogFinish('Submit')

      // old name and desc should not be present
      cy.get('body')
        .should('not.contain', ep.name)
        .should('not.contain', ep.description)

      // new ones should
      cy.get('body')
        .should('contain', name)
        .should('contain', description)
    })
  })

  describe('Services Subpage', () => {
    it('should navigate to and from its services', () => {
      cy.createEP().then(ep => {
        cy.visit(`/escalation-policies/${ep.id}`)

        cy.navigateToAndFrom(
          screen,
          'Escalation Policy Details',
          ep.name,
          'Services',
          `${ep.id}/services`,
        )
      })
    })

    it('should see no services text', () => {
      cy.createEP().then(ep => {
        cy.visit(`/escalation-policies/${ep.id}`)

        cy.get('li')
          .contains('Services')
          .click()
        cy.get('body').should(
          'contain',
          'No services are associated with this Escalation Policy',
        )
      })
    })

    it('should see services list', () => {
      cy.createEP().then(ep => {
        cy.createService({ epID: ep.id }).then(svc => {
          cy.visit(`/escalation-policies/${ep.id}`)
          cy.get('li')
            .contains('Services')
            .click()
          cy.get('body').should('contain', svc.name)
        })
      })
    })
  })
}
