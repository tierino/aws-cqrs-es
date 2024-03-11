import { it } from 'node:test'
import { describe } from 'vitest'

describe('Event broker', () => {
  describe('given there are no events with a position greater than the bookmark', () => {
    it('does nothing until the next poll')
  })

  describe('given there are multiple events with a position greater than the bookmark', () => {
    it('sends all events to the SNS topic')

    describe('given the call to SNS rejects', () => {
      it('does not update the bookmark')
    })

    describe('given the call to SNS suceeds', () => {
      it(
        'updates the bookmark to equal the position of the event with the greatest position'
      )
    })
  })
})
